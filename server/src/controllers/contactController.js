import { createTransporter } from "../config/mailer.js";

const inMemoryBuckets = new Map(); // ip -> { count, resetAt }
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQ = 5;

function rateLimitOk(ip) {
  const now = Date.now();
  const bucket = inMemoryBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    inMemoryBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= MAX_REQ) return false;
  bucket.count += 1;
  return true;
}

function sanitize(input = "") {
  return String(input).replace(/<[^>]*>?/g, "").trim();
}

export async function postContact(req, res, next) {
  try {
    const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.ip || "unknown";
    if (!rateLimitOk(ip)) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    const { name, email, subject = "", message, website = "" } = req.body || {};

    if (website) {
      // honeypot hit — pretend success
      return res.status(200).json({ ok: true });
    }

    const cleanName = sanitize(name);
    const cleanEmail = sanitize(email);
    const cleanSubject = sanitize(subject).slice(0, 150);
    const cleanMessage = sanitize(message);

    if (!cleanName || cleanName.length < 2) {
      return res.status(400).json({ error: "Invalid name" });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (!cleanMessage || cleanMessage.length < 10) {
      return res.status(400).json({ error: "Invalid message" });
    }
    if (cleanName.length > 100 || cleanMessage.length > 5000) {
      return res.status(400).json({ error: "Input too long" });
    }

    const to = process.env.CONTACT_TO_EMAIL;
    if (!to) {
      return res.status(503).json({ error: "Contact email not configured" });
    }

    const transporter = createTransporter();
    const subjectLine = cleanSubject || "New Contact Form Submission";
    const textBody =
      `New message from ${cleanName} <${cleanEmail}>\n\n` +
      `Subject: ${subjectLine}\n\n` +
      `Message:\n${cleanMessage}\n\n` +
      `--\nIP: ${ip}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      replyTo: cleanEmail,
      subject: subjectLine,
      text: textBody,
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}


