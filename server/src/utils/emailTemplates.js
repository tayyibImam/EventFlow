// Shared, table-based HTML email layout — every transactional email the
// server sends (see mailer.js / sendMail callers) should render its body
// through `renderEmail` and `card`/`button` below instead of hand-rolling
// its own markup, so every email shares one professional, branded look.
// Deliberately table-based with inline styles only (no flexbox/grid, no
// linked stylesheet) since that's what actually renders consistently
// across email clients (Outlook/Gmail/Apple Mail), unlike regular HTML/CSS.

const BRAND_NAVY = '#1B3A5C';
const BRAND_GOLD = '#D4A537';

// A bordered, rounded "card" block used to surface structured details
// (event name, date, venue, etc.) inside an email body.
function card({ heading, rows = [] }) {
  const rowsHtml = rows
    .filter((r) => r && r.value)
    .map(
      (r) => `
      <tr>
        <td style="padding:6px 0;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.4px;width:100px;vertical-align:top;">${r.label}</td>
        <td style="padding:6px 0;font-size:13px;color:${BRAND_NAVY};font-weight:600;line-height:1.5;">${r.value}</td>
      </tr>`
    )
    .join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB;border:1px solid #E2E8F0;border-radius:16px;margin:22px 0;">
      <tr>
        <td style="padding:20px 22px;">
          ${heading ? `<p style="margin:0 0 12px;font-size:13px;font-weight:800;color:${BRAND_NAVY};">${heading}</p>` : ''}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
        </td>
      </tr>
    </table>`;
}

// A solid, pill-style call-to-action button.
function button({ text, href, color = BRAND_NAVY }) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0;">
      <tr>
        <td style="border-radius:10px;background-color:${color};">
          <a href="${href}" style="display:inline-block;padding:13px 30px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">${text}</a>
        </td>
      </tr>
    </table>`;
}

// Wraps `bodyHtml` (built from the pieces above, plus plain <p> copy) in the
// shared EventFlow letterhead/footer. `preheaderText` is the hidden snippet
// most inboxes show next to the subject line.
function renderEmail({ preheaderText = '', bodyHtml }) {
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
  </head>
  <body style="margin:0;padding:0;background-color:#F3F5F8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
    <span style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;">${preheaderText}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3F5F8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 1px 3px rgba(15,35,58,0.08);">
            <tr>
              <td style="background-color:${BRAND_NAVY};padding:26px 32px;text-align:center;">
                <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">Event<span style="color:${BRAND_GOLD};">Flow</span></span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 8px;color:#334155;font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 32px;">
                <hr style="border:none;border-top:1px solid #E2E8F0;margin:0 0 20px;" />
                <p style="margin:0;font-size:11px;color:#94A3B8;line-height:1.6;">
                  You're receiving this email because of your interaction with an event on EventFlow. If this wasn't meant for you, you can safely ignore it.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:11px;color:#94A3B8;">&copy; ${year} EventFlow &middot; Event Planning &amp; Management</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

module.exports = { renderEmail, card, button };
