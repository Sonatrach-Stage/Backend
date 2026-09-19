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
  activateSupervisor,
  deactivateSupervisor,
  getActiveInterns,
  getDesactiveInterns,
  getActiveSupervisor,
  getDesactiveSupervisor
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
router.use(restrictTo("SECONDARY_ADMIN"));

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
  "/interns/:internId/desactivate",
  asyncHandler(deactivateIntern)
);
// Activer un compte encadrant
router.patch(
  "/supervisors/:superId/activate",
  asyncHandler(activateSupervisor)
);

// Désactiver un compte encadrant
router.patch(
  "/supervisors/:superId/desactivate",
  asyncHandler(deactivateSupervisor)
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
router.get(
  "/interns/actives",
  asyncHandler(getActiveInterns)
);
router.get(
  "/interns/desactives",
  asyncHandler(getDesactiveInterns)
);
router.get(
  "/supervisors/actives",
  asyncHandler(getActiveSupervisor)
);
router.get(
  "/supervisors/desactives",
  asyncHandler(getDesactiveSupervisor)
);

export default router;