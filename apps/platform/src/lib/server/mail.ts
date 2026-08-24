import { emailTemplate, type EmailTemplateProps } from "./email-template";

export type MailMessage = EmailTemplateProps & { to: string; subject: string };

export async function sendMail(message: MailMessage) {
  const endpoint = process.env.MAIL_API_URL;
  const key = process.env.MAIL_API_KEY;
  if (!endpoint || !key) return { delivered: false, mode: "preview", html: emailTemplate(message) };
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to: message.to, subject: message.subject, html: emailTemplate(message) }),
  });
  if (!response.ok) throw new Error(`Mail delivery failed: ${response.status}`);
  return { delivered: true, mode: "provider" };
}
