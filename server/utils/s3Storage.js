/**
 * S3 & Multi-Cloud Storage Abstraction Layer (Contabo S3, AWS S3, MinIO, Wasabi)
 * Supports user-isolated folder pathing (/users/{userId}/{cleanFilename})
 * S3 Multipart Chunked Uploads & Local Storage Chunked Fallback.
 */
const { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const path = require("path");

const S3_ENDPOINT = process.env.S3_ENDPOINT || null;
const S3_REGION = process.env.S3_REGION || "us-east-1";
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || null;
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || null;
const S3_BUCKET = process.env.S3_BUCKET || "nurhost-vault";

let s3Client = null;

if (S3_ACCESS_KEY && S3_SECRET_KEY) {
  s3Client = new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
    forcePathStyle: true, // Necessary for Contabo, Wasabi & MinIO
  });
}

const LOCAL_STORAGE_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

// Active local chunk sessions
const activeChunkSessions = new Map();

function getStorageProviderInfo() {
  if (s3Client) {
    const isContabo = S3_ENDPOINT && S3_ENDPOINT.includes('contabostorage.com');
    const isWasabi = S3_ENDPOINT && S3_ENDPOINT.includes('wasabisys.com');
    const isMinIO = S3_ENDPOINT && S3_ENDPOINT.includes('localhost');
    return {
      provider: isContabo ? 'Contabo S3 Object Storage' : isWasabi ? 'Wasabi Hot Cloud Storage' : isMinIO ? 'MinIO Local S3' : 'AWS S3 Object Storage',
      bucket: S3_BUCKET,
      region: S3_REGION,
      isS3: true
    };
  }
  return {
    provider: 'Local Storage Engine (NVMe Storage)',
    path: LOCAL_STORAGE_DIR,
    isS3: false
  };
}

async function uploadFile({ userId, cleanFilename, buffer, mimeType }) {
  const userFolderPath = `users/${userId}/${cleanFilename}`;

  if (s3Client) {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: userFolderPath,
      Body: buffer,
      ContentType: mimeType,
    });
    await s3Client.send(command);
    return {
      storagePath: userFolderPath,
      storageType: "s3",
    };
  } else {
    // Local filesystem storage fallback
    const localUserDir = path.join(LOCAL_STORAGE_DIR, `user_${userId}`);
    if (!fs.existsSync(localUserDir)) {
      fs.mkdirSync(localUserDir, { recursive: true });
    }
    const localFilePath = path.join(localUserDir, cleanFilename);
    fs.writeFileSync(localFilePath, buffer);
    return {
      storagePath: `uploads/user_${userId}/${cleanFilename}`,
      storageType: "local",
      absolutePath: localFilePath,
    };
  }
}

// Resumable Chunked Multipart Upload Engine
async function initChunkedUpload({ userId, cleanFilename, totalChunks, mimeType }) {
  const uploadId = `chunk-session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const userFolderPath = `users/${userId}/${cleanFilename}`;

  if (s3Client) {
    const command = new CreateMultipartUploadCommand({
      Bucket: S3_BUCKET,
      Key: userFolderPath,
      ContentType: mimeType,
    });
    const res = await s3Client.send(command);
    return {
      uploadId: res.UploadId,
      key: userFolderPath,
      isS3: true
    };
  } else {
    const tempDir = path.join(LOCAL_STORAGE_DIR, `temp_chunks_${uploadId}`);
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    activeChunkSessions.set(uploadId, {
      uploadId,
      userId,
      cleanFilename,
      totalChunks,
      tempDir,
      chunksReceived: new Set()
    });

    return { uploadId, isS3: false };
  }
}

async function uploadChunk({ uploadId, chunkIndex, buffer, key }) {
  if (s3Client && key) {
    const command = new UploadPartCommand({
      Bucket: S3_BUCKET,
      Key: key,
      UploadId: uploadId,
      PartNumber: chunkIndex + 1,
      Body: buffer,
    });
    const res = await s3Client.send(command);
    return { ETag: res.ETag, partNumber: chunkIndex + 1 };
  } else {
    const session = activeChunkSessions.get(uploadId);
    if (!session) throw new Error("Chunk session expired or invalid");

    const chunkPath = path.join(session.tempDir, `chunk_${chunkIndex}`);
    fs.writeFileSync(chunkPath, buffer);
    session.chunksReceived.add(chunkIndex);

    return {
      received: session.chunksReceived.size,
      total: session.totalChunks
    };
  }
}

async function completeChunkedUpload({ uploadId, parts, userId, cleanFilename, key }) {
  if (s3Client && key) {
    const command = new CompleteMultipartUploadCommand({
      Bucket: S3_BUCKET,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    });
    await s3Client.send(command);
    return { storagePath: key, storageType: "s3" };
  } else {
    const session = activeChunkSessions.get(uploadId);
    if (!session) throw new Error("Chunk session not found");

    const localUserDir = path.join(LOCAL_STORAGE_DIR, `user_${userId || 'demo'}`);
    if (!fs.existsSync(localUserDir)) fs.mkdirSync(localUserDir, { recursive: true });

    const finalPath = path.join(localUserDir, cleanFilename);
    const writeStream = fs.createWriteStream(finalPath);

    for (let i = 0; i < session.totalChunks; i++) {
      const chunkPath = path.join(session.tempDir, `chunk_${i}`);
      if (fs.existsSync(chunkPath)) {
        const data = fs.readFileSync(chunkPath);
        writeStream.write(data);
        fs.unlinkSync(chunkPath);
      }
    }
    writeStream.end();
    fs.rmdirSync(session.tempDir);
    activeChunkSessions.delete(uploadId);

    return {
      storagePath: `uploads/user_${userId || 'demo'}/${cleanFilename}`,
      storageType: "local",
      absolutePath: finalPath
    };
  }
}

async function getDownloadUrl(storagePath) {
  if (s3Client) {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: storagePath,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } else {
    return `/api/files/download-local?path=${encodeURIComponent(storagePath)}`;
  }
}

async function deleteFile(storagePath) {
  if (s3Client) {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: storagePath,
    });
    await s3Client.send(command);
  } else {
    const fullPath = path.join(__dirname, "..", storagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}

module.exports = {
  getStorageProviderInfo,
  uploadFile,
  initChunkedUpload,
  uploadChunk,
  completeChunkedUpload,
  getDownloadUrl,
  deleteFile,
};
