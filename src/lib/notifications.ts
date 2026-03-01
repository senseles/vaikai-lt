/**
 * Email notification system — placeholder implementation.
 *
 * In production, replace with:
 * - Resend (resend.com)
 * - SendGrid
 * - AWS SES
 * - Nodemailer with SMTP
 */

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@vaikai.lt';

/**
 * Send an email notification. Currently logs to console.
 * TODO: Integrate with an email service provider.
 */
async function sendEmail(payload: EmailPayload): Promise<boolean> {
  // Placeholder: log the email instead of sending
  console.log(`[EMAIL] To: ${payload.to} | Subject: ${payload.subject}`);
  console.log(`[EMAIL] Body: ${payload.body.substring(0, 200)}...`);
  return true;
}

/**
 * Notify admin when a new review is submitted (needs moderation)
 */
export async function notifyNewReview(review: {
  authorName: string;
  rating: number;
  text: string;
  itemType: string;
  itemId: string;
}): Promise<void> {
  const itemTypeLabels: Record<string, string> = {
    kindergarten: 'darželį',
    aukle: 'auklę',
    burelis: 'būrelį',
    specialist: 'specialistą',
  };

  const typeLabel = itemTypeLabels[review.itemType] ?? review.itemType;

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Naujas atsiliepimas laukia patvirtinimo — Vaikai.lt`,
    body: [
      `Naujas atsiliepimas apie ${typeLabel}:`,
      ``,
      `Autorius: ${review.authorName}`,
      `Įvertinimas: ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}`,
      `Tekstas: ${review.text}`,
      ``,
      `Patvirtinkite arba atmeskite: https://vaikai.lt/admin`,
    ].join('\n'),
  });
}

/**
 * Notify admin when a review is reported
 */
export async function notifyReviewReport(report: {
  reviewId: string;
  reason?: string;
}): Promise<void> {
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Pranešimas apie atsiliepimą — Vaikai.lt`,
    body: [
      `Gautas pranešimas apie atsiliepimą (ID: ${report.reviewId})`,
      report.reason ? `Priežastis: ${report.reason}` : '',
      ``,
      `Peržiūrėkite: https://vaikai.lt/admin`,
    ].join('\n'),
  });
}
