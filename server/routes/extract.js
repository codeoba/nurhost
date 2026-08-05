const express = require('express');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const prisma = require('../prismaClient');
const { sanitizeFilename } = require('../utils/sanitizeFilename');
const { uploadToS3 } = require('../utils/s3Storage');

const router = express.Router();

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.zip': 'application/zip'
  };
  return map[ext] || 'application/octet-stream';
}

// 1. Inspect zip file entries without full extraction
router.get('/inspect/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    let fileRecord = null;

    if (prisma && prisma.file) {
      try {
        fileRecord = await prisma.file.findUnique({ where: { id: fileId } });
      } catch (err) {
        console.warn('Prisma query failed, checking uploads folder:', err.message);
      }
    }

    // Fallback search in server/uploads or mock zip
    let zipPath = fileRecord?.path;
    if (!zipPath || !fs.existsSync(zipPath)) {
      const uploadsDir = path.join(__dirname, '../uploads');
      const files = fs.readdirSync(uploadsDir);
      const target = files.find(f => f.includes(fileId) || f.endsWith('.zip'));
      if (target) {
        zipPath = path.join(uploadsDir, target);
      }
    }

    if (!zipPath || !fs.existsSync(zipPath)) {
      return res.status(404).json({ error: 'Physical zip file not found on disk' });
    }

    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    const entries = zipEntries.map((entry, index) => ({
      index,
      entryName: entry.entryName,
      name: entry.name,
      isDirectory: entry.isDirectory,
      size: entry.header.size,
      compressedSize: entry.header.compressedSize,
      cleanName: sanitizeFilename(entry.name || 'unnamed')
    }));

    return res.json({
      fileId,
      totalEntries: entries.length,
      entries
    });
  } catch (error) {
    console.error('Zip inspection error:', error);
    return res.status(500).json({ error: 'Failed to inspect zip file', details: error.message });
  }
});

// 2. Selective or Full Unzip Engine
router.post('/extract-selective', async (req, res) => {
  try {
    const { fileId, selectedIndices, targetFolderId } = req.body;
    const fileRecord = await prisma.file.findUnique({ where: { id: fileId } });

    if (!fileRecord) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!fs.existsSync(fileRecord.path)) {
      return res.status(404).json({ error: 'Physical file not found on server' });
    }

    const zip = new AdmZip(fileRecord.path);
    const zipEntries = zip.getEntries();

    const extractedFiles = [];
    const extractDir = path.join(process.cwd(), 'uploads', `extracted_${Date.now()}`);

    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }

    const indicesToExtract = Array.isArray(selectedIndices) && selectedIndices.length > 0
      ? selectedIndices
      : zipEntries.map((_, i) => i);

    for (const idx of indicesToExtract) {
      const entry = zipEntries[idx];
      if (!entry || entry.isDirectory) continue;

      const rawName = entry.name || path.basename(entry.entryName);
      const cleanName = sanitizeFilename(rawName);

      const targetPath = path.join(extractDir, cleanName);
      zip.extractEntryTo(entry, extractDir, false, true);

      let stats = { size: entry.header.size };
      if (fs.existsSync(targetPath)) {
        stats = fs.statSync(targetPath);
      }
      const mimeType = getMimeType(cleanName);

      const s3Url = await uploadToS3(targetPath, cleanName, fileRecord.userId || 'demo_user');

      const dbFile = await prisma.file.create({
        data: {
          name: cleanName,
          originalName: entry.name,
          mimeType,
          size: stats.size,
          path: targetPath,
          s3Url,
          userId: fileRecord.userId || 'demo_user',
          folderId: targetFolderId || fileRecord.folderId
        }
      });

      extractedFiles.push(dbFile);
    }

    await prisma.extractionJob.create({
      data: {
        zipFileId: fileId,
        extractedFiles: JSON.stringify(extractedFiles.map(f => f.name)),
        status: 'COMPLETED'
      }
    });

    return res.json({
      message: `Successfully extracted ${extractedFiles.length} file(s)`,
      extractedFiles
    });
  } catch (error) {
    console.error('Selective extraction error:', error);
    return res.status(500).json({ error: 'Zip extraction failed', details: error.message });
  }
});

module.exports = router;
