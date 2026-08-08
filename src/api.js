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
  if (/\.(mp4|mkv|webm|avi|mov|flv|wmv|m4v|3gp|ts|mts|m2ts|vob|ogv|divx|xvid|f4v)$/i.test(name)) {
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

export function resolveFileUrl(url = '', cleanFilename = '', name = '') {
  if (url && url.startsWith('blob:')) return url;

  // 1. Prioritize cleanFilename (actual physical file on server disk)
  if (cleanFilename && cleanFilename.trim()) {
    const clean = cleanFilename.replace(/^\/api\/uploads\/user_demo-user-123\//, '').replace(/^\/uploads\/user_demo-user-123\//, '').trim();
    return `/api/files/uploads-serve/user_demo-user-123/${encodeURIComponent(clean)}`;
  }

  // 2. Local server paths
  if (url && (url.startsWith('/api/') || url.startsWith('/uploads/'))) {
    const clean = url.split('/').pop();
    return `/api/files/uploads-serve/user_demo-user-123/${encodeURIComponent(clean)}`;
  }

  // 3. Fallback for external URLs only if no cleanFilename is available
  if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))) {
    return url;
  }

  const target = (url && url !== '#' ? url.split('/').pop() : '') || name;
  if (target) {
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

export function uploadFileToBackend(file, onProgress) {
  return new Promise((resolve) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/files/upload`);

      if (xhr.upload && typeof onProgress === 'function') {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent, e.loaded, e.total);
          }
        };
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && data) {
            resolve(data);
          } else {
            resolve({ success: false, error: (data && data.error) || `Server error (${xhr.status})` });
          }
        } catch (e) {
          resolve({ success: false, error: `Invalid server response (${xhr.status})` });
        }
      };

      xhr.onerror = () => resolve({ success: false, error: "Network connection error" });
      xhr.send(formData);
    } catch (error) {
      console.error("API error uploading file:", error);
      resolve({ success: false, error: error.message });
    }
  });
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

export async function deleteZipEntryApi(fileIdOrName, entryName) {
  try {
    const res = await fetch(`${API_BASE_URL}/extract/delete-entry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId: fileIdOrName, entryName }),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && data.success) return data;
    return { success: false, error: (data && data.error) || 'Imeshindwa kufuta faili kwenye Zip' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function readZipEntryTextApi(fileIdOrName, entryName) {
  try {
    const res = await fetch(`${API_BASE_URL}/extract/read-entry-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId: fileIdOrName, entryName }),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && data.success) return data;
    return { success: false, content: '' };
  } catch (error) {
    return { success: false, content: '' };
  }
}

export async function updateZipEntryTextApi(fileIdOrName, entryName, text) {
  try {
    const res = await fetch(`${API_BASE_URL}/extract/update-entry-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId: fileIdOrName, entryName, text }),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && data.success) return data;
    return { success: false, error: (data && data.error) || 'Imeshindwa kuhifadhi mabadiliko kwenye Zip' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getUserProfileApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`);
    const data = await safeJsonParse(res);
    if (res.ok && data && data.success) return data;
    return { success: false, user: null };
  } catch (error) {
    return { success: false, user: null };
  }
}

export async function updateUserProfileApi(profileData) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });
    const data = await safeJsonParse(res);
    return data || { success: false, error: 'Imeshindwa kusasisha profile' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function changePasswordApi(currentPassword, newPassword) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await safeJsonParse(res);
    return data || { success: false, error: 'Imeshindwa kubadilisha password' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function setup2FAApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/2fa/setup`, { method: "POST" });
    const data = await safeJsonParse(res);
    return data || { success: false };
  } catch (error) {
    return { success: false };
  }
}

export async function toggle2FAApi(enable) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/2fa/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enable }),
    });
    const data = await safeJsonParse(res);
    return data || { success: false };
  } catch (error) {
    return { success: false };
  }
}

export async function getActivityLogsApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/activity-logs`);
    const data = await safeJsonParse(res);
    if (res.ok && data && data.success) return data;
    return { success: false, logs: [] };
  } catch (error) {
    return { success: false, logs: [] };
  }
}

export async function generateApiKeyApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/api-keys/generate`, { method: "POST" });
    const data = await safeJsonParse(res);
    return data || { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteFileApi(fileId, cleanFilename = '', name = '') {
  try {
    const targetQuery = encodeURIComponent(cleanFilename || name || fileId);
    const res = await fetch(`${API_BASE_URL}/files/${targetQuery}`, {
      method: "DELETE",
    });
    const data = await safeJsonParse(res);
    return data || { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteBatchFilesApi(fileIds = [], filenames = []) {
  try {
    const res = await fetch(`${API_BASE_URL}/files/batch-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileIds, filenames }),
    });
    const data = await safeJsonParse(res);
    return data || { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function downloadZipApi(filenames = [], zipName = 'NurHost_Archive.zip') {
  try {
    const res = await fetch(`${API_BASE_URL}/files/download-zip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filenames, zipName }),
    });

    if (!res.ok) {
      const errData = await safeJsonParse(res);
      throw new Error((errData && errData.error) || `Download failed (${res.status})`);
    }

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = zipName.endsWith('.zip') ? zipName : `${zipName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    return { success: true };
  } catch (error) {
    console.error("downloadZipApi error:", error);
    return { success: false, error: error.message };
  }
}

export async function getDuplicatesApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/files/duplicates`);
    const data = await safeJsonParse(res);
    return data || { success: true, duplicateCount: 0, duplicates: [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function cleanDuplicatesApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/files/clean-duplicates`, {
      method: "POST"
    });
    const data = await safeJsonParse(res);
    return data || { success: true, cleanedCount: 0 };
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



