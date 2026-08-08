const express = require("express");
const router = express.Router();
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { sanitizeFilename } = require("../utils/sanitizeFilename");
const { 
  uploadFile, 
  initChunkedUpload, 
  uploadChunk, 
  completeChunkedUpload, 
  getDownloadUrl, 
  deleteFile, 
  getStorageProviderInfo 
} = require("../utils/s3Storage");

const uploadsDir = path.join(__dirname, "../uploads/user_demo-user-123");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer diskStorage streams directly to disk to prevent RAM crash on large uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const { cleanFilename } = sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}_${cleanFilename}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2000 * 1024 * 1024 }, // 2GB max file upload limit
});

const DEMO_USER_ID = "demo-user-123";

// In-memory File Versioning store
const fileVersionsStore = new Map();

// Helper to record file version
function addFileVersion(fileId, filename, contentOrPath, changeSummary = "Updated version") {
  if (!fileVersionsStore.has(fileId)) {
    fileVersionsStore.set(fileId, []);
  }
  const history = fileVersionsStore.get(fileId);
  const versionNum = history.length + 1;
  const versionRecord = {
    id: `v-${fileId}-${versionNum}`,
    fileId,
    versionNumber: versionNum,
    filename,
    changeSummary,
    sizeFormatted: `${(contentOrPath.length / 1024).toFixed(1)} KB`,
    content: typeof contentOrPath === 'string' ? contentOrPath : null,
    createdAt: new Date().toISOString()
  };
  history.unshift(versionRecord);
  return versionRecord;
}

// GET /api/files/uploads-serve/:userDir/:filename - High-Performance HTTP Range Streaming Engine
router.get("/uploads-serve/:userDir/:filename", (req, res) => {
  try {
    const { userDir, filename } = req.params;
    const decodedFilename = decodeURIComponent(filename);
    const userFolderPath = path.join(__dirname, "../uploads", userDir);

    if (!fs.existsSync(userFolderPath)) {
      return res.status(404).send("User directory not found");
    }

    let filePath = null;

    // 1. Direct match
    const exactPath = path.join(userFolderPath, decodedFilename);
    if (fs.existsSync(exactPath) && fs.statSync(exactPath).isFile()) {
      filePath = exactPath;
    } else {
      // 2. Fuzzy match against timestamped filenames on disk
      const filesOnDisk = fs.readdirSync(userFolderPath);
      const cleanTarget = decodedFilename.replace(/[\s\-_()]+/g, '').toLowerCase();

      const matchedFile = filesOnDisk.find(f => {
        const cleanDisk = f.replace(/^\d+_/, '').replace(/[\s\-_()]+/g, '').toLowerCase();
        return cleanDisk === cleanTarget || f.endsWith(decodedFilename) || f.toLowerCase().includes(cleanTarget);
      });

      if (matchedFile) {
        filePath = path.join(userFolderPath, matchedFile);
      }
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).send("File not found on server disk");
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Determine MIME type for Range Streaming
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.mp4': 'video/mp4',
      '.mkv': 'video/mp4',
      '.webm': 'video/webm',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.flv': 'video/x-flv',
      '.wmv': 'video/x-ms-wmv',
      '.m4v': 'video/mp4',
      '.3gp': 'video/3gpp',
      '.ts': 'video/mp2t',
      '.mts': 'video/mp2t',
      '.m2ts': 'video/mp2t',
      '.vob': 'video/dvd',
      '.ogv': 'video/ogg',
      '.divx': 'video/divx',
      '.xvid': 'video/x-msvideo',
      '.f4v': 'video/x-f4v',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.flac': 'audio/flac',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
      '.opus': 'audio/opus',
      '.wma': 'audio/x-ms-wma',
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // HTTP Range Streaming Engine for smooth Video & Audio Seeking/Playback (206 Partial Content)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).setHeader("Content-Range", `bytes */${fileSize}`);
        return res.end();
      }

      const chunksize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600"
      });

      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600"
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error("Error serving file stream:", err);
    return res.status(500).send("Error serving file stream");
  }
});

// Helper to check if file on disk is a Zip archive by reading PK magic bytes
function isZipFileOnDisk(filePath) {
  try {
    if (!fs.existsSync(filePath)) return false;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() || stat.size < 4) return false;

    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(4);
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);

    return buffer[0] === 0x50 && buffer[1] === 0x4B; // PK magic bytes
  } catch (e) {
    return false;
  }
}

