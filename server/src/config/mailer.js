const nodemailer = require('nodemailer');

let transporterPromise = null;

// Real SMTP if configured (SMTP_HOST/SMTP_USER/SMTP_PASS in .env). Without
// those, falls back to a throwaway Ethereal test inbox so invite emails
// still "send" in development — nothing reaches a real inbox in that case;
// check the server console for the preview URL Nodemailer prints per email.
function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
      }

      console.warn(
        'No SMTP_HOST/SMTP_USER/SMTP_PASS set in server/.env — using a throwaway Ethereal test inbox. ' +
        'Emails will NOT reach a real inbox; each send logs a preview URL instead. ' +
        'Set real SMTP credentials to send actual email.'
      );
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    })();
  }

  return transporterPromise;
}

async function sendMail({ to, subject, html, text }) {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"EventFlow" <no-reply@eventflow.local>',
    to,
    subject,
    text,
    html
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`Invite email preview (Ethereal test inbox, not a real delivery): ${previewUrl}`);
  }

  return { info, previewUrl };
}

module.exports = { sendMail };
