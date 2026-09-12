import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/usermodel.js";
import Role from "../models/rolemodel.js";
import RefreshToken from "../models/refresh_tokenmodel.js";
import generateTokens from "../utils/generateTokens.js";

// =====================================================
// LOGIN
// =====================================================

export const login = async (req, res) => {
  const { email, password } = req.body;

  // -----------------------------------------
  // Vérifier si l'utilisateur existe
  // -----------------------------------------

  const user = await User.findByEmail(email);

  if (!user) {
    const error = new Error("Email ou mot de passe incorrect.");
    error.statusCode = 401;
    throw error;
  }

  // -----------------------------------------
  // Vérifier si le compte est actif
  // -----------------------------------------

  if (!user.is_active) {
    const error = new Error(
      "Votre compte n'est pas encore actif."
    );

    error.statusCode = 403;
    throw error;
  }

  // -----------------------------------------
  // Vérifier le mot de passe
  // -----------------------------------------

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    const error = new Error("Email ou mot de passe incorrect.");
    error.statusCode = 401;
    throw error;
  }

  // -----------------------------------------
  // Récupérer le rôle de l'utilisateur
  // -----------------------------------------

  const roles = await Role.getUsersRole(user.id);

  const role = roles[0]?.role_name || null;

  if (!role) {
    const error = new Error(
      "Aucun rôle n'est associé à ce compte."
    );

    error.statusCode = 403;
    throw error;
  }

  // -----------------------------------------
  // Générer Access Token + Refresh Token
  // -----------------------------------------

  const tokens = await generateTokens(user.id);

  // -----------------------------------------
  // Réponse
  // -----------------------------------------

  return res.status(200).json({
    success: true,
    message: "Connexion réussie.",

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role,
    },

    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
};

// =====================================================
// LOGOUT
// =====================================================

export const logout = async (req, res) => {
  const { refreshToken } = req.body;

  // -----------------------------------------
  // Vérifier la présence du refresh token
  // -----------------------------------------

  if (!refreshToken) {
    const error = new Error("Refresh token requis.");
    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // Supprimer le refresh token de la DB
  // -----------------------------------------

  const deleted = await RefreshToken.deleteByToken(
    refreshToken
  );

  if (!deleted) {
    const error = new Error(
      "Refresh token introuvable ou déjà supprimé."
    );

    error.statusCode = 404;
    throw error;
  }

  return res.status(200).json({
    success: true,
    message: "Déconnexion réussie.",
  });
};

// =====================================================
// REFRESH TOKEN
// =====================================================

export const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;

  // -----------------------------------------
  // Vérifier la présence du token
  // -----------------------------------------

  if (!token) {
    const error = new Error("Refresh token requis.");
    error.statusCode = 401;
    throw error;
  }

  // -----------------------------------------
  // Vérifier le token JWT
  // -----------------------------------------

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );
  } catch (error) {
    const newError = new Error(
      "Refresh token invalide ou expiré."
    );

    newError.statusCode = 401;
    throw newError;
  }

  // -----------------------------------------
  // Vérifier que le token existe dans la DB
  // -----------------------------------------

  const storedToken = await RefreshToken.findByToken(token);

  if (!storedToken) {
    const error = new Error(
      "Refresh token invalide ou expiré."
    );

    error.statusCode = 401;
    throw error;
  }

  // -----------------------------------------
  // Vérifier que l'utilisateur existe
  // -----------------------------------------

  const user = await User.findById(decoded.id);

  if (!user) {
    const error = new Error("Utilisateur introuvable.");
    error.statusCode = 404;
    throw error;
  }

  // -----------------------------------------
  // Vérifier que le compte est actif
  // -----------------------------------------

  if (!user.is_active) {
    const error = new Error(
      "Votre compte n'est pas actif."
    );

    error.statusCode = 403;
    throw error;
  }

  // -----------------------------------------
  // Supprimer l'ancien refresh token
  // -----------------------------------------

  await RefreshToken.deleteByToken(token);

  // -----------------------------------------
  // Générer de nouveaux tokens
  // -----------------------------------------

  const tokens = await generateTokens(user.id);

  return res.status(200).json({
    success: true,
    message: "Token renouvelé avec succès.",

    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
};

// =====================================================
// CHECK EMAIL
// =====================================================

export const checkEmail = async (req, res) => {
  const { email } = req.body;

  // -----------------------------------------
  // Vérifier si l'email existe
  // -----------------------------------------

  const user = await User.findByEmail(email);

  return res.status(200).json({
    success: true,
    exists: !!user,
  });
};