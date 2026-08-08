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
    const decodedFileId = decodeURIComponent(fileId);
    const uploadsBase = path.join(__dirname, '../uploads');

    let zipPath = null;

    // Recursive search across uploads and subdirectories
    function searchZip(dir) {
      if (!fs.existsSync(dir)) return null;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          const found = searchZip(full);
          if (found) return found;
        } else if (
          item === decodedFileId ||
          item.endsWith(decodedFileId) ||
          item.includes(decodedFileId) ||
          item.toLowerCase().includes(decodedFileId.toLowerCase().replace(/[\s\-_()]+/g, ''))
        ) {
          if (full.endsWith('.zip') || item.includes('.zip')) {
            return full;
          }
        }
      }
      return null;
    }

    zipPath = searchZip(uploadsBase);

    // Fallback: search for the latest .zip file on disk
    if (!zipPath) {
      function findLatestZip(dir) {
        if (!fs.existsSync(dir)) return null;
        let newest = null;
        let newestTime = 0;
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const full = path.join(dir, item);
          const stat = fs.statSync(full);
          if (stat.isDirectory()) {
            const subZip = findLatestZip(full);
            if (subZip && subZip.time > newestTime) {
              newest = subZip.path;
              newestTime = subZip.time;
            }
          } else if (item.endsWith('.zip')) {
            if (stat.mtimeMs > newestTime) {
              newest = full;
              newestTime = stat.mtimeMs;
            }
          }
        }
        return newest ? { path: newest, time: newestTime } : null;
      }

      const latestObj = findLatestZip(uploadsBase);
      if (latestObj) zipPath = latestObj.path;
    }

    if (!zipPath || !fs.existsSync(zipPath)) {
      return res.status(404).json({ success: false, error: 'Physical zip file not found on disk' });
    }

    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    const entries = zipEntries
      .filter(entry => !entry.isDirectory)
      .map((entry, index) => ({
        index,
        entryName: entry.entryName,
        name: entry.name || path.basename(entry.entryName),
        isDirectory: entry.isDirectory,
        size: entry.header.size,
        compressedSize: entry.header.compressedSize,
        cleanName: sanitizeFilename(entry.name || 'unnamed').cleanFilename
      }));

    return res.json({
      success: true,
      fileId,
      totalEntries: entries.length,
      entries
    });
  } catch (error) {
    console.error('Zip inspection error:', error);
    return res.status(500).json({ success: false, error: 'Failed to inspect zip file', details: error.message });
  }
});

// 2. Selective or Full Unzip Engine
router.post('/extract-selective', async (req, res) => {
  try {
    const { fileId, selectedIndices, targetFolderId } = req.body;
    const decodedFileId = decodeURIComponent(fileId);
    const uploadsBase = path.join(__dirname, '../uploads');

    let zipPath = null;

    function searchZip(dir) {
      if (!fs.existsSync(dir)) return null;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          const found = searchZip(full);
          if (found) return found;
        } else if (
          item === decodedFileId ||
          item.endsWith(decodedFileId) ||
          item.includes(decodedFileId)
        ) {
          if (full.endsWith('.zip') || item.includes('.zip')) {
            return full;
          }
        }
      }
      return null;
    }

    zipPath = searchZip(uploadsBase);

    if (!zipPath || !fs.existsSync(zipPath)) {
      return res.status(404).json({ success: false, error: 'Physical zip file not found on server disk' });
    }

    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    const extractedFiles = [];
    const extractDir = path.join(__dirname, '../uploads/user_demo-user-123');

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
      const cleanName = sanitizeFilename(rawName).cleanFilename;
      const timestampedName = `${Date.now()}_${cleanName}`;
      const targetPath = path.join(extractDir, timestampedName);

      zip.extractEntryTo(entry, extractDir, false, true);

      // Rename extracted entry to timestamped format
      const defaultExtractedPath = path.join(extractDir, entry.name || path.basename(entry.entryName));
      if (fs.existsSync(defaultExtractedPath) && defaultExtractedPath !== targetPath) {
        fs.renameSync(defaultExtractedPath, targetPath);
      }

      let stats = { size: entry.header.size };
      if (fs.existsSync(targetPath)) {
        stats = fs.statSync(targetPath);
      }
      const mimeType = getMimeType(cleanName);
      const relativePath = `/api/files/uploads-serve/user_demo-user-123/${timestampedName}`;

      extractedFiles.push({
        id: `extracted_${Date.now()}_${idx}`,
        name: cleanName,
        originalFilename: cleanName,
        cleanFilename: timestampedName,
        mimeType,
        size: stats.size,
        sizeFormatted: stats.size >= 1024 * 1024 ? `${(stats.size / (1024 * 1024)).toFixed(1)} MB` : `${(stats.size / 1024).toFixed(1)} KB`,
        storagePath: relativePath,
        url: relativePath,
        folderId: targetFolderId || null,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    }

    return res.json({
      success: true,
      message: `Mafaili ${extractedFiles.length} yametolewa kikamilifu!`,
      extractedFiles
    });
  } catch (error) {
    console.error('Selective extraction error:', error);
    return res.status(500).json({ success: false, error: 'Zip extraction failed', details: error.message });
  }
});

