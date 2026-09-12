import express from 'express';
import multer from "multer";
import {
signUpSecondaryAdmin, signUpIntern, verifyEmailOtp, resendEmailOtp,signUpSupervisor
} from '../controllers/registration.controller.js';
import {login,logout,refreshToken,checkEmail,} from "../controllers/auth.controller.js";
import {validateInternSignUp, validateSupervisorCreation, validateAdminSignUp, loginValidator, forgotPasswordValidator,verifyPasswordOtpValidator, resetPasswordValidator, changePasswordValidator
} from '../validators/auth.validator.js';
import {forgotPassword,verifyOtp,resetPassword,changePassword,} from "../controllers/password.controller.js";
import { validate } from '../middlewares/validate.middleware.js';
import passport from '../config/passport.js';
import upload from '../middlewares/uploadmiddleware.js';
import generateTokens from '../utils/generateTokens.js';
import Role from '../models/rolemodel.js';
import asyncHandler from "../utils/asyncHandler.js";
import {
    protect,
    restrictTo,
    hasPermission
} from "../middlewares/auth.middleware.js";
const router = express.Router();


// =====================================================
// SECONDARY ADMIN REGISTRATION
// =====================================================

router.post(
  "/secondary-admin",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  asyncHandler(signUpSecondaryAdmin)
);

// =====================================================
// INTERN REGISTRATION
// =====================================================

router.post(
  "/intern",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "convention", maxCount: 1 },
  ]),
  validateInternSignUp,
  validate,
  asyncHandler(signUpIntern)
);
// supervisor REGISTRATION
router.post(
  "/supervisor",
  upload.fields([
    {
      name: "profile_image",
      maxCount: 1,
    },
  ]),
  asyncHandler(signUpSupervisor)
);
// =====================================================
// VERIFY EMAIL OTP
// =====================================================
router.post(
  "/verify-email-otp",
  (req, res, next) => {
    console.log("🔥🔥🔥 ROUTE ATTEINTE");
    next();
  },
  asyncHandler(verifyEmailOtp)
);

// =====================================================
// RESEND OTP
// =====================================================

router.post(
  "/resend-otp",
  asyncHandler(resendEmailOtp)
);


// =====================================================
// AUTH ROUTES
// =====================================================

// Vérifier si un email existe déjà
router.post(
  "/check-email",
  asyncHandler(checkEmail)
);

// Connexion
router.post(
  "/login",
  asyncHandler(login)
);

// Renouveler l'access token
router.post(
  "/refresh-token",
  asyncHandler(refreshToken)
);

// Déconnexion
router.post(
  "/logout",
  /*protect,*/
  asyncHandler(logout)
);


// =====================================================
// GOOGLE AUTHENTICATION
// =====================================================


// -----------------------------------------------------
// Google Login
// -----------------------------------------------------

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);


// -----------------------------------------------------
// Google Callback
// -----------------------------------------------------

router.get(
  "/google/callback",

  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/google/failed",
  }),

  asyncHandler(async (req, res) => {

    try {

      // -----------------------------------------
      // Vérifier que Passport a bien trouvé
      // l'utilisateur
      // -----------------------------------------

      if (!req.user) {
        const error = new Error(
          "Utilisateur Google introuvable."
        );

        error.statusCode = 401;
        throw error;
      }


      // -----------------------------------------
      // Générer Access Token + Refresh Token
      // -----------------------------------------

      const {
        accessToken,
        refreshToken: rToken,
      } = await generateTokens(req.user.id);


      // -----------------------------------------
      // Récupérer le rôle
      // -----------------------------------------

      const roles = await Role.getUserRoles(
        req.user.id
      );

      const role =
        roles[0]?.role_name || null;


      // -----------------------------------------
      // Vérifier que le rôle existe
      // -----------------------------------------

      if (!role) {
        const error = new Error(
          "Aucun rôle n'est associé à ce compte."
        );

        error.statusCode = 403;
        throw error;
      }


      // -----------------------------------------
      // Réponse
      // -----------------------------------------

      return res.status(200).json({

        success: true,

        message: "Connexion Google réussie.",

        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          role,
        },

        accessToken,

        refreshToken: rToken,

      });

    } catch (error) {

      console.error(
        "Erreur Google callback:",
        error
      );

      throw error;
    }

  })
);


// -----------------------------------------------------
// Google Authentication Failed
// -----------------------------------------------------

router.get(
  "/google/failed",
  (req, res) => {

    return res.status(401).json({

      success: false,

      message:
        "Aucun compte associé à cet email. Veuillez vous inscrire d'abord.",

    });

  }
);

// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validate,
  asyncHandler(forgotPassword)
);


// =====================================================
// VERIFY PASSWORD OTP
// =====================================================

router.post(
  "/verify-otp",
  verifyPasswordOtpValidator,
  validate,
  asyncHandler(verifyOtp)
);

// =====================================================
// RESET PASSWORD
// =====================================================

router.post(
  "/reset-password",
  resetPasswordValidator,
  validate,
  asyncHandler(resetPassword)
);


// =====================================================
// CHANGE PASSWORD
// =====================================================

router.patch(
  "/change-password",
  protect,
  changePasswordValidator,
  validate,
  asyncHandler(changePassword)
);


export default router;

