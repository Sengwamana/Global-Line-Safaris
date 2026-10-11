import logger from "@/lib/logger";
import { siteConfig } from "@/lib/site";

type EmailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  /** Optional .ics calendar invite content. */
  calendar?: string;
};

function normalizeRecipients(to: string | string[]): string | string[] {
  return Array.isArray(to) ? to : to;
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object") {
    const anyErr = err as any;
    return (
      anyErr?.message ||
      anyErr?.error?.message ||
      JSON.stringify(anyErr)
    );
  }
  return String(err);
}

export async function sendEmail(opts: EmailOptions) {
  const from = process.env.EMAIL_FROM || siteConfig.email;
  const attachments = opts.calendar
    ? [
        {
          filename: "booking.ics",
          content: Buffer.from(opts.calendar).toString("base64"),
          contentType: "text/calendar; charset=utf-8; method=REQUEST",
        },
      ]
    : undefined;

  // Preferred: Resend (best for Next.js/Vercel).
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const payload: Record<string, unknown> = {
        from,
        to: normalizeRecipients(opts.to),
        subject: opts.subject,
      };
      if (opts.text) payload.text = opts.text;
      if (opts.html) {
        payload.html = opts.html;
      } else if (opts.text) {
        payload.html = opts.text.replace(/\n/g, "<br/>");
      }
      if (attachments?.length) payload.attachments = attachments;
      const { data, error } = await resend.emails.send(payload as any);
      if (error) {
        throw new Error(
          error["message"] || error["name"] || JSON.stringify(error)
        );
      }
      logger.info("email sent via Resend", { to: opts.to, id: data?.id });
      return;
    } catch (err) {
      const msg = errorMessage(err);
      logger.warn("Resend send failed", { err: msg, to: opts.to, from });
      // Domain-verification failures are not recoverable via SMTP fallback if
      // the SMTP backend is Resend too, but still attempt the fallback below
      // in case a separate SMTP provider is configured.
      if (/550|domain is not verified|verify your domain/i.test(msg)) {
        logger.warn(
          "Resend rejected the sender domain. Verify EARLY the domain used by EMAIL_FROM " +
            "in your Resend account (https://resend.com/domains). See 'Email setup' in the README."
        );
      }
    }
  }

  // Fallback: SMTP via nodemailer.
  try {
    const nodemailer = await import("nodemailer");
    const transportOptions = process.env.SMTP_URL
      ? { url: process.env.SMTP_URL }
      : {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
          secure: process.env.SMTP_SECURE === "true",
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
        };

    const transporter = nodemailer.createTransport(transportOptions as any);
    await transporter.sendMail({
      from,
      to: normalizeRecipients(opts.to),
      subject: opts.subject,
      text: opts.text,
      html: opts.html ?? opts.text?.replace(/\n/g, "<br/>"),
      attachments,
    });
    logger.info("email sent via SMTP", { to: opts.to, from });
  } catch (err) {
    logger.warn("sendEmail fallback - log only", { err: errorMessage(err), to: opts.to, from });
    logger.info("email payload", { to: opts.to, subject: opts.subject });
  }
}

type LeadMailData = {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  type: "inquiry" | "internship";
  createdAt: Date;
  message?: string | null;
  extra?: Record<string, string | null | undefined>;
};

function textForLine(label: string, value?: string | null): string {
  const v = value?.trim();
  return v ? `${label}: ${v}\n` : "";
}