// 3. Delete specific entry directly inside zip archive on disk
router.post('/delete-entry', async (req, res) => {
  try {
    const { fileId, entryName } = req.body;
    const decodedFileId = decodeURIComponent(fileId);
    const uploadsBase = path.join(__dirname, '../uploads');

    function searchZip(dir) {
      if (!fs.existsSync(dir)) return null;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          const found = searchZip(full);
          if (found) return found;
        } else if (item === decodedFileId || item.endsWith(decodedFileId) || item.includes(decodedFileId)) {
          if (full.endsWith('.zip') || item.includes('.zip')) return full;
        }
      }
      return null;
    }

    const zipPath = searchZip(uploadsBase);
    if (!zipPath || !fs.existsSync(zipPath)) {
      return res.status(404).json({ success: false, error: 'Zip file not found on disk' });
    }

    const zip = new AdmZip(zipPath);
    zip.deleteFile(entryName);
    zip.writeZip(zipPath);

    const updatedEntries = zip.getEntries()
      .filter(e => !e.isDirectory)
      .map((e, i) => ({
        index: i,
        entryName: e.entryName,
        name: e.name || path.basename(e.entryName),
        size: e.header.size,
        cleanName: sanitizeFilename(e.name || 'unnamed').cleanFilename
      }));

    return res.json({
      success: true,
      message: `Faili "${entryName}" limefutwa kutoka ndani ya Zip!`,
      totalEntries: updatedEntries.length,
      entries: updatedEntries
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Read text content of entry inside zip archive
router.post('/read-entry-text', async (req, res) => {
  try {
    const { fileId, entryName } = req.body;
    const decodedFileId = decodeURIComponent(fileId);
    const uploadsBase = path.join(__dirname, '../uploads');

    function searchZip(dir) {
      if (!fs.existsSync(dir)) return null;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          const found = searchZip(full);
          if (found) return found;
        } else if (item === decodedFileId || item.endsWith(decodedFileId) || item.includes(decodedFileId)) {
          if (full.endsWith('.zip') || item.includes('.zip')) return full;
        }
      }
      return null;
    }

    const zipPath = searchZip(uploadsBase);
    if (!zipPath || !fs.existsSync(zipPath)) {
      return res.status(404).json({ success: false, error: 'Zip file not found on disk' });
    }

    const zip = new AdmZip(zipPath);
    const content = zip.readAsText(entryName);

    return res.json({
      success: true,
      entryName,
      content: content || ''
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Update text content of entry directly inside zip archive
router.post('/update-entry-text', async (req, res) => {
  try {
    const { fileId, entryName, text } = req.body;
    const decodedFileId = decodeURIComponent(fileId);
    const uploadsBase = path.join(__dirname, '../uploads');

    function searchZip(dir) {
      if (!fs.existsSync(dir)) return null;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          const found = searchZip(full);
          if (found) return found;
        } else if (item === decodedFileId || item.endsWith(decodedFileId) || item.includes(decodedFileId)) {
          if (full.endsWith('.zip') || item.includes('.zip')) return full;
        }
      }
      return null;
    }

    const zipPath = searchZip(uploadsBase);
    if (!zipPath || !fs.existsSync(zipPath)) {
      return res.status(404).json({ success: false, error: 'Zip file not found on disk' });
    }

    const zip = new AdmZip(zipPath);
    zip.updateFile(entryName, Buffer.from(text, 'utf-8'));
    zip.writeZip(zipPath);

    return res.json({
      success: true,
      message: `Maudhui ya "${entryName}" yamehifadhiwa ndani ya Zip!`,
      entryName
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
