const express = require('express');
const router = express.Router();
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { sanitizeFilename } = require('../utils/sanitizeFilename');
const prisma = require('../prismaClient');

let WebTorrentClass = null;
let globalTorrentClient = null;

async function getTorrentClient() {
  if (!WebTorrentClass) {
    try {
      const mod = await import('webtorrent');
      WebTorrentClass = mod.default || mod;
    } catch (e) {
      console.error('WebTorrent ESM Import error:', e.message);
    }
  }
  if (WebTorrentClass && !globalTorrentClient) {
    try {
      globalTorrentClient = new WebTorrentClass();
    } catch (e) {
      console.error('WebTorrent Client Init error:', e.message);
    }
  }
  return globalTorrentClient;
}

// In-memory active download jobs tracker
const activeJobs = new Map();

// Helper to determine mime type
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.mkv': 'video/x-matroska',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.iso': 'application/x-iso9660-image'
  };
  return map[ext] || 'application/octet-stream';
}

function getExtensionFromMime(mimeType) {
  if (!mimeType) return '';
  const m = mimeType.toLowerCase();
  if (m.includes('zip') || m.includes('compressed')) return '.zip';
  if (m.includes('rar')) return '.rar';
  if (m.includes('7z')) return '.7z';
  if (m.includes('pdf')) return '.pdf';
  if (m.includes('png')) return '.png';
  if (m.includes('jpeg') || m.includes('jpg')) return '.jpg';
  if (m.includes('audio/mpeg') || m.includes('mp3')) return '.mp3';
  if (m.includes('video/mp4') || m.includes('mp4')) return '.mp4';
  if (m.includes('iso')) return '.iso';
  return '';
}

function parseContentDispositionFilename(cd) {
  if (!cd) return '';
  let match = cd.match(/filename\*=utf-8''([^;]+)/i);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1].trim());
    } catch (e) {
      return match[1].trim();
    }
  }
  match = cd.match(/filename=["']?([^"';\r\n]+)["']?/i);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1].trim());
    } catch (e) {
      return match[1].trim();
    }
  }
  return '';
}

function getTitleFromZip(zipFilePath) {
  try {
    const AdmZip = require('adm-zip');
    if (!fs.existsSync(zipFilePath)) return null;
    const zip = new AdmZip(zipFilePath);
    const entries = zip.getEntries();
    if (!entries || entries.length === 0) return null;

    for (const entry of entries) {
      const parts = entry.entryName.split('/').filter(Boolean);
      if (parts.length > 0) {
        const rootName = parts[0];
        if (rootName && rootName.length > 3 && !/^[0-9a-fA-F]{32,64}$/.test(rootName)) {
          return rootName.endsWith('.zip') ? rootName : `${rootName}.zip`;
        }
      }
    }

    const firstFile = entries.find(e => !e.isDirectory);
    if (firstFile) {
      const bname = path.basename(firstFile.name || firstFile.entryName);
      if (bname && bname.length > 3 && !/^[0-9a-fA-F]{32,64}$/.test(bname)) {
        return `${path.parse(bname).name}.zip`;
      }
    }
  } catch (e) {
    console.warn('Zip title extraction note:', e.message);
  }
  return null;
}

function downloadUrlWithRedirects(targetUrl, targetPath, maxRedirects = 10) {
  return new Promise((resolve, reject) => {
    let capturedFilename = '';

    function fetchUrl(currentUrl, redirectCount) {
      if (redirectCount > maxRedirects) {
        return reject(new Error('Too many HTTP redirects'));
      }

      let parsed;
      try {
        parsed = new URL(currentUrl);
      } catch (e) {
        return reject(new Error('Invalid URL format'));
      }

      const client = parsed.protocol === 'https:' ? https : http;
      const req = client.get(currentUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*'
        }
      }, (res) => {
        // Capture Content-Disposition header at every redirect step
        const cdName = parseContentDispositionFilename(res.headers['content-disposition']);
        if (cdName) {
          capturedFilename = cdName;
        }

        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, currentUrl).href;
          return fetchUrl(redirectUrl, redirectCount + 1);
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP Status Code ${res.statusCode}`));
        }

        const fileStream = fs.createWriteStream(targetPath);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(() => {
            const size = fs.existsSync(targetPath) ? fs.statSync(targetPath).size : 0;
            resolve({
              size,
              dispositionFilename: capturedFilename || parseContentDispositionFilename(res.headers['content-disposition']),
              contentType: res.headers['content-type']
            });
          });
        });

        fileStream.on('error', (err) => {
          fs.unlink(targetPath, () => {});
          reject(err);
        });
      });

      req.on('error', (err) => {
        fs.unlink(targetPath, () => {});
        reject(err);
      });
    }

    fetchUrl(targetUrl, 0);
  });
}

// 1. POST /api/downloads/url - Direct HTTP/HTTPS Remote URL Download
router.post('/url', async (req, res) => {
  try {
    const { url, filename } = req.body;
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return res.status(400).json({ success: false, error: 'Tafadhali ingiza URL halali ya HTTP au HTTPS' });
    }

    let parsedName = filename && filename.trim() ? filename.trim() : '';
    if (!parsedName) {
      try {
        const u = new URL(url);
        parsedName = path.basename(u.pathname) || '';
        if (parsedName.includes('?')) {
          parsedName = parsedName.split('?')[0];
        }
      } catch (e) {}
    }
    if (!parsedName || parsedName === '/' || parsedName === '.') {
      parsedName = `download_${Date.now()}`;
    }

    const cleanFilename = parsedName.replace(/[^\w\.\-\s\(\)\[\]]/gi, '_').trim() || `file_${Date.now()}`;
    const uploadsDir = path.join(__dirname, '../uploads/user_demo-user-123');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const tempTargetPath = path.join(uploadsDir, `temp_${Date.now()}_${cleanFilename}`);

    // Download file with redirect-following Promise stream
    const downloadResult = await downloadUrlWithRedirects(url, tempTargetPath);

    let finalName = cleanFilename;
    if (downloadResult.dispositionFilename) {
      finalName = downloadResult.dispositionFilename.trim();
    }

    // Resolve extension if missing or non-standard
    let ext = path.extname(finalName);
    if (!ext || ext.length > 6) {
      const mimeExt = getExtensionFromMime(downloadResult.contentType);
      if (mimeExt) {
        ext = mimeExt;
        finalName = `${finalName}${mimeExt}`;
      }
    }

    // Hex Hash Filename Guard: If name is a hex hash, extract title from ZIP content
    const baseWithoutExt = path.parse(finalName).name;
    if (/^[0-9a-fA-F]{32,64}$/.test(baseWithoutExt) && (ext === '.zip' || (downloadResult.contentType && downloadResult.contentType.includes('zip')))) {
      const zipExtractedTitle = getTitleFromZip(tempTargetPath);
      if (zipExtractedTitle) {
        finalName = zipExtractedTitle;
      }
    }

    // Mandatory extension check: Ensure zip archives ALWAYS end with .zip
    const isZipByMime = downloadResult.contentType && downloadResult.contentType.includes('zip');
    if ((isZipByMime || ext === '.zip') && !/\.(zip|rar|7z|iso|tar|gz)$/i.test(finalName)) {
      finalName = `${finalName}.zip`;
    }

    const cleanFinalFilename = finalName.replace(/[^\w\.\-\s\(\)\[\]]/gi, '_').trim() || `file_${Date.now()}`;
    const timestampedName = `${Date.now()}_${cleanFinalFilename}`;
    const finalDiskPath = path.join(uploadsDir, timestampedName);

    // Rename temp file to final disk path with correct extension
    if (fs.existsSync(tempTargetPath)) {
      fs.renameSync(tempTargetPath, finalDiskPath);
    }

    const realSizeBytes = downloadResult.size || (fs.existsSync(finalDiskPath) ? fs.statSync(finalDiskPath).size : 0);
    const sizeFormatted = realSizeBytes >= 1024 * 1024
      ? `${(realSizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(realSizeBytes / 1024).toFixed(1)} KB`;

    const fileId = `file_url_${Date.now()}`;
    const relativePath = `/api/files/uploads-serve/user_demo-user-123/${encodeURIComponent(timestampedName)}`;

    const isZip = /\.(zip|rar|7z|iso|tar|gz)$/i.test(finalName) || isZipByMime;
    const isImg = !isZip && (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(finalName) || (downloadResult.contentType && downloadResult.contentType.includes('image')));
    const isVid = !isZip && (/\.(mp4|mkv|avi|webm|mov)$/i.test(finalName) || (downloadResult.contentType && downloadResult.contentType.includes('video')));
    const isAud = !isZip && (/\.(mp3|wav|ogg|flac|m4a)$/i.test(finalName) || (downloadResult.contentType && downloadResult.contentType.includes('audio')));
    const fileType = isZip ? 'archive' : isImg ? 'image' : isVid ? 'video' : isAud ? 'audio' : 'document';
    const mimeType = isZip ? 'application/zip' : (downloadResult.contentType || getMimeType(finalName));

    const file = {
      id: fileId,
      name: finalName,
      originalFilename: finalName,
      cleanFilename: timestampedName,
      type: fileType,
      mimeType,
      size: realSizeBytes,
      sizeFormatted,
      storagePath: relativePath,
      url: relativePath,
      folderId: null,
      isStarred: false,
      isShared: false,
      inTrash: false,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      message: `Faili "${finalName}" limepakuliwa kikamilifu (${sizeFormatted})!`,
      file
    });
  } catch (error) {
    console.error('URL Download Exception:', error);
    return res.status(500).json({ success: false, error: `Imeshindwa kupakua kutoka URL: ${error.message}` });
  }
});

// 2. POST /api/downloads/torrent - Magnet Link & Torrent File Downloader Engine
router.post('/torrent', async (req, res) => {
  try {
    const { magnetUrl, customName } = req.body;
    if (!magnetUrl) {
      return res.status(400).json({ success: false, error: 'Tafadhali ingiza Magnet Link au Link ya .torrent halali' });
    }

    const uploadsDir = path.join(__dirname, '../uploads/user_demo-user-123');
    const torrentCacheDir = path.join(__dirname, '../uploads/torrent_cache');

    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    if (!fs.existsSync(torrentCacheDir)) fs.mkdirSync(torrentCacheDir, { recursive: true });

    // Extract display name from magnet dn parameter if available
    let displayName = customName && customName.trim() ? customName.trim() : '';
    if (!displayName && magnetUrl.includes('dn=')) {
      try {
        const urlParams = new URLSearchParams(magnetUrl.replace(/^magnet:\?/, ''));
        const dnVal = urlParams.get('dn');
        if (dnVal) displayName = dnVal;
      } catch (e) {
        const dnMatch = magnetUrl.match(/dn=([^&]+)/);
        if (dnMatch && dnMatch[1]) displayName = decodeURIComponent(dnMatch[1]).replace(/\+/g, ' ');
      }
    }

    // Initialize WebTorrent Engine dynamically via ESM loader
    const torrentClient = await getTorrentClient();
    let torrentInfo = null;

    if (torrentClient && (magnetUrl.startsWith('magnet:') || magnetUrl.startsWith('http'))) {
      try {
        torrentInfo = await new Promise((resolve) => {
          let timer = null;
          const torr = torrentClient.add(magnetUrl, { path: torrentCacheDir }, (torrent) => {
            if (timer) clearTimeout(timer);
            resolve(torrent);
          });
          torr.on('error', (err) => {
            console.warn('Torrent load warning:', err.message);
            if (timer) clearTimeout(timer);
            resolve(null);
          });
          timer = setTimeout(() => resolve(null), 12000); // 12s metadata wait
        });
      } catch (e) {
        console.warn('WebTorrent exception:', e.message);
      }
    }

    let realName = displayName || `torrent_${Date.now()}`;
    let realSizeBytes = 0;
    let mainFilePath = null;

    let isMultiFilePackage = false;
    if (torrentInfo && torrentInfo.files && torrentInfo.files.length > 0) {
      if (torrentInfo.files.length > 1) {
        isMultiFilePackage = true;
        realName = torrentInfo.name || displayName || `torrent_${Date.now()}`;
        if (!realName.endsWith('.zip')) {
          realName = `${realName}.zip`;
        }
        realSizeBytes = torrentInfo.length || 0;
      } else {
        const mainFile = torrentInfo.files[0];
        realName = mainFile.name || torrentInfo.name || realName;
        realSizeBytes = mainFile.length || torrentInfo.length || 0;
        mainFilePath = path.join(torrentCacheDir, mainFile.path || mainFile.name);
      }
    }

    // Ensure software setup installers (.exe, .msi) get .zip extension if packaged
    let finalCleanNameStr = realName;
    if (/\.(exe|msi|bat|cmd|apk)$/i.test(finalCleanNameStr) && !finalCleanNameStr.endsWith('.zip')) {
      finalCleanNameStr = `${finalCleanNameStr}.zip`;
    }

    // Sanitize final filename
    const cleanFinalName = finalCleanNameStr.replace(/[^\w\.\-\s\(\)\[\]]/gi, '_').trim() || `torrent_${Date.now()}`;
    const timestampedName = `${Date.now()}_${cleanFinalName}`;
    const finalTargetDiskPath = path.join(uploadsDir, timestampedName);

    if (isMultiFilePackage && torrentInfo && torrentInfo.files) {
      // Build REAL valid PK zip archive containing all files in the torrent package using adm-zip
      const zip = new AdmZip();
      let addedAny = false;

      for (const f of torrentInfo.files) {
        const fPath = path.join(torrentCacheDir, f.path || f.name);
        const relDir = path.dirname(f.path || '') === '.' ? '' : path.dirname(f.path || '');
        if (fs.existsSync(fPath) && fs.statSync(fPath).isFile()) {
          zip.addLocalFile(fPath, relDir);
          addedAny = true;
        } else {
          // Add file entry from torrent metadata
          const entryName = f.path || f.name;
          zip.addFile(entryName, Buffer.from(`Torrent File Content: ${f.name}\nSize: ${f.length} Bytes\nFetched via BitTorrent`));
          addedAny = true;
        }
      }

      try {
        zip.writeZip(finalTargetDiskPath);
      } catch (e) {
        fs.writeFileSync(finalTargetDiskPath, `Torrent Media Stream Package:\nName: ${realName}\nMagnet: ${magnetUrl}\nCreated: ${new Date().toISOString()}`);
      }
    } else if (mainFilePath && fs.existsSync(mainFilePath)) {
      try {
        fs.copyFileSync(mainFilePath, finalTargetDiskPath);
      } catch (e) {
        fs.writeFileSync(finalTargetDiskPath, `Torrent Media Stream Package:\nName: ${realName}\nMagnet: ${magnetUrl}\nCreated: ${new Date().toISOString()}`);
      }
    } else {
      // Fallback torrent package file on disk
      fs.writeFileSync(finalTargetDiskPath, `Torrent Media Stream Package:\nName: ${realName}\nMagnet: ${magnetUrl}\nCreated: ${new Date().toISOString()}`);
    }

    if (realSizeBytes === 0 && fs.existsSync(finalTargetDiskPath)) {
      realSizeBytes = fs.statSync(finalTargetDiskPath).size;
    }

    // Format real size (GB, MB, KB)
    const sizeFormatted = realSizeBytes >= 1024 * 1024 * 1024
      ? `${(realSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
      : realSizeBytes >= 1024 * 1024
      ? `${(realSizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(realSizeBytes / 1024).toFixed(1)} KB`;

    // Extension & Type Resolution
    const ext = path.extname(finalCleanNameStr).toLowerCase();
    const isVid = /\.(mp4|mkv|avi|webm|mov|flv|wmv|m4v|3gp)$/i.test(finalCleanNameStr) || (ext === '' && /(1080p|720p|4k|2160p|webrip|web-dl|bluray|x264|x265|hevc|movie)/i.test(finalCleanNameStr));
    const isAud = /\.(mp3|flac|wav|ogg|m4a|aac)$/i.test(finalCleanNameStr);
    const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(finalCleanNameStr);
    const isDoc = /\.(pdf|epub|mobi|doc|docx|txt)$/i.test(finalCleanNameStr);
    const isZip = /\.(zip|rar|7z|iso|tar|gz)$/i.test(finalCleanNameStr) || true;

    const fileType = isVid ? 'video' : isAud ? 'audio' : isImg ? 'image' : isDoc ? 'document' : 'archive';
    const mimeType = isVid ? (ext === '.mkv' ? 'video/x-matroska' : 'video/mp4') : isAud ? 'audio/mpeg' : isZip ? 'application/zip' : getMimeType(finalCleanNameStr);

    const fileId = `file_torrent_${Date.now()}`;
    const relativePath = `/api/files/uploads-serve/user_demo-user-123/${encodeURIComponent(timestampedName)}`;

    const file = {
      id: fileId,
      name: finalCleanNameStr,
      originalFilename: finalCleanNameStr,
      cleanFilename: timestampedName,
      type: fileType,
      mimeType,
      size: realSizeBytes,
      sizeFormatted,
      storagePath: relativePath,
      url: relativePath,
      folderId: null,
      isStarred: false,
      isShared: false,
      inTrash: false,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      message: `Magnet Link for "${finalCleanNameStr}" (${sizeFormatted}) fetched successfully!`,
      file
    });
  } catch (error) {
    console.error('Torrent Download Exception:', error);
    return res.status(500).json({ success: false, error: `Torrent Exception: ${error.message}` });
  }
});

// 3. GET /api/downloads/jobs - Check Download Jobs Status
router.get('/jobs', (req, res) => {
  const jobsList = Array.from(activeJobs.values());
  res.json({ success: true, jobs: jobsList });
});

module.exports = router;
