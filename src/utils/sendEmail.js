import nodemailer from "nodemailer";

// =====================================================
// CRÉATION DU TRANSPORTEUR SMTP
// =====================================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// =====================================================
// ENVOI EMAIL
// =====================================================

export const sendEmail = async ({ to, subject, html }) => {
  console.log("========== SMTP CONFIG ==========");

  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER exists:", !!process.env.SMTP_USER);
  console.log("SMTP_PASS exists:", !!process.env.SMTP_PASS);
  console.log("SMTP_FROM:", process.env.SMTP_FROM);

  console.log("================================");

  try {
    console.log("🔄 Testing SMTP connection...");

    await transporter.verify();

    console.log("✅ SMTP connection OK");

    const info = await transporter.sendMail({
      from: `"Gestion des Stages" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);

    return info;

  } catch (error) {
    console.error("❌ SMTP ERROR:", error);

    throw error;
  }
};