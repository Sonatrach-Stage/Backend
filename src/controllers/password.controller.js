import bcrypt from "bcrypt";
import crypto from "crypto";

import User from "../models/usermodel.js";
import PasswordResetToken from "../models/password_reset_tokenmodel.js";

import { sendEmail } from "../utils/sendEmail.js";


// =====================================================
// FORGOT PASSWORD
// =====================================================

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // -----------------------------------------
  // Vérifier si l'utilisateur existe
  // -----------------------------------------

  const user = await User.findByEmail(email);

  // Pour éviter de révéler si un email existe
  if (!user) {
    return res.status(200).json({
      success: true,
      message:
        "Si cet email existe, un code de vérification sera envoyé.",
    });
  }

  // -----------------------------------------
  // Supprimer les anciens tokens
  // -----------------------------------------

  await PasswordResetToken.deleteByUserId(user.id);

  // -----------------------------------------
  // Générer un OTP à 6 chiffres
  // -----------------------------------------

  const otp = crypto.randomInt(100000, 1000000).toString();

  // -----------------------------------------
  // Expiration : 10 minutes
  // -----------------------------------------

  const expiredAt = new Date(
    Date.now() + 10 * 60 * 1000
  );

  // -----------------------------------------
  // Sauvegarder le token
  // -----------------------------------------

  await PasswordResetToken.create(
    user.id,
    otp,
    expiredAt
  );

  // -----------------------------------------
  // Envoyer l'email
  // -----------------------------------------

  await sendEmail({
    to: user.email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <h2>Réinitialisation du mot de passe</h2>

      <p>Bonjour ${user.name},</p>

      <p>
        Voici votre code de vérification :
      </p>

      <h1>${otp}</h1>

      <p>
        Ce code est valable pendant 10 minutes.
      </p>

      <p>
        Si vous n'êtes pas à l'origine de cette demande,
        vous pouvez ignorer cet email.
      </p>
    `,
  });

  return res.status(200).json({
    success: true,
    message:
      "Si cet email existe, un code de vérification sera envoyé.",
  });
};


// =====================================================
// VERIFY OTP
// =====================================================

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
console.log("liliana: ",email,"lisa",otp)
  // -----------------------------------------
  // Vérifier l'utilisateur
  // -----------------------------------------

  const user = await User.findByEmail(email);
console.log("llllliiiii: ",user);
  if (!user) {
    const error = new Error(
      "Code invalide ou expiré."
    );

    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // Vérifier le token
  // -----------------------------------------

  const token = await PasswordResetToken.findByToken(otp);

  if (!token || token.user_id !== user.id) {
    const error = new Error(
      "Code invalide ou expiré."
    );
    console.log("////////",token);
/*console.log("/////",token.user_id);*/
console.log("///////",user.id);

    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // Vérifier que le token n'est pas déjà vérifié
  // -----------------------------------------

  if (token.is_verified) {
    const error = new Error(
      "Ce code a déjà été vérifié."
    );

    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // Marquer comme vérifié
  // -----------------------------------------

  await PasswordResetToken.markAsVerified(otp);

  return res.status(200).json({
    success: true,
    message: "Code vérifié avec succès.",
  });
};


// =====================================================
// RESET PASSWORD
// =====================================================

export const resetPassword = async (req, res) => {
  const {
    email,
    password,
    confirm_password,
  } = req.body;

  // -----------------------------------------
  // Vérifier les mots de passe
  // -----------------------------------------

  if (password !== confirm_password) {
    const error = new Error(
      "Les mots de passe ne correspondent pas."
    );

    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // Vérifier l'utilisateur
  // -----------------------------------------

  const user = await User.findByEmail(email);

  if (!user) {
    const error = new Error(
      "Utilisateur introuvable."
    );

    error.statusCode = 404;
    throw error;
  }

  // -----------------------------------------
  // Vérifier qu'un OTP a été validé
  // -----------------------------------------
console.log("********",user.id)
  const token =
    await PasswordResetToken.findVerifiedById(
      user.id
    );
console.log("********",token)
  if (!token) {
    const error = new Error(
      "Veuillez d'abord vérifier le code."
    );

    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // Hasher le nouveau mot de passe
  // -----------------------------------------

  const hashedPassword =
    await bcrypt.hash(password, 12);

  // -----------------------------------------
  // Modifier le mot de passe
  // -----------------------------------------

  await User.updatePassword(
    user.id,
    hashedPassword
  );

  // -----------------------------------------
  // Invalider le token
  // -----------------------------------------

  await PasswordResetToken.markAsUsed(
    token.token
  );

  // -----------------------------------------
  // Réponse
  // -----------------------------------------

  return res.status(200).json({
    success: true,
    message:
      "Mot de passe réinitialisé avec succès.",
  });
};


// =====================================================
// CHANGE PASSWORD
// =====================================================

export const changePassword = async (req, res) => {
  console.log("========== CHANGE PASSWORD ==========");
  const {
    current_password,
    new_password,
    confirm_password,
  } = req.body;
const authHeader = req.headers.authorization;
console.log("/////////////",authHeader)
  if (!authHeader) {
    const error = new Error(
      "Authorization header requis."
    );

    error.statusCode = 401;
    throw error;
  }
  // -----------------------------------------
  // Vérifier les nouveaux mots de passe
  // -----------------------------------------
console.log("mot de passe1:",new_password);
console.log("mot de passe2:",confirm_password);
  if (new_password !== confirm_password) {
    const error = new Error(
      "Les nouveaux mots de passe ne correspondent pas."
    );

    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // L'utilisateur vient de protect()
  // -----------------------------------------

  const user = req.user;
console.log("user =", user);
  // -----------------------------------------
  // Vérifier l'ancien mot de passe
  // -----------------------------------------

  const isCurrentPasswordValid =
    await bcrypt.compare(
      current_password,
      user.password
    );

  if (!isCurrentPasswordValid) {
    const error = new Error(
      "L'ancien mot de passe est incorrect."
    );

    error.statusCode = 401;
    throw error;
  }

  // -----------------------------------------
  // Vérifier que le nouveau est différent
  // -----------------------------------------

  const isSamePassword =
    await bcrypt.compare(
      new_password,
      user.password
    );

  if (isSamePassword) {
    const error = new Error(
      "Le nouveau mot de passe doit être différent de l'ancien."
    );

    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // Hasher le nouveau mot de passe
  // -----------------------------------------

  const hashedPassword =
    await bcrypt.hash(new_password, 12);

  // -----------------------------------------
  // Modifier le mot de passe
  // -----------------------------------------

  await User.updatePassword(
    user.id,
    hashedPassword
  );

  // -----------------------------------------
  // Réponse
  // -----------------------------------------

  return res.status(200).json({
    success: true,
    message:
      "Mot de passe modifié avec succès.",
  });
};