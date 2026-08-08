const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const QRCode = require("qrcode");

// Active share storage database in memory
const activeShares = new Map();

// POST /api/shares/create - Create Share Link with Expiry, Password & Self-Destruct
router.post("/create", async (req, res) => {
  try {
    const { fileId, filename, fileUrl, password, expiresInDays, maxDownloads } = req.body;

    const token = crypto.randomBytes(4).toString("hex");

    let expiresAt = null;
    if (expiresInDays && parseInt(expiresInDays) > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
    }

    const host = req.get("host");
    const shareUrl = `${req.protocol}://${host}/share/${token}`;
    const qrCodeDataUrl = await QRCode.toDataURL(shareUrl);

    const shareData = {
      token,
      fileId,
      filename: filename || 'Shared_File',
      fileUrl,
      shareUrl,
      qrCodeDataUrl,
      password: password ? password.toString().trim() : null,
      hasPassword: !!password,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
      downloadCount: 0,
      createdAt: new Date().toISOString()
    };

    activeShares.set(token, shareData);

    return res.json({
      success: true,
      shareLink: shareData
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/shares/:token - Inspect Public Share Link Metadata
router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;
    let share = activeShares.get(token);

    if (!share) {
      const host = req.get("host");
      const shareUrl = `${req.protocol}://${host}/share/${token}`;
      const qrCodeDataUrl = await QRCode.toDataURL(shareUrl);
      share = {
        token,
        shareUrl,
        qrCodeDataUrl,
        filename: "nurhost_shared_document.pdf",
        hasPassword: false,
        expiresAt: null,
        downloadCount: 0,
        maxDownloads: null
      };
    }

    // Check expiration
    if (share.expiresAt && new Date() > new Date(share.expiresAt)) {
      activeShares.delete(token);
      return res.status(410).json({ success: false, error: "Share link has expired." });
    }

    // Check max download limit
    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      activeShares.delete(token);
      return res.status(410).json({ success: false, error: "Self-destruct limit reached. File unavailable." });
    }

    return res.json({
      success: true,
      share: {
        token: share.token,
        filename: share.filename,
        shareUrl: share.shareUrl,
        qrCodeDataUrl: share.qrCodeDataUrl,
        hasPassword: share.hasPassword,
        expiresAt: share.expiresAt,
        maxDownloads: share.maxDownloads,
        downloadCount: share.downloadCount
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/shares/verify-password - Verify Password & Unlock Download
router.post("/verify-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    const share = activeShares.get(token);

    if (!share) {
      return res.status(404).json({ success: false, error: "Share link not found or self-destructed." });
    }

    if (share.password && share.password !== password?.toString().trim()) {
      return res.status(401).json({ success: false, error: "Incorrect PIN/Password. Access denied." });
    }

    share.downloadCount++;
    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      setTimeout(() => activeShares.delete(token), 60000);
    }

    return res.json({
      success: true,
      fileUrl: share.fileUrl || '#',
      filename: share.filename
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
