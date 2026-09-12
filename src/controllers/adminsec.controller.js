import User from "../models/usermodel.js";
import Intern from "../models/internmodel.js";
import Supervisor from "../models/supervisormodel.js";

// =====================================================
// GET COMPANY PENDING INTERNS
// Récupérer les stagiaires en attente de validation
// =====================================================

export const getCompanyPendingInterns = async (req, res) => {
  const companyId = req.adminInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const interns = await Intern.findPendingByCompanyId(companyId);

  return res.status(200).json({
    success: true,
    count: interns.length,
    interns,
  });
};

// =====================================================
// APPROVE INTERN
// Approuver l'inscription d'un stagiaire
// =====================================================

export const approveIntern = async (req, res) => {
  const { internId } = req.params;

  const companyId = req.adminInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  // -----------------------------------------
  // Vérifier que le stagiaire existe
  // et appartient à cette entreprise
  // -----------------------------------------

  const intern = await Intern.findById(internId);

  if (!intern) {
    const error = new Error("Stagiaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (intern.company_id !== companyId) {
    const error = new Error(
      "Vous n'êtes pas autorisé à gérer ce stagiaire."
    );
    error.statusCode = 403;
    throw error;
  }

  // -----------------------------------------
  // Vérifier le statut
  // -----------------------------------------

  if (intern.status !== "pending") {
    const error = new Error(
      "Ce stagiaire n'est pas en attente de validation."
    );
    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // Activer le compte
  // -----------------------------------------

  await User.activate(intern.user_id);

  // -----------------------------------------
  // Mettre à jour le statut du stagiaire
  // -----------------------------------------

  await Intern.updateStatus(
    intern.id,
    "waiting_supervisor"
  );

  return res.status(200).json({
    success: true,
    message:
      "Stagiaire approuvé. Veuillez maintenant lui attribuer un encadrant.",
  });
};

// =====================================================
// REJECT INTERN
// Refuser l'inscription d'un stagiaire
// =====================================================

export const rejectIntern = async (req, res) => {
  const { internId } = req.params;

  const companyId = req.adminInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  // -----------------------------------------
  // Vérifier le stagiaire
  // -----------------------------------------

  const intern = await Intern.findById(internId);

  if (!intern) {
    const error = new Error("Stagiaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  // -----------------------------------------
  // Vérifier l'entreprise
  // -----------------------------------------

  if (intern.company_id !== companyId) {
    const error = new Error(
      "Vous n'êtes pas autorisé à gérer ce stagiaire."
    );
    error.statusCode = 403;
    throw error;
  }

  // -----------------------------------------
  // Désactiver le compte
  // -----------------------------------------

  await User.deactivate(intern.user_id);

  // -----------------------------------------
  // Mettre à jour le statut
  // -----------------------------------------

  await Intern.updateStatus(
    intern.id,
    "rejected"
  );

  return res.status(200).json({
    success: true,
    message: "Inscription du stagiaire refusée.",
  });
};

// =====================================================
// ASSIGN SUPERVISOR
// Affecter un encadrant à un stagiaire
// =====================================================

export const assignSupervisor = async (req, res) => {
  const { internId } = req.params;
  const { supervisorId } = req.body;

  const companyId = req.adminInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  // -----------------------------------------
  // Vérifier le stagiaire
  // -----------------------------------------

  const intern = await Intern.findById(internId);

  if (!intern) {
    const error = new Error("Stagiaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (intern.company_id !== companyId) {
    const error = new Error(
      "Vous n'êtes pas autorisé à gérer ce stagiaire."
    );
    error.statusCode = 403;
    throw error;
  }

  // -----------------------------------------
  // Vérifier l'encadrant
  // -----------------------------------------

  const supervisor = await Supervisor.findById(
    supervisorId
  );

  if (!supervisor) {
    const error = new Error("Encadrant introuvable.");
    error.statusCode = 404;
    throw error;
  }

  // -----------------------------------------
  // Vérifier que l'encadrant appartient
  // à la même entreprise
  // -----------------------------------------

  if (supervisor.company_id !== companyId) {
    const error = new Error(
      "Cet encadrant n'appartient pas à votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  // -----------------------------------------
  // Affecter l'encadrant
  // -----------------------------------------

  await Intern.assignSupervisor(
    intern.id,
    supervisor.id
  );

  return res.status(200).json({
    success: true,
    message: "Encadrant affecté avec succès.",
  });
};

// =====================================================
// ACTIVATE INTERN
// Activer manuellement un compte stagiaire
// =====================================================

export const activateIntern = async (req, res) => {
  const { internId } = req.params;

  const companyId = req.adminInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const intern = await Intern.findById(internId);

  if (!intern) {
    const error = new Error("Stagiaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (intern.company_id !== companyId) {
    const error = new Error(
      "Vous n'êtes pas autorisé à gérer ce stagiaire."
    );
    error.statusCode = 403;
    throw error;
  }

  await User.activate(intern.user_id);

  return res.status(200).json({
    success: true,
    message: "Compte du stagiaire activé avec succès.",
  });
};

// =====================================================
// DEACTIVATE INTERN
// Désactiver un compte stagiaire
// =====================================================

export const deactivateIntern = async (req, res) => {
  const { internId } = req.params;

  const companyId = req.adminInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const intern = await Intern.findById(internId);

  if (!intern) {
    const error = new Error("Stagiaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (intern.company_id !== companyId) {
    const error = new Error(
      "Vous n'êtes pas autorisé à gérer ce stagiaire."
    );
    error.statusCode = 403;
    throw error;
  }

  await User.deactivate(intern.user_id);

  return res.status(200).json({
    success: true,
    message: "Compte du stagiaire désactivé avec succès.",
  });
};

// =====================================================
// GET COMPANY SUPERVISORS
// Récupérer les encadrants de l'entreprise
// =====================================================

export const getCompanySupervisors = async (req, res) => {
  const companyId = req.adminInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const supervisors =
    await Supervisor.findByCompanyId(companyId);

  return res.status(200).json({
    success: true,
    count: supervisors.length,
    supervisors,
  });
};

// =====================================================
// GET COMPANY INTERNS
// Récupérer tous les stagiaires de l'entreprise
// =====================================================

export const getCompanyInterns = async (req, res) => {
  const companyId = req.adminInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const interns = await Intern.findByCompanyId(companyId);

  return res.status(200).json({
    success: true,
    count: interns.length,
    interns,
  });
};