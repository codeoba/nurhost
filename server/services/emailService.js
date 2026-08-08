const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || '"NurHost Security & Storage" <noreply@nurhost.mdandu.com>';

let transporter = null;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

/**
 * Generic email sender function with console fallback
 */
async function sendMail({ to, subject, html, text }) {
  if (!to) return { success: false, error: 'Recipient email required' };

  if (!transporter) {
    console.log(`\n[EMAIL ENGINE LOG] — SMTP not configured in .env. Email details:`);
    console.log(`To      : ${to}`);
    console.log(`Subject : ${subject}`);
    console.log(`Text    : ${text || 'HTML Template'}\n`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text: text || 'Tafadhali tumia kisasishi kikuu kinachokubali HTML kuona barua pepe hii.',
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email via SMTP:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 1. Send Security Login Alert Email
 */
async function sendSecurityAlertEmail(userEmail, userName, ipAddress, userAgent) {
  const subject = '🔒 Taarifa ya Usalama: Kuingia Upya Kwenye NurHost Account';
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #6366f1; margin: 0;">🚀 NurHost Cloud Security Shield</h2>
        <p style="color: #94a3b8; font-size: 14px;">Taarifa ya Ingizo la Kifaa Mapya</p>
      </div>

      <p style="font-size: 15px; color: #e2e8f0;">Habari <strong>${userName || 'Mtumiaji'}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Akaunti yako ya NurHost imetoka kuingiliwa (Login) kutoka kwenye anwani mpya ya IP:
      </p>

      <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px; color: #38bdf8; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>IP Address:</strong> ${ipAddress || '127.0.0.1'}</p>
        <p style="margin: 4px 0;"><strong>Kifaa/Browser:</strong> ${userAgent || 'Unknown Browser'}</p>
        <p style="margin: 4px 0;"><strong>Muda:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">
        Kama ni wewe uliyeingia, unaweza kupuuza ujumbe huu. Kama HUKUINGIA wewe, tafadhali badilisha neno lako la siri mara moja kwenye Profile Security Modal.
      </p>

      <hr style="border: 0; border-top: 1px solid #334155; margin: 30px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center;">
        &copy; ${new Date().getFullYear()} NurHost Inc. Hati zote zimehifadhiwa.
      </p>
    </div>
  `;
  return sendMail({ to: userEmail, subject, html });
}

/**
 * 2. Send Password Reset Token Email
 */
async function sendPasswordResetEmail(userEmail, userName, resetToken) {
  const resetLink = `https://nurhost.mdandu.com/?resetToken=${resetToken}`;
  const subject = '🔑 Ombi la Kubadilisha Neno la Siri (Password Reset)';
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
      <h2 style="color: #06b6d4; text-align: center;">🔑 Ombi la Neno la Siri - NurHost</h2>
      <p style="font-size: 15px; color: #e2e8f0;">Habari <strong>${userName || 'Mtumiaji'}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8;">
        Tumepokea ombi la kubadilisha neno la siri la akaunti yako. Tumia code hii hapa chini au bonyeza kitufe:
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <span style="font-size: 24px; font-weight: bold; font-family: monospace; background: #1e293b; color: #38bdf8; padding: 12px 24px; border-radius: 8px; letter-spacing: 4px;">
          ${resetToken}
        </span>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Badilisha Password Sasa
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 30px; text-align: center;">
        Code hii inaisha muda wake baada ya dakika 30. Kama hukuhitaji hii, unaweza kuipuuza.
      </p>
    </div>
  `;
  return sendMail({ to: userEmail, subject, html });
}

/**
 * 3. Send Storage Quota Alert Email
 */
async function sendQuotaWarningEmail(userEmail, userName, usedFormatted, limitFormatted, percentage) {
  const subject = `⚠️ Onyo la Hifadhi: Umetumia ${percentage}% ya Hifadhi Yako ya NurHost`;
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
      <h2 style="color: #f59e0b; text-align: center;">⚠️ Hifadhi Yako Imekaribia Kujaa</h2>
      <p style="font-size: 15px; color: #e2e8f0;">Habari <strong>${userName || 'Mtumiaji'}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8;">
        Hifadhi yako kwenye NurHost imefikia <strong>${percentage}%</strong> (${usedFormatted} kati ya ${limitFormatted}).
      </p>

      <div style="background-color: #1e293b; border-radius: 8px; height: 16px; width: 100%; overflow: hidden; margin: 16px 0;">
        <div style="background: linear-gradient(90deg, #f59e0b, #ef4444); height: 100%; width: ${percentage}%;"></div>
      </div>

      <p style="font-size: 13px; color: #cbd5e1;">
        Ili uendelee kupakia mafaili bila kipingamizi, futa mafaili yasiyohitajika au kuza (upgrade) plan yako.
      </p>
    </div>
  `;
  return sendMail({ to: userEmail, subject, html });
}

module.exports = {
  sendMail,
  sendSecurityAlertEmail,
  sendPasswordResetEmail,
  sendQuotaWarningEmail
};