export async function notifyAdminOfLead(data: LeadMailData, adminEmail: string) {
  const labels: Record<LeadMailData["type"], string> = {
    inquiry: "New Website Inquiry",
    internship: "New Internship Application",
  };

  let text = `${labels[data.type]} — ${data.service || "General"}\n\n`;
  text += textForLine("Name", data.name);
  text += textForLine("Email", data.email);
  text += textForLine("Phone", data.phone);
  text += textForLine("Company", data.company);
  text += textForLine("Service", data.service);
  if (data.extra) {
    for (const [key, value] of Object.entries(data.extra)) {
      if (value) text += textForLine(key, value);
    }
  }
  text += textForLine("Date", data.createdAt.toLocaleString());
  const msg = data.message?.trim();
  if (msg) text += `\nMessage:\n${msg}\n`;

  const htmlBody = [
    `${labels[data.type]} — ${data.service || "General"}`,
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : "",
    data.company ? `Company: ${data.company}` : "",
    data.service ? `Service: ${data.service}` : "",
    ...(data.extra
      ? Object.entries(data.extra)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
      : []),
    `Date: ${data.createdAt.toLocaleString()}`,
    "",
    data.message?.trim() ? `Message:\n${data.message.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  await sendEmail({
    to: adminEmail,
    subject: `${labels[data.type]} — ${data.service || "Website"}`.slice(0, 140),
    text,
    html: emailCard({
      title: labels[data.type],
      preheader: data.service || "New lead",
      body: htmlBody,
    }),
  });
}

export async function sendLeadConfirmation(email: string, type: LeadMailData["type"], preferredContact?: string | null) {
  const subjects: Record<LeadMailData["type"], string> = {
    inquiry: "Thank you for contacting Global Line Safaris",
    internship: "Thank you for your application to Global Line Safaris",
  };

  const nouns: Record<LeadMailData["type"], string> = {
    inquiry: "message",
    internship: "application",
  };

  const text = [
    `Dear traveler,`,
    ``,
    `Thank you for reaching out. We have received your ${nouns[type]} and our team will get back to you within one business day.`,
    preferredContact === "phone"
      ? `We will contact you by phone.`
      : `We will respond to your inquiry by email.`,
    ``,
    `Warm regards,`,
    siteConfig.name,
    siteConfig.phone,
    siteConfig.location,
  ].join("\n");

  const htmlBody = [
    `Dear traveler,`,
    `Thank you for reaching out. We have received your ${nouns[type]} and our team will get back to you within one business day.`,
    preferredContact === "phone"
      ? `We will contact you by phone.`
      : `We will respond to your inquiry by email.`,
  ].join("\n\n");

  await sendEmail({
    to: email,
    subject: subjects[type],
    text,
    html: emailCard({
      title: subjects[type],
      preheader: "We've received your message",
      body: htmlBody,
    }),
  });
}

export async function replyToCustomer(options: { to: string; subject: string; body: string }) {
  await sendEmail({
    to: options.to,
    subject: options.subject,
    text: options.body,
    html: emailCard({
      title: options.subject,
      preheader: "Message from Global Line Safaris",
      body: options.body.replace(/\n/g, "\n\n"),
    }),
  });
}

// ---------------------------------------------------------------------------
// Admin password reset
// ---------------------------------------------------------------------------

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const text = [
    "We received a request to reset your Global Line Safaris admin password.",
    "",
    "Open the following link to choose a new password. It expires in 30 minutes:",
    resetUrl,
    "",
    "If you didn't request this, you can safely ignore this email — your password will not change.",
    "",
    "Warm regards,",
    siteConfig.name,
    siteConfig.phone,
  ].join("\n");

  const htmlBody = [
    "We received a request to reset your Global Line Safaris admin password.",
    "Open the following link to choose a new password. It expires in 30 minutes:",
    resetUrl,
    "If you didn't request this, you can safely ignore this email — your password will not change.",
  ].join("\n\n");

  await sendEmail({
    to: email,
    subject: "Reset your Global Line Safaris admin password",
    text,
    html: emailCard({
      title: "Reset Your Password",
      preheader: "Action required",
      body: htmlBody,
      cta: { label: "Reset Password", href: resetUrl },
    }),
  });
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

export async function sendNewsletterConfirmation(email: string) {
  const text = [
    `Dear subscriber,`,
    ``,
    `Thank you for subscribing to the Global Line Safaris newsletter. You'll receive travel inspiration and updates about Rwanda and East Africa.`,
    ``,
    `If you did not request this subscription, you can safely ignore this email.`,
    ``,
    `To unsubscribe at any time, visit: ${siteConfig.siteUrl}/unsubscribe`,
    ``,
    `Warm regards,`,
    siteConfig.name,
    siteConfig.phone,
    siteConfig.location,
  ].join("\n");

  const htmlBody = [
    "Thank you for subscribing to the Global Line Safaris newsletter. You'll receive travel inspiration and updates about Rwanda and East Africa.",
    "If you did not request this subscription, you can safely ignore this email.",
    `To unsubscribe at any time, visit: ${siteConfig.siteUrl}/unsubscribe`,
  ].join("\n\n");

  await sendEmail({
    to: email,
    subject: `Welcome to the ${siteConfig.name} newsletter`,
    text,
    html: emailCard({
      title: `Welcome to the ${siteConfig.name} Newsletter`,
      preheader: "You're subscribed",
      body: htmlBody,
    }),
  });
}

