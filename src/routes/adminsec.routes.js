import express from "express";

import {
  getCompanyPendingInterns,
  approveIntern,
  rejectIntern,
  assignSupervisor,
  activateIntern,
  deactivateIntern,
  getCompanySupervisors,
  getCompanyInterns,
} from "../controllers/adminsec.controller.js";

import { protect, restrictTo } from "../middlewares/auth.middleware.js";

import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

// =====================================================
// ADMIN SECONDARY ROUTES
// =====================================================

// Toutes les routes de ce fichier nécessitent :
// 1. un utilisateur authentifié
// 2. le rôle ADMIN SECONDARY

router.use(protect);
router.use(restrictTo("admin_secondaire"));

// =====================================================
// INTERNS
// =====================================================

// Récupérer les stagiaires en attente
router.get(
  "/interns/pending",
  asyncHandler(getCompanyPendingInterns)
);

// Récupérer tous les stagiaires de l'entreprise
router.get(
  "/interns",
  asyncHandler(getCompanyInterns)
);

// Approuver un stagiaire
router.patch(
  "/interns/:internId/approve",
  asyncHandler(approveIntern)
);

// Refuser un stagiaire
router.patch(
  "/interns/:internId/reject",
  asyncHandler(rejectIntern)
);

// Activer un compte stagiaire
router.patch(
  "/interns/:internId/activate",
  asyncHandler(activateIntern)
);

// Désactiver un compte stagiaire
router.patch(
  "/interns/:internId/deactivate",
  asyncHandler(deactivateIntern)
);

// =====================================================
// SUPERVISORS
// =====================================================

// Récupérer les encadrants de l'entreprise
router.get(
  "/supervisors",
  asyncHandler(getCompanySupervisors)
);

// Affecter un encadrant à un stagiaire
router.patch(
  "/interns/:internId/supervisor",
  asyncHandler(assignSupervisor)
);

export default router;