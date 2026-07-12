import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  } else {
    // Development fallback: render the email as JSON in the server log.
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || 'AFRIMOS <no-reply@afrimos.et>',
      to,
      subject,
      text,
      html,
    });
    if (info.message) {
      console.log('[email:dev]', subject, '->', to);
    }
    return info;
  } catch (err) {
    // Email failures must never break the main request flow.
    console.error('[email] failed to send:', err.message);
    return null;
  }
}

const frontend = () => process.env.FRONTEND_URL || 'http://localhost:3000';

export function sendVerificationEmail(user, token) {
  const link = `${frontend()}/verify-email?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Verify your AFRIMOS account',
    text: `Welcome to AFRIMOS! Verify your email: ${link}`,
    html: `<p>Welcome to AFRIMOS, ${user.fullName}!</p>
           <p>Please verify your email address by clicking the link below:</p>
           <p><a href="${link}">${link}</a></p>`,
  });
}

export function sendRfqNotification(supplierUser, rfq) {
  const link = `${frontend()}/dashboard/supplier/rfqs`;
  return sendEmail({
    to: supplierUser.email,
    subject: `New buyer inquiry: ${rfq.title}`,
    text: `You have a new inquiry on AFRIMOS. View it: ${link}`,
    html: `<p>You have a new buyer inquiry for <strong>${rfq.title}</strong> (${rfq.quantity} ${rfq.unit}).</p>
           <p><a href="${link}">View and respond</a></p>`,
  });
}

export function sendMessageNotification(recipient, sender, rfq) {
  const path = recipient.role === 'supplier' ? '/dashboard/supplier/messages' : '/dashboard/buyer/messages';
  const link = `${frontend()}${path}`;
  return sendEmail({
    to: recipient.email,
    subject: `New message from ${sender.fullName}`,
    text: `You have a new message on AFRIMOS about "${rfq.title}". Read it: ${link}`,
    html: `<p>${sender.fullName} sent you a new message about <strong>${rfq.title}</strong>.</p>
           <p><a href="${link}">Read and reply</a></p>`,
  });
}

export function sendVerificationDecisionEmail(user, status, notes) {
  const verified = status === 'verified';
  return sendEmail({
    to: user.email,
    subject: verified ? 'Your AFRIMOS profile has been verified' : 'Your AFRIMOS profile needs changes',
    text: verified
      ? 'Congratulations - your supplier profile is now verified and visible to buyers.'
      : `Your profile was not approved. ${notes || 'Contact admin@afrimos.et for details.'}`,
    html: verified
      ? `<p>Congratulations! Your supplier profile is now <strong>verified</strong> and visible to international buyers.</p>`
      : `<p>Your profile was not approved.</p><p>${notes || 'Contact admin@afrimos.et for details.'}</p>`,
  });
}
