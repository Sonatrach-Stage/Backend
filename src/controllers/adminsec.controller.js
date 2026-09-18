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

  if (intern.con_status !== "pending") {
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

await Intern.update(
  intern.user_id,
  {
    studies_level: intern.studies_level,
    establishment: intern.establishment,
    start_date: intern.start_date,
    end_date: intern.end_date,
    convention_url: intern.convention_url,
    convention_public_id: intern.convention_public_id,
    con_status: "APPROVED",
    status:"waiting"
  }
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

await Intern.update(
  intern.user_id,
  {
    studies_level: intern.studies_level,
    establishment: intern.establishment,
    start_date: intern.start_date,
    end_date: intern.end_date,
    convention_url: intern.convention_url,
    convention_public_id: intern.convention_public_id,
    con_status: "rejected",
    status:"waiting"
  }
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
  const  supervisorName  = req.body.supervisorName;
  console.log("liliana:",supervisorName);
  
  const companyId = req.adminInfo?.company_id;
console.log("liliana:",req.adminInfo);
console.log("liliana:",req.supervisorInfo);
console.log("liliana:",req.internInfo);
  // =========================================
  // 1. Vérifications des données reçues
  // =========================================

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  if (!internId) {
    const error = new Error("ID du stagiaire obligatoire.");
    error.statusCode = 400;
    throw error;
  }

  if (!supervisorName || !supervisorName.trim()) {
    const error = new Error("Le nom de l'encadrant est obligatoire.");
    error.statusCode = 400;
    throw error;
  }

  // =========================================
  // 2. Vérifier le stagiaire
  // =========================================

  const intern = await Intern.findById(internId);

  if (!intern) {
    const error = new Error("Stagiaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  // =========================================
  // 3. Vérifier que le stagiaire appartient
  //    à la même entreprise
  // =========================================

  if (Number(intern.company_id) !== Number(companyId)) {
    const error = new Error(
      "Vous n'êtes pas autorisé à gérer ce stagiaire."
    );
    error.statusCode = 403;
    throw error;
  }

  // =========================================
  // 4. Vérifier si le stagiaire possède déjà
  //    un encadrant
  // =========================================

  if (intern.supervisor_id) {
    const error = new Error(
      "Ce stagiaire possède déjà un encadrant."
    );
    error.statusCode = 409;
    throw error;
  }

  // =========================================
  // 5. Chercher l'encadrant dans la même
  //    entreprise
  // =========================================

  const supervisor =
    await Supervisor.findByNameAndCompany(
      supervisorName.trim(),
      companyId
    );

  if (!supervisor) {
    const error = new Error(
      "Encadrant introuvable dans votre entreprise."
    );
    error.statusCode = 404;
    throw error;
  }

  // =========================================
  // 6. Vérification supplémentaire de sécurité
  // =========================================

  if (
    supervisor.company_id &&
    Number(supervisor.company_id) !== Number(companyId)
  ) {
    const error = new Error(
      "Cet encadrant n'appartient pas à votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  // =========================================
  // 7. Affectation
  // =========================================

  const updatedRows = await Intern.assignSupervisor(
    supervisor.id,
    intern.id
  );const updateStatus = await Intern.updateStatus(
  intern.user_id,
"supervisor_assigned"
);
  // =========================================
  // 8. Vérifier que l'affectation a réellement
  //    été effectuée
  // =========================================

  if (updatedRows === 0) {
    const error = new Error(
      "L'affectation de l'encadrant a échoué."
    );
    error.statusCode = 500;
    throw error;
  }

  // =========================================
  // 9. Réponse
  // =========================================

  return res.status(200).json({
    success: true,
    message: "Encadrant affecté avec succès.",
    data: {
      internId: intern.id,
      supervisorId: supervisor.id
    }
  });
}

;
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

export const activateSupervisor = async (req, res) => {
  const { superId } = req.params;

  const companyId = req.adminInfo?.company_id;
console.log("companyId*: ",companyId);
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

  const supervisor = await Supervisor.findById(superId);

console.log("superId*: ",superId);
  if (!supervisor) {
    const error = new Error("Encadrant introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (supervisor.company_id !== companyId) {
    const error = new Error(
      "Vous n'êtes pas autorisé à gérer ce stagiaire."
    );
    error.statusCode = 403;
    throw error;
  }

  await User.activate(supervisor.user_id);


  return res.status(200).json({
    success: true,
    message:
      "Encadrant activé.",
  });
};
export const deactivateSupervisor = async (req, res) => {
  const { superId } = req.params;

  const companyId = req.adminInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const supervisor = await Supervisor.findById(superId);

  if (!supervisor) {
    const error = new Error("Encadrant introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (supervisor.company_id !== companyId) {
    const error = new Error(
      "Vous n'êtes pas autorisé à gérer ce stagiaire."
    );
    error.statusCode = 403;
    throw error;
  }

  await User.deactivate(supervisor.user_id);

  return res.status(200).json({
    success: true,
    message: "Compte de l'encadrant désactivé avec succès.",
  });
};