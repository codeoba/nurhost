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

// GET /api/files - Fetch all files saved on server disk storage
router.get("/", (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ success: true, files: [] });
    }
    const fileList = fs.readdirSync(uploadsDir);
    const files = fileList.map((fname, i) => {
      const fullPath = path.join(uploadsDir, fname);
      const stats = fs.statSync(fullPath);
      const originalName = fname.replace(/^\d+_/, '');
      const isAudio = /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(originalName);
      const isVideo = /\.(mp4|mkv|webm|avi|mov|flv)$/i.test(originalName);
      const isImg = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(originalName);
      const isZip = /\.(zip|rar|7z|tar|gz|bz2)$/i.test(originalName);
      const isCode = /\.(txt|htaccess|env|conf|ini|json|js|jsx|ts|tsx|html|css|py|php|sql|sh|md|xml|yml|yaml)$/i.test(originalName) || originalName.includes('htaccess') || originalName.includes('env');
      const type = isAudio ? 'audio' : isVideo ? 'video' : isImg ? 'image' : isZip ? 'archive' : isCode ? 'code' : 'document';
      const mimeType = isImg ? 'image/jpeg' : isVideo ? 'video/mp4' : isAudio ? 'audio/mpeg' : 'application/octet-stream';

      return {
        id: `srv-file-${i}-${Math.round(stats.mtimeMs)}`,
        name: originalName,
        originalFilename: originalName,
        cleanFilename: fname,
        type,
        mimeType,
        size: stats.size,
        sizeFormatted: `${(stats.size / (1024 * 1024)).toFixed(1)} MB`,
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
  const history = fileVersionsStore.get(id) || [
    {
      id: `v-${id}-1`,
      fileId: id,
      versionNumber: 1,
      filename: "original_file",
      changeSummary: "Initial Upload",
      sizeFormatted: "1.2 MB",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
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

// GET /api/files/:id/download - Get download presigned URL
router.get("/:id/download", async (req, res) => {
  try {
    const downloadUrl = await getDownloadUrl(`users/${DEMO_USER_ID}/demo_file.pdf`);
    res.json({ success: true, downloadUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