// GET /api/files - Get List of All Files
router.get("/", (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ success: true, files: [] });
    }
    const fileList = fs.readdirSync(uploadsDir);
    const files = fileList.map((fname, i) => {
      const fullPath = path.join(uploadsDir, fname);
      const stats = fs.statSync(fullPath);
      let originalName = fname.replace(/^\d+_/, '');

      const isZipOnDisk = isZipFileOnDisk(fullPath);
      const isZipByName = /\.(zip|rar|7z|tar|gz|bz2|iso)$/i.test(originalName) || originalName.toLowerCase().includes('pro') || originalName.toLowerCase().includes('crack') || originalName.toLowerCase().includes('setup') || originalName.toLowerCase().includes('driver') || originalName.toLowerCase().includes('booster') || originalName.toLowerCase().includes('iobit');
      const isZip = isZipOnDisk || isZipByName;

      if (isZip && !/\.(zip|rar|7z|iso|tar|gz)$/i.test(originalName)) {
        originalName = `${originalName}.zip`;
      }

      const isImg = !isZip && /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(originalName);
      const isVideo = !isZip && /\.(mp4|mkv|webm|avi|mov|flv|wmv|m4v|3gp|ts|mts|m2ts|vob|ogv|divx|xvid|f4v)$/i.test(originalName);
      const isAudio = !isZip && /\.(mp3|wav|ogg|flac|m4a|aac|opus|wma)$/i.test(originalName);
      const isCode = !isZip && (/\.(txt|htaccess|env|conf|ini|json|js|jsx|ts|tsx|html|css|py|php|sql|sh|md|xml|yml|yaml)$/i.test(originalName) || originalName.includes('htaccess') || originalName.includes('env'));

      const type = isZip ? 'archive' : isImg ? 'image' : isVideo ? 'video' : isAudio ? 'audio' : isCode ? 'code' : 'document';
      const mimeType = isZip ? 'application/zip' : isImg ? 'image/jpeg' : isVideo ? 'video/mp4' : isAudio ? 'audio/mpeg' : 'application/octet-stream';

      const displaySize = stats.size;
      const sizeFormatted = displaySize >= 1024 * 1024
        ? `${(displaySize / (1024 * 1024)).toFixed(1)} MB`
        : `${(displaySize / 1024).toFixed(1)} KB`;

      return {
        id: `srv-file-${i}-${Math.round(stats.mtimeMs)}`,
        name: originalName,
        originalFilename: originalName,
        cleanFilename: fname,
        type,
        mimeType,
        size: displaySize,
        sizeFormatted,
        storagePath: `/api/uploads/user_demo-user-123/${fname}`,
        url: `/api/uploads/user_demo-user-123/${fname}`,
        folderId: null,
        isStarred: false,
        isShared: false,
        inTrash: false,
        updatedAt: stats.mtime.toISOString(),
        createdAt: stats.birthtime.toISOString(),
      };
    });
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/files/storage-info - Storage provider info (Contabo S3 / AWS S3 / Local)
router.get("/storage-info", (req, res) => {
  const info = getStorageProviderInfo();
  res.json({ success: true, info });
});

// GET /api/files/:id/versions - Get file version history
router.get("/:id/versions", (req, res) => {
  const { id } = req.params;
  const history = fileVersionsStore.get(id) || [];
  res.json({ success: true, versions: history });
});

// POST /api/files/:id/versions/revert - Revert file to a specific version number
router.post("/:id/versions/revert", (req, res) => {
  const { id } = req.params;
  const { versionNumber } = req.body;
  const history = fileVersionsStore.get(id) || [];
  const targetVersion = history.find(v => v.versionNumber === Number(versionNumber));

  if (!targetVersion) {
    return res.status(404).json({ error: `Toleo namba ${versionNumber} halijapatikana.` });
  }

  // Create revert entry
  const revertedRecord = addFileVersion(id, targetVersion.filename, targetVersion.content || '', `Reverted to version ${versionNumber}`);

  res.json({
    success: true,
    message: `Faili limerudishwa kwenye Toleo Namba ${versionNumber}`,
    version: revertedRecord
  });
});

// POST /api/files/upload - Single/Multi File Upload with Sanitation
router.post("/upload", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Faili ni kubwa mno (Ziada ya 2GB limit).' : err.message;
      return res.status(400).json({ success: false, error: msg });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "Hakuna faili lililochaguliwa" });
      }

      const { originalname, size, filename, mimetype, path: filePath } = req.file;
      const { cleanFilename, originalFilename } = sanitizeFilename(originalname);

      const fileId = `file_${Date.now()}`;
      const relativeStoragePath = `/api/uploads/user_demo-user-123/${filename}`;

      const fileMeta = {
        id: fileId,
        originalFilename,
        cleanFilename,
        mimeType: mimetype || 'application/octet-stream',
        sizeBytes: size,
        size: `${(size / (1024 * 1024)).toFixed(2)} MB`,
        storagePath: relativeStoragePath,
        url: relativeStoragePath,
        createdAt: new Date().toISOString(),
      };

      // Save initial version record
      addFileVersion(fileId, cleanFilename, filename, "Initial Upload");

      return res.json({
        success: true,
        message: "Faili limepakiwa kikamilifu",
        file: fileMeta,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });
});

