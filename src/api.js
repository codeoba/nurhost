/**
 * API Client for NurHost Backend Server (http://localhost:5000/api)
 */

const API_BASE_URL = "http://localhost:5000/api";

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

export async function uploadFileToBackend(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
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
    return await res.json();
  } catch (error) {
    console.error("API error creating share link:", error);
    return { success: false, error: error.message };
  }
}

export async function createNewTextFile(filename, content) {
  try {
    const res = await fetch(`${API_BASE_URL}/files/new-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, content }),
    });
    return await res.json();
  } catch (error) {
    console.error("API error creating text file:", error);
    return { success: false, error: error.message };
  }
}

export const createTextFile = createNewTextFile;

export async function inspectZipFile(fileId) {
  try {
    const res = await fetch(`${API_BASE_URL}/extract/inspect/${fileId}`);
    return await res.json();
  } catch (error) {
    console.error("API error inspecting zip file:", error);
    throw error;
  }
}

export async function extractSelectiveZip(fileId, selectedIndices, targetFolderId = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/extract/extract-selective`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, selectedIndices, targetFolderId }),
    });
    return await res.json();
  } catch (error) {
    console.error("API error extracting zip:", error);
    throw error;
  }
}

export async function downloadFromUrl(url, filename = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/downloads/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, filename }),
    });
    return await res.json();
  } catch (error) {
    console.error("API error downloading from URL:", error);
    return { success: false, error: error.message };
  }
}

export async function downloadFromTorrent(magnetUrl, customName = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/downloads/torrent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ magnetUrl, customName }),
    });
    return await res.json();
  } catch (error) {
    console.error("API error downloading torrent:", error);
    return { success: false, error: error.message };
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



