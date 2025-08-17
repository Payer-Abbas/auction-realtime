import sgMail from '@sendgrid/mail';
import fs from 'fs';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Clean wrapper for sending email with optional attachments.
 */
export async function sendEmail({ to, subject, html, attachments = [] }) {
  // Ensure recipients are unique + valid
  const uniqueRecipients = [...new Set((Array.isArray(to) ? to : [to]).filter(Boolean))];

  const formattedAttachments = attachments.map(att => {
    if (typeof att === 'string') {
      // Assume it's a file path
      const buffer = fs.readFileSync(att);
      return {
        content: buffer.toString('base64'),
        filename: att.split('/').pop(),
        type: 'application/pdf',
        disposition: 'attachment'
      };
    }
    if (att.content && att.filename) {
      return att; // Already formatted
    }
    throw new Error('Invalid attachment format');
  });

  const msg = {
    to: uniqueRecipients,
    from: process.env.SENDGRID_FROM, // ✅ configure in .env
    subject,
    html,
    attachments: formattedAttachments
  };

  console.log('📧 Sending email with payload:', {
    ...msg,
    attachments: formattedAttachments.map(a => ({
      filename: a.filename,
      type: a.type,
      length: a.content.length
    }))
  });

  return sgMail.send(msg);
}