// POST /api/files/new-text - Create New Text File Directly (Monaco Editor support)
router.post("/new-text", async (req, res) => {
  try {
    const { fileId, filename = "untitled.txt", content = "", changeSummary = "Saved in Monaco Editor" } = req.body;
    const { cleanFilename, originalFilename } = sanitizeFilename(filename);

    const buffer = Buffer.from(content, "utf-8");
    const storageResult = await uploadFile({
      userId: DEMO_USER_ID,
      cleanFilename,
      buffer,
      mimeType: "text/plain",
    });

    const targetFileId = fileId || `file_${Date.now()}`;
    const version = addFileVersion(targetFileId, cleanFilename, content, changeSummary);

    res.json({
      success: true,
      file: {
        id: targetFileId,
        originalFilename,
        cleanFilename,
        mimeType: "text/plain",
        storagePath: storageResult.storagePath,
        size: `${buffer.length} Bytes`,
      },
      version
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/files/init-chunked - Start Chunked Resumable Upload Session
router.post("/init-chunked", async (req, res) => {
  try {
    const { filename, totalChunks, mimeType } = req.body;
    const { cleanFilename } = sanitizeFilename(filename);

    const session = await initChunkedUpload({
      userId: DEMO_USER_ID,
      cleanFilename,
      totalChunks,
      mimeType: mimeType || 'application/octet-stream'
    });

    res.json({ success: true, session, cleanFilename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/files/upload-chunk - Upload Chunk
router.post("/upload-chunk", upload.single("chunk"), async (req, res) => {
  try {
    const { uploadId, chunkIndex, key } = req.body;
    if (!req.file) return res.status(400).json({ error: "No chunk data provided" });

    const result = await uploadChunk({
      uploadId,
      chunkIndex: Number(chunkIndex),
      buffer: req.file.buffer,
      key
    });

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/files/complete-chunked - Complete Chunked Upload Session
router.post("/complete-chunked", async (req, res) => {
  try {
    const { uploadId, parts, cleanFilename, key } = req.body;
    const storageResult = await completeChunkedUpload({
      uploadId,
      parts,
      userId: DEMO_USER_ID,
      cleanFilename,
      key
    });

    const fileMeta = {
      id: `file_${Date.now()}`,
      originalFilename: cleanFilename,
      cleanFilename,
      mimeType: "application/octet-stream",
      storagePath: storageResult.storagePath,
      createdAt: new Date().toISOString(),
    };

    res.json({ success: true, message: "Resumable chunked upload completed!", file: fileMeta });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to delete physical file from disk recursively
function deleteFileFromDisk(identifier) {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) return false;

  const rawTarget = decodeURIComponent(identifier || '').trim();
  if (!rawTarget) return false;

  // Clean target identifiers (remove srv-file- prefixes or url paths)
  const cleanTarget = rawTarget
    .replace(/^srv-file-\d+-/i, '')
    .replace(/\/api\/files\/uploads-serve\/[^\/]+\//i, '')
    .replace(/^[^\_]+_/, '') // remove timestamp prefix if needed
    .trim();

  let deletedAny = false;

  function searchAndDelete(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        continue;
      }
      if (stat.isDirectory()) {
        searchAndDelete(fullPath);
      } else {
        const diskOriginalName = item.replace(/^\d+_/, '');
        const diskTimestampedName = item;

        // Check for exact or partial matches
        const matches = (
          item === rawTarget ||
          diskOriginalName === rawTarget ||
          diskTimestampedName === rawTarget ||
          (cleanTarget && item.includes(cleanTarget)) ||
          (cleanTarget && diskOriginalName.includes(cleanTarget)) ||
          (rawTarget.length > 5 && fullPath.includes(rawTarget))
        );

        if (matches) {
          try {
            fs.unlinkSync(fullPath);
            console.log(`🗑️ Permanently deleted physical file from disk: ${fullPath}`);
            deletedAny = true;
          } catch (e) {
            console.warn(`Could not delete file ${fullPath}:`, e.message);
          }
        }
      }
    }
  }

  searchAndDelete(uploadsDir);
  return deletedAny;
}

// POST /api/files/batch-delete - Delete multiple files permanently from disk
router.post('/batch-delete', async (req, res) => {
  try {
    const { fileIds = [], filenames = [] } = req.body;
    const targets = [...fileIds, ...filenames];

    for (const target of targets) {
      if (target) {
        deleteFileFromDisk(target);
      }
    }

    return res.json({ success: true, message: 'Batch permanent deletion completed' });
  } catch (error) {
    console.error('Batch delete error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/files/:id - Delete single file permanently from disk
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deleteFileFromDisk(id);

    return res.json({
      success: true,
      message: deleted ? `File "${id}" permanently deleted from disk.` : `File record removed.`
    });
  } catch (error) {
    console.error('File delete error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
