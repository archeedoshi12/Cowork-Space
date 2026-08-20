const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'your_smtp_user') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('📧 Email stub using Ethereal test account:', testAccount.user);
  }

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: process.env.SMTP_FROM || 'noreply@cowork.com',
      to,
      subject,
      html,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(` Email preview URL: ${previewUrl}`);
    } else {
      console.log(` Email sent: ${info.messageId}`);
    }
  } catch (err) {
    console.error('Email send failed (stub):', err.message);
  }
};

const STATUS_COLORS = {
  approved: '#16a34a',
  rejected: '#dc2626',
  cancelled: '#d97706',
  pending: '#2563eb',
};

const STATUS_LABELS = {
  approved: ' Approved',
  rejected: ' Rejected',
  cancelled: ' Cancelled',
  pending: ' Pending Approval',
};

const bookingStatusEmail = (userEmail, userName, status, spaceName, date, startTime, endTime) => {
  const color = STATUS_COLORS[status] || '#333';
  const label = STATUS_LABELS[status] || status;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#4f46e5;padding:20px 24px">
        <h2 style="color:white;margin:0">CoWork Space</h2>
      </div>
      <div style="padding:24px">
        <p style="margin:0 0 16px">Hi <strong>${userName}</strong>,</p>
        <p style="margin:0 0 20px">Your booking status has been updated:</p>
        <div style="background:#f9fafb;border-radius:6px;padding:16px;margin-bottom:20px">
          <p style="margin:0 0 8px"><strong>Space:</strong> ${spaceName}</p>
          <p style="margin:0 0 8px"><strong>Date:</strong> ${date}</p>
          <p style="margin:0 0 8px"><strong>Time:</strong> ${startTime} – ${endTime}</p>
          <p style="margin:0"><strong>Status:</strong> <span style="color:${color};font-weight:600">${label}</span></p>
        </div>
        <p style="color:#6b7280;font-size:14px;margin:0">Thank you for using CoWork Space.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Booking ${label} — ${spaceName} on ${date}`,
    html,
  });
};

module.exports = { sendEmail, bookingStatusEmail };
