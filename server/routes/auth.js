const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const prisma = require('../prismaClient');
const { sendSecurityAlertEmail, sendPasswordResetEmail } = require('../services/emailService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nurhost_super_secret_jwt_key_2026';

// Helper: Ensure demo user exists in DB
async function getOrCreateDemoUser() {
  let user = await prisma.user.findFirst({
    where: { email: 'demo@nurhost.mdandu.com' }
  });

  if (!user) {
    const hash = await bcrypt.hash('admin123', 10);
    user = await prisma.user.create({
      data: {
        id: 'user_demo-user-123',
        email: 'demo@nurhost.mdandu.com',
        name: 'Mdandu Host Admin',
        passwordHash: hash,
        plan: 'PRO Enterprise',
        storageLimit: 100 * 1024 * 1024 * 1024, // 100 GB
        is2FAEnabled: false
      }
    });
  }

  return user;
}

// 1. Get User Profile
router.get('/profile', async (req, res) => {
  try {
    const user = await getOrCreateDemoUser();

    // Log Activity
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'PROFILE_VIEW',
        details: 'User viewed profile dashboard',
        ipAddress: String(ipAddress).split(',')[0]
      }
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || 'Mdandu Host Admin',
        email: user.email,
        plan: user.plan || 'PRO Enterprise',
        storageUsed: Number(user.storageUsed || 0),
        storageLimit: Number(user.storageLimit || 107374182400),
        is2FAEnabled: user.is2FAEnabled,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Update Profile Name / Email
router.put('/profile', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await getOrCreateDemoUser();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        email: email || user.email
      }
    });

    return res.json({
      success: true,
      message: 'Profile imesasishwa kikamilifu!',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        plan: updated.plan,
        is2FAEnabled: updated.is2FAEnabled
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Change Password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password mpya lazima iwe na angalau herufi 6.' });
    }

    const user = await getOrCreateDemoUser();
    const isMatch = await bcrypt.compare(currentPassword || 'admin123', user.passwordHash);

    if (!isMatch && user.passwordHash && currentPassword) {
      return res.status(400).json({ success: false, error: 'Password ya zamani siyo sahihi.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_CHANGE',
        details: 'User updated account password',
        ipAddress: String(ipAddress).split(',')[0]
      }
    });

    // Send security alert email
    sendSecurityAlertEmail(user.email, user.name, String(ipAddress).split(',')[0], req.headers['user-agent']);

    return res.json({
      success: true,
      message: '🔒 Password imebadilishwa kikamilifu! Barua pepe ya usalama imetumwa.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Setup 2FA (Generate QR Code)
router.post('/2fa/setup', async (req, res) => {
  try {
    const user = await getOrCreateDemoUser();
    const secret = `JBSWY3DPEHPK3PXP-${Date.now()}`;

    const otpauthUrl = `otpauth://totp/NurHost:${encodeURIComponent(user.email)}?secret=${secret}&issuer=NurHost`;
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFASecret: secret }
    });

    return res.json({
      success: true,
      secret,
      qrCodeDataUrl
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Enable / Disable 2FA
router.post('/2fa/toggle', async (req, res) => {
  try {
    const { enable } = req.body;
    const user = await getOrCreateDemoUser();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { is2FAEnabled: !!enable }
    });

    return res.json({
      success: true,
      is2FAEnabled: updated.is2FAEnabled,
      message: updated.is2FAEnabled ? '🔐 2FA Imewezeshwa kwa mafanikio!' : '🔓 2FA Imezimwa.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Get Activity Logs
router.get('/activity-logs', async (req, res) => {
  try {
    const user = await getOrCreateDemoUser();

    const logs = await prisma.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 15
    });

    return res.json({
      success: true,
      logs
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Generate Developer API Key
router.post('/api-keys/generate', async (req, res) => {
  try {
    const user = await getOrCreateDemoUser();
    const apiKey = `nurhost_live_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'API_KEY_GENERATE',
        details: `Generated API Key: ${apiKey.substring(0, 16)}...`,
        ipAddress: String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').split(',')[0]
      }
    });

    return res.json({
      success: true,
      apiKey,
      message: '🔑 API Key mpya imetengenezwa. Hifadhi mahali salama!'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
