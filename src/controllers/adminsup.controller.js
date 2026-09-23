import Company from "../models/companymodel.js";
import User from "../models/usermodel.js";
import { createNotification } from "../utils/notification.js";
import { emitNotification } from "../utils/notificationSocket.js";

// =====================================================
// GET ALL COMPANIES
// Récupérer toutes les entreprises
// =====================================================

export const getAllCompanies = async (req, res) => {
  const companies = await Company.findAll();

  return res.status(200).json({
    success: true,
    companies,
  });
};

// =====================================================
// GET PENDING COMPANIES
// Récupérer les entreprises en attente
// =====================================================

export const getPendingCompanies = async (req, res) => {
  const companies = await Company.findPending();

  return res.status(200).json({
    success: true,
    companies,
  });
};

// =====================================================
// GET APPROVED COMPANIES
// Récupérer les entreprises approuvées
// =====================================================

export const getApprovedCompanies = async (req, res) => {
  const companies = await Company.findAllApproved();

  return res.status(200).json({
    success: true,
    companies,
  });
};

// =====================================================
// APPROVE COMPANY
// Approuver une entreprise
// =====================================================

export const approveCompany = async (req, res) => {
  const { id } = req.params;

  // -----------------------------------------
  // Vérifier que l'entreprise existe
  // -----------------------------------------

  const company = await Company.findById(id);

  if (!company) {
    const error = new Error("Company not found");
    error.statusCode = 404;
    throw error;
  }

  // -----------------------------------------
  // Vérifier si elle est déjà approuvée
  // -----------------------------------------

  if (company.company_status === "APPROVED") {
    const error = new Error("Company is already approved");
    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // Approuver l'entreprise
  // -----------------------------------------

  const updatedCompany = await Company.approve(id);

  // -----------------------------------------
  // Activer le SECONDARY_ADMIN
  // -----------------------------------------

  if (company.user_id) {
    await User.activate(company.user_id);

    // -----------------------------------------
    // Créer la notification en DB
    // -----------------------------------------

    const notification = await createNotification({
      user_id: company.user_id,
      title: "Entreprise approuvée",
      message:
        "Votre entreprise a été approuvée. Votre compte administrateur est maintenant actif.",
      type: "COMPANY",
    });

    // -----------------------------------------
    // Envoyer la notification en temps réel
    // -----------------------------------------

    emitNotification(
      company.user_id,
      notification
    );
  }

  return res.status(200).json({
    success: true,
    message: "Company approved successfully",
    company: updatedCompany,
  });
};

// =====================================================
// REJECT COMPANY
// Refuser une entreprise
// =====================================================

export const rejectCompany = async (req, res) => {
  const { id } = req.params;

  // -----------------------------------------
  // Vérifier que l'entreprise existe
  // -----------------------------------------

  const company = await Company.findById(id);

  if (!company) {
    const error = new Error("Company not found");
    error.statusCode = 404;
    throw error;
  }

  // -----------------------------------------
  // Refuser l'entreprise
  // -----------------------------------------

  const updatedCompany = await Company.reject(id);

  // -----------------------------------------
  // Notification au SECONDARY_ADMIN
  // -----------------------------------------

  if (company.user_id) {
    const notification = await createNotification({
      user_id: company.user_id,
      title: "Entreprise refusée",
      message:
        "Votre demande d'inscription de l'entreprise a été refusée.",
      type: "COMPANY",
    });

    // -----------------------------------------
    // Envoyer en temps réel
    // -----------------------------------------

    emitNotification(
      company.user_id,
      notification
    );
  }

  return res.status(200).json({
    success: true,
    message: "Company rejected successfully",
    company: updatedCompany,
  });
};

// =====================================================
// DELETE COMPANY
// Supprimer une entreprise
// =====================================================

export const deleteCompany = async (req, res) => {
  const { id } = req.params;

  // -----------------------------------------
  // Vérifier que l'entreprise existe
  // -----------------------------------------

  const company = await Company.findById(id);

  if (!company) {
    const error = new Error("Company not found");
    error.statusCode = 404;
    throw error;
  }

  // -----------------------------------------
  // Supprimer l'entreprise
  // -----------------------------------------

  await Company.delete(id);

  return res.status(200).json({
    success: true,
    message: "Company deleted successfully",
  });
};