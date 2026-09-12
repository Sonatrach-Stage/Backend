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
await transporter.sendMail({
from: `"Gestion des Stages" <${process.env.SMTP_FROM}>`,
to,
subject,
html,
});
};
