const rateLimit = require('express-rate-limit');
const path = require('path');

// 1. Auth Rate Limiter (Max 10 requests per 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Jaribio la kuingia limezidi kiwango (Too many login attempts). Tafadhali subiri dakika 15.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 2. General API Rate Limiter (Max 200 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: 'Ombi limezidi kiwango cha kawaida cha server.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 3. Malicious Executable Extension Firewall
const DANGEROUS_EXTENSIONS = [
  '.php', '.phtml', '.php3', '.php4', '.php5', '.phps', '.phar',
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.vbs', '.cgi', '.pl', '.py',
  '.jar', '.msi', '.scr', '.gadget', '.htm', '.html' // HTML uploads locked down to static serve
];

function uploadSecurityFirewall(req, res, next) {
  if (!req.file && !req.files) return next();

  const filesToCheck = req.files || (req.file ? [req.file] : []);

  for (const file of filesToCheck) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    
    // Block executable PHP or script payload uploads
    if (DANGEROUS_EXTENSIONS.includes(ext) && (ext === '.php' || ext === '.phtml' || ext === '.exe' || ext === '.sh')) {
      return res.status(400).json({
        success: false,
        error: `🛡️ Security Firewall: Faili lenye extension "${ext}" ni hatari kwa mfumo na limezuiliwa.`
      });
    }
  }

  next();
}

// 4. Enterprise Security HTTP Headers Middleware
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

module.exports = {
  authLimiter,
  apiLimiter,
  uploadSecurityFirewall,
  securityHeaders
};
