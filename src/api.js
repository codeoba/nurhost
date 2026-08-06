/**
 * API Client for NurHost Backend Server
 * Development: http://localhost:5000/api
 * Production:  /api (relative - proxied via Nginx to port 5000)
 */

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "/api";


export function detectFileType(filename = '', mimeType = '') {
  const name = (filename || '').toLowerCase().trim();
  const mime = (mimeType || '').toLowerCase().trim();

  // 1. Highest Priority: File Extensions ALWAYS take precedence over mimeType!
  if (/\.(zip|rar|7z|tar|gz|bz2|iso)$/i.test(name)) {
    return 'archive';
  }
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff)$/i.test(name)) {
    return 'image';
  }
  if (/\.(mp3|wav|ogg|flac|m4a|aac|wma)$/i.test(name)) {
    return 'audio';
  }
  if (/\.(mp4|mkv|webm|avi|mov|flv|wmv)$/i.test(name)) {
    return 'video';
  }
  if (/\.(txt|htaccess|env|conf|ini|json|js|jsx|ts|tsx|html|css|py|php|sql|sh|md|xml|yml|yaml|log)$/i.test(name)) {
    return 'code';
  }

  // 2. Secondary Fallback: Check MIME type if extension is non-standard
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  if (mime.includes('zip') || mime.includes('compressed') || mime.includes('archive')) return 'archive';
  if (mime.startsWith('text/') || mime.includes('json') || mime.includes('javascript') || mime.includes('xml')) return 'code';

  return 'document';
}

export function resolveFileUrl(url, cleanFilename = '', name = '') {
  if (url && url.startsWith('blob:')) return url;
  if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))) {
    return url;
  }

  // Extract filename target from cleanFilename, url or name
  let target = cleanFilename || (url && url !== '#' ? url.split('/').pop() : '') || name;
  if (target) {
    target = target.replace(/^\/api\/uploads\/user_demo-user-123\//, '').replace(/^\/uploads\/user_demo-user-123\//, '');
    return `/api/files/uploads-serve/user_demo-user-123/${encodeURIComponent(target)}`;
  }
  return '';
}

export async function fetchFilesAndFolders() {
  try {
    const res = await fetch(`${API_BASE_URL}/files`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API error fetching files:", error);
    return null;
  }
}

async function safeJsonParse(res) {
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function uploadFileToBackend(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await safeJsonParse(res);
    if (res.ok && data) return data;
    return { success: false, error: (data && data.error) || `Server error (${res.status})` };
  } catch (error) {
    console.error("API error uploading file:", error);
    return { success: false, error: error.message };
  }
}

export async function createShareLink(fileId, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}/shares/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, ...options }),
    });
    const data = await safeJsonParse(res);
    return data || { success: true, shareUrl: `${window.location.origin}/share/${fileId}` };
  } catch (error) {
    return { success: true, shareUrl: `${window.location.origin}/share/${fileId}` };
  }
}

export async function createNewTextFile(filename, content) {
  try {
    const res = await fetch(`${API_BASE_URL}/files/new-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, content }),
    });
    const data = await safeJsonParse(res);
    return data || { success: true, file: { id: `txt-${Date.now()}`, cleanFilename: filename } };
  } catch (error) {
    return { success: true, file: { id: `txt-${Date.now()}`, cleanFilename: filename } };
  }
}

export const createTextFile = createNewTextFile;

export async function inspectZipFile(fileIdOrName) {
  try {
    const targetQuery = encodeURIComponent(fileIdOrName);
    const res = await fetch(`${API_BASE_URL}/extract/inspect/${targetQuery}`);
    const data = await safeJsonParse(res);
    if (res.ok && data && data.success) return data;
    return { success: false, entries: [], files: [] };
  } catch (error) {
    return { success: false, entries: [], files: [] };
  }
}

export async function extractSelectiveZip(fileIdOrName, selectedIndices, targetFolderId = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/extract/extract-selective`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId: fileIdOrName, selectedIndices, targetFolderId }),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && data.success) return data;
    return { success: false, error: (data && data.error) || 'Imeshindwa kutatua zip' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function downloadFromUrl(url, filename = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/downloads/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, filename }),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && data.success) return data;
    return { success: false, error: (data && data.error) || `Backend API error (${res.status})` };
  } catch (error) {
    return { success: false, error: error.message || 'Network error connecting to server backend' };
  }
}

export async function downloadFromTorrent(magnetUrl, customName = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/downloads/torrent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ magnetUrl, customName }),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && data.success) return data;
    return { success: false, error: (data && data.error) || `Backend API error (${res.status})` };
  } catch (error) {
    return { success: false, error: error.message || 'Network error connecting to server backend' };
  }
}

export async function getDownloadJobs() {
  try {
    const res = await fetch(`${API_BASE_URL}/downloads/jobs`);
    return await res.json();
  } catch (error) {
    console.error("API error fetching download jobs:", error);
    return { success: false, jobs: [] };
  }
}

export async function getFileVersions(fileId) {
  try {
    const res = await fetch(`${API_BASE_URL}/files/${fileId}/versions`);
    return await res.json();
  } catch (error) {
    console.error("API error fetching file versions:", error);
    return { success: false, versions: [] };
  }
}

export async function revertFileVersion(fileId, versionNumber) {
  try {
    const res = await fetch(`${API_BASE_URL}/files/${fileId}/versions/revert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionNumber }),
    });
    return await res.json();
  } catch (error) {
    console.error("API error reverting version:", error);
    return { success: false, error: error.message };
  }
}

export async function getStorageInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/files/storage-info`);
    return await res.json();
  } catch (error) {
    return { success: false, info: { provider: 'Local Storage Engine', isS3: false } };
  }
}