// ---------------------------------------------------------------------------
// Booking confirmation
// ---------------------------------------------------------------------------

export type BookingConfirmationData = {
  email: string;
  name: string;
  service: string;
  date: string; // ISO "YYYY-MM-DD"
  time: string; // e.g. "10:00 AM – 11:00 AM"
  meetingType?: "in-person" | "virtual" | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type EmailCardOptions = {
  title?: string;
  preheader?: string;
  body?: string;
  showLogo?: boolean;
  footerExtras?: string[];
  cta?: { label: string; href: string } | null;
};

const BRAND_PRIMARY = "#0A1F45";
const BRAND_ACCENT = "#C7A46A";

function emailCard(options: EmailCardOptions): string {
  const { title, preheader, body, showLogo = true, footerExtras = [], cta = null } = options;
  const logoSrc = `${siteConfig.siteUrl.replace(/\/$/, "")}/gls/logo.png`;
  const bodyRows = body
    ? body
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map(
          (paragraph) =>
            `<p style='margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;'>${escapeHtml(paragraph)}</p>`
        )
        .join("")
    : "";

  const ctaHtml = cta
    ? `<div style='margin:24px 0 0;text-align:center;'><a href='${escapeHtml(
        cta.href
      )}' style='display:inline-block;padding:12px 24px;background:${BRAND_PRIMARY};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;'>${escapeHtml(
        cta.label
      )}</a></div>`
    : "";

  const footerRows = [
    `<p style='margin:28px 0 0;font-size:13px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px;'>Warm regards,<br/>The Global Line Safaris Team<br/><span style='color:#64748b;'>${escapeHtml(
      siteConfig.phone
    )} · ${escapeHtml(siteConfig.email)}</span></p>`,
  ];
  for (const extra of footerExtras) {
    if (!extra) continue;
    footerRows.push(
      `<p style='margin:12px 0 0;font-size:12px;line-height:1.6;color:#94a3b8;'>${escapeHtml(extra)}</p>`
    );
  }

  return [
    "<div style='font-family:Arial,Helvetica,sans-serif;color:#1e293b;max-width:600px;margin:0 auto;background:#f8fafc;padding:16px;'>",
    "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);border:1px solid #e2e8f0;'>",
    showLogo
      ? `<tr><td style='background:${BRAND_PRIMARY};padding:24px 32px;text-align:center;'><a href='${escapeHtml(
          siteConfig.siteUrl
        )}' style='text-decoration:none;'><img src='${escapeHtml(logoSrc)}' alt='Global Line Safaris' style='height:56px;max-width:100%;display:block;margin:0 auto;'></a><div style='color:${BRAND_ACCENT};font-size:14px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;margin-top:12px;'>Global Line Safaris</div><div style='color:#ffffff;font-size:12px;opacity:.85;padding-top:8px;'>Travel · Safaris · Rwanda &amp; East Africa</div></td></tr>`
      : `<tr><td style='background:${BRAND_PRIMARY};padding:28px 32px;'><div style='color:${BRAND_ACCENT};font-size:22px;font-weight:bold;'>Global Line Safaris</div><div style='color:#ffffff;font-size:13px;opacity:.85;padding-top:4px;'>Travel · Safaris · Rwanda &amp; East Africa</div></td></tr>`,
    "<tr><td style='padding:32px;background:#ffffff;'>",
    preheader ? `<p style='margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#94a3b8;'>${escapeHtml(preheader)}</p>` : "",
    title ? `<h1 style='margin:0 0 16px;font-size:20px;line-height:1.3;color:#0f172a;'>${escapeHtml(title)}</h1>` : "",
    bodyRows,
    ctaHtml,
    footerRows.join(""),
    "</td></tr>",
    "</table>",
    "</div>",
  ].join("");
}

/**
 * Build a bookable time (start) from a slot label and date.
 * Returns the start Date for ICS, or null if it can't be parsed.
 */
function slotStartDate(dateIso: string, timeLabel: string): Date | null {
  const match = timeLabel.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  const d = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(hours, parseInt(match[2], 10), 0, 0);
  return d;
}

function buildIcs(data: BookingConfirmationData): string {
  const start = slotStartDate(data.date, data.time);
  const now = new Date();
  const fmt = (dt: Date) =>
    dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const dtStart = start ? fmt(start) : fmt(now);
  const dtEnd = start
    ? fmt(new Date(start.getTime() + 60 * 60 * 1000))
    : fmt(new Date(now.getTime() + 60 * 60 * 1000));

  const summary = `Global Line Safaris consultation — ${data.service}`;
  const location = siteConfig.location;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Global Line Safaris//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:booking-${now.getTime()}@globallinesafaris.rw`,
    `DTSTAMP:${fmt(now)}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:Consultation with ${data.name} (${data.service}).`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

function bookingHtml(data: BookingConfirmationData, isTentative: boolean): string {
  const dateLabel = new Date(`${data.date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const intro = isTentative
    ? "Thank you for requesting a consultation. We've reserved your preferred slot and will finalize it with you within one business day."
    : "Great news — your consultation has been confirmed. We look forward to meeting you.";

  const bodyParts = [
    intro,
    `DATE: ${dateLabel}`,
    `TIME: ${data.time}`,
    "LOCATION: in-person or virtual — we'll confirm",
    "If anything changes, just reply to this email or call us. See you soon!",
  ];

  return emailCard({
    title: `Booking ${isTentative ? "Request Received" : "Confirmed"} — ${data.service}`,
    preheader: `Booking ${isTentative ? "request received" : "confirmed"}`,
    body: bodyParts.join("\n\n"),
  });
}

function bookingText(data: BookingConfirmationData, isTentative: boolean): string {
  const dateLabel = new Date(`${data.date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const header = isTentative ? "Booking request received" : "Booking confirmed";
  return [
    `${siteConfig.name} — ${header}`,
    "",
    `Service: ${data.service}`,
    `Date:    ${dateLabel}`,
    `Time:    ${data.time}`,
    "Location: in-person or virtual (we'll confirm)",
    "",
    isTentative
      ? `Hi ${data.name}, we've reserved this slot and will finalize it with you within one business day.`
      : `Hi ${data.name}, your consultation is confirmed. We look forward to seeing you.`,
    "",
    "A calendar invite is attached. If anything changes, just reply to this email or call us.",
    "",
    `Warm regards,`,
    siteConfig.name,
    siteConfig.phone,
    siteConfig.email,
  ].join("\n");
}

export async function sendBookingConfirmation(data: BookingConfirmationData, isTentative = true) {
  await sendEmail({
    to: data.email,
    subject: isTentative
      ? `Booking request received — ${data.service}`
      : `Booking confirmed — ${data.service}`,
    text: bookingText(data, isTentative),
    html: bookingHtml(data, isTentative),
    calendar: buildIcs(data),
  });
}

// ---------------------------------------------------------------------------
// Status-change emails  (sent when admin updates a lead's status)
// ---------------------------------------------------------------------------

type StatusUpdateData = {
  email: string;
  name: string;
  service?: string | null;
  /** Extra context shown in the email (date, quote amount, etc.) */
  details?: Record<string, string | null | undefined>;
};

const STATUS_EMAIL: Record<string, { subject: string; heading: string; body: string }> = {
  // Consultation
  CONFIRMED: {
    subject: "Your consultation has been confirmed",
    heading: "Consultation Confirmed",
    body: "Your consultation has been confirmed. We look forward to meeting you.",
  },
  CANCELLED: {
    subject: "Your consultation has been cancelled",
    heading: "Consultation Cancelled",
    body: "Your consultation has been cancelled. If this was a mistake, please contact us to rebook.",
  },
  // Quote
  QUOTED: {
    subject: "Your quote is ready for review",
    heading: "Quote Ready",
    body: "We've prepared your quote. Please review the details below or contact us for any questions.",
  },
  ACCEPTED: {
    subject: "Your quote has been accepted",
    heading: "Quote Accepted",
    body: "Great news — your quote has been accepted. Our team will be in touch shortly to arrange next steps.",
  },
  DECLINED: {
    subject: "Your quote has been declined",
    heading: "Quote Declined",
    body: "Your quote request has been declined. If you have any questions, please don't hesitate to reach out.",
  },
  // Inquiry
  QUALIFIED: {
    subject: "Your inquiry has been reviewed",
    heading: "Inquiry Reviewed",
    body: "Thank you for your inquiry. Our team has reviewed your request and will be in touch with next steps.",
  },
  CONVERTED: {
    subject: "Your inquiry has been processed",
    heading: "Inquiry Processed",
    body: "Your inquiry has been processed. Our team will follow up with you shortly.",
  },
  CLOSED: {
    subject: "Your inquiry has been closed",
    heading: "Inquiry Closed",
    body: "Your inquiry has been closed. If you need further assistance, please contact us.",
  },
};

function statusUpdateHtml(data: StatusUpdateData, status: string, meta: { heading: string; body: string }): string {
  const extraRows = data.details
    ? Object.entries(data.details)
        .filter(([, v]) => v?.trim())
        .map(
          ([k, v]) =>
            `<tr><td style='font-size:12px;color:#64748b;padding:4px 0;text-transform:uppercase;'>${escapeHtml(k)}</td></tr>` +
            `<tr><td style='font-size:15px;font-weight:600;color:#0f172a;padding:0 0 14px;'>${escapeHtml(v!.trim())}</td></tr>`
        )
        .join("")
    : "";

  let body = `${meta.body}`;

  if (data.details) {
    for (const [k, v] of Object.entries(data.details)) {
      if (v?.trim()) body += `\n\n${k}: ${v.trim()}`;
    }
  }
  body += "\n\nIf you have any questions, just reply to this email or call us.";

  return emailCard({
    title: `${meta.heading}${data.service ? ` — ${data.service}` : ""}`,
    preheader: meta.heading,
    body,
  });
}

function statusUpdateText(data: StatusUpdateData, status: string, meta: { heading: string; body: string }): string {
  const lines = [
    `${siteConfig.name} — ${meta.heading}`,
    "",
    `Hi ${data.name},`,
    "",
    meta.body,
    "",
  ];
  if (data.service) lines.push(`Service: ${data.service}`);
  if (data.details) {
    for (const [k, v] of Object.entries(data.details)) {
      if (v?.trim()) lines.push(`${k}: ${v.trim()}`);
    }
  }
  lines.push(
    "",
    "If you have any questions, just reply to this email or call us.",
    "",
    "Warm regards,",
    siteConfig.name,
    siteConfig.phone,
    siteConfig.email,
  );
  return lines.join("\n");
}

/**
 * Send a status-change email to the customer for consultations.
 * Only sends for customer-facing statuses: CONFIRMED, CANCELLED.
 */
export async function sendConsultationStatusUpdate(data: StatusUpdateData, newStatus: string) {
  const meta = STATUS_EMAIL[newStatus];
  if (!meta) return; // non-customer-facing status, skip
  await sendEmail({
    to: data.email,
    subject: `${meta.subject}${data.service ? ` — ${data.service}` : ""}`.slice(0, 140),
    text: statusUpdateText(data, newStatus, meta),
    html: statusUpdateHtml(data, newStatus, meta),
  });
}

/**
 * Send a status-change email to the customer for quotes.
 * Only sends for customer-facing statuses: QUOTED, ACCEPTED, DECLINED.
 */
export async function sendQuoteStatusUpdate(data: StatusUpdateData, newStatus: string) {
  const meta = STATUS_EMAIL[newStatus];
  if (!meta) return;
  await sendEmail({
    to: data.email,
    subject: `${meta.subject}${data.service ? ` — ${data.service}` : ""}`.slice(0, 140),
    text: statusUpdateText(data, newStatus, meta),
    html: statusUpdateHtml(data, newStatus, meta),
  });
}

/**
 * Send a status-change email to the customer for inquiries.
 * Only sends for customer-facing statuses: QUALIFIED, CONVERTED, CLOSED.
 */
export async function sendInquiryStatusUpdate(data: StatusUpdateData, newStatus: string) {
  const meta = STATUS_EMAIL[newStatus];
  if (!meta) return;
  await sendEmail({
    to: data.email,
    subject: `${meta.subject}${data.service ? ` — ${data.service}` : ""}`.slice(0, 140),
    text: statusUpdateText(data, newStatus, meta),
    html: statusUpdateHtml(data, newStatus, meta),
  });
}
