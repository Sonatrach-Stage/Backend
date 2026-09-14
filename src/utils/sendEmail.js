import nodemailer from 'nodemailer';

// Création du transporteur SMTP
const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT),
secure: false,
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASS,
},
});

// Fonction générique pour envoyer des emails
export const sendEmail = async ({ to, subject, html }) => {
  console.log("========== SMTP CONFIG ==========");
console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER exists:", !!process.env.SMTP_USER);
console.log("SMTP_PASS exists:", !!process.env.SMTP_PASS);
console.log("SMTP_FROM:", process.env.SMTP_FROM);
console.log("================================");
await transporter.sendMail({
from: `"Gestion des Stages" <${process.env.SMTP_FROM}>`,
to,
subject,
html,
});
};
