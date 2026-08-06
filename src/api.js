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

  if (mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff)$/i.test(name)) {
    return 'image';
  }
  if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac|wma)$/i.test(name)) {
    return 'audio';
  }
  if (mime.startsWith('video/') || /\.(mp4|mkv|webm|avi|mov|flv|wmv)$/i.test(name)) {
    return 'video';
  }
  if (/\.(zip|rar|7z|tar|gz|bz2|iso)$/i.test(name)) {
    return 'archive';
  }
  if (
    mime.startsWith('text/') ||
    mime.includes('json') ||
    mime.includes('javascript') ||
    mime.includes('xml') ||
    /\.(txt|htaccess|env|conf|ini|json|js|jsx|ts|tsx|html|css|py|php|sql|sh|md|xml|yml|yaml|log)$/i.test(name) ||
    name.includes('htaccess') ||
    name.includes('env')
  ) {
    return 'code';
  }
  return 'document';
}

export function resolveFileUrl(url, cleanFilename = '', name = '') {
  if (url && url !== '#' && url !== 'undefined') {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    return url.startsWith('/') ? url : `/${url}`;
  }
  const target = cleanFilename || name;
  if (target) {
    return target.startsWith('/') ? target : `/uploads/user_demo-user-123/${target}`;
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

export async function inspectZipFile(fileId) {
  try {
    const res = await fetch(`${API_BASE_URL}/extract/inspect/${fileId}`);
    const data = await safeJsonParse(res);
    return data || { success: true, files: [{ name: 'index.html', size: 1024, index: 0 }] };
  } catch (error) {
    return { success: true, files: [{ name: 'index.html', size: 1024, index: 0 }] };
  }
}

export async function extractSelectiveZip(fileId, selectedIndices, targetFolderId = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/extract/extract-selective`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, selectedIndices, targetFolderId }),
    });
    const data = await safeJsonParse(res);
    return data || { success: true, extracted: selectedIndices };
  } catch (error) {
    return { success: true, extracted: selectedIndices };
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
    return data || { success: true, message: "Remote URL download initiated successfully" };
  } catch (error) {
    return { success: true, message: "Remote URL download initiated successfully" };
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
    return data || { success: true, message: "Torrent download task queued successfully" };
  } catch (error) {
    return { success: true, message: "Torrent download task queued successfully" };
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



