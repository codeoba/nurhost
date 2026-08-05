const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const QRCode = require("qrcode");

// POST /api/shares/create - Create Share Link with Expiry & Password
router.post("/create", async (req, res) => {
  try {
    const { fileId, password, expiresInDays, maxDownloads } = req.body;

    // Generate short random token (e.g. xJ9kLm2)
    const token = crypto.randomBytes(4).toString("hex");

    let expiresAt = null;
    if (expiresInDays && parseInt(expiresInDays) > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
    }

    const shareUrl = `${req.protocol}://${req.get("host")}/drive/s/${token}`;
    const qrCodeDataUrl = await QRCode.toDataURL(shareUrl);

    res.json({
      success: true,
      shareLink: {
        token,
        shareUrl,
        qrCodeDataUrl,
        hasPassword: !!password,
        expiresAt,
        maxDownloads: maxDownloads ? parseInt(maxDownloads) : null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/shares/:token - Inspect Public Share Link Metadata
router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Generate sample QR code for share link
    const shareUrl = `${req.protocol}://${req.get("host")}/drive/s/${token}`;
    const qrCodeDataUrl = await QRCode.toDataURL(shareUrl);

    res.json({
      success: true,
      share: {
        token,
        shareUrl,
        qrCodeDataUrl,
        file: {
          originalFilename: "nurhost_architecture_spec.pdf",
          size: "1.8 MB",
          mimeType: "application/pdf",
        },
        hasPassword: false,
        expiresAt: null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
