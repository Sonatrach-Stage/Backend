import Document from "../models/documentmodel.js";
import DocumentVersion from "../models/documentversionmodel.js";
import Taches from "../models/tachesmodel.js";
import DocumentReview from "../models/documentreviewmodel.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import fs from "fs/promises";
// =====================================================
// CREATE DOCUMENT
// =====================================================

export const createDocument = async (req, res) => {

  if (!req.internInfo) {
    const error = new Error(
      "Seul un stagiaire peut créer un document."
    );
    error.statusCode = 403;
    throw error;
  }

  const {
    title,
    description,
    document_type,
    task_title
  } = req.body;

  if (!title || !document_type) {
    const error = new Error(
      "Le titre et le type du document sont obligatoires."
    );
    error.statusCode = 400;
    throw error;
  }
const task_id= await Taches.findByTitle(task_title);
  const document = await Document.create({
    intern_id: req.internInfo.id,
    task_id: task_id || null,
    title,
    description: description || null,
    document_type
  });

  res.status(201).json({
    message: "Document créé avec succès.",
    document
  });
};


// =====================================================
// GET MY DOCUMENTS
// =====================================================

export const getMyDocuments = async (req, res) => {

  if (!req.internInfo) {
    const error = new Error(
      "Accès réservé aux stagiaires."
    );
    error.statusCode = 403;
    throw error;
  }

  const documents = await Document.findByIntern(
    req.internInfo.id
  );

  res.status(200).json({
    message: "Documents récupérés avec succès.",
    documents
  });
};


// =====================================================
// GET MY DOCUMENT BY ID
// =====================================================

export const getMyDocumentById = async (req, res) => {

  if (!req.internInfo) {
    const error = new Error(
      "Accès réservé aux stagiaires."
    );
    error.statusCode = 403;
    throw error;
  }

  const { id } = req.params;

  const document = await Document.findById(id);

  if (!document) {
    const error = new Error(
      "Document introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  // Le document doit appartenir au stagiaire connecté
  if (document.intern_id !== req.internInfo.id) {
    const error = new Error(
      "Vous n'avez pas accès à ce document."
    );
    error.statusCode = 403;
    throw error;
  }

  res.status(200).json({
    message: "Document récupéré avec succès.",
    document
  });
};


// =====================================================
// GET DOCUMENT VERSIONS
// =====================================================

export const getDocumentVersions = async (req, res) => {

  if (!req.internInfo) {
    const error = new Error(
      "Accès réservé aux stagiaires."
    );
    error.statusCode = 403;
    throw error;
  }

  const { id } = req.params;

  const document = await Document.findById(id);

  if (!document) {
    const error = new Error(
      "Document introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  // Vérifier que le document appartient au stagiaire
  if (document.intern_id !== req.internInfo.id) {
    const error = new Error(
      "Vous n'avez pas accès à ce document."
    );
    error.statusCode = 403;
    throw error;
  }

  const versions = await DocumentVersion.findByDocument(id);

  res.status(200).json({
    message: "Versions récupérées avec succès.",
    versions
  });
};
// =====================================================
// ADD DOCUMENT VERSION
// POST /documents/:id/versions
// INTERN
// =====================================================

export const addDocumentVersion = async (req, res) => {

  if (!req.internInfo) {
    const error = new Error(
      "Accès réservé aux stagiaires."
    );
    error.statusCode = 403;
    throw error;
  }

  // Vérifier qu'un fichier a été envoyé
  if (!req.file) {
    const error = new Error(
      "Veuillez sélectionner un fichier."
    );
    error.statusCode = 400;
    throw error;
  }

  const { id } = req.params;

  // Vérifier que le document existe
  const document = await Document.findById(id);

  if (!document) {
    const error = new Error(
      "Document introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  // Vérifier que le document appartient au stagiaire
  if (document.intern_id !== req.internInfo.id) {
    const error = new Error(
      "Vous n'avez pas accès à ce document."
    );
    error.statusCode = 403;
    throw error;
  }

  // Chercher la dernière version
  const latestVersion =
    await DocumentVersion.findLatest(id);

  // Calculer automatiquement le numéro de version
  const nextVersion = latestVersion
    ? latestVersion.version_number + 1
    : 1;

  // Upload vers Cloudinary
  const cloudinaryResult = await uploadToCloudinary(
    req.file.path,
    "documents"
  );

  // Enregistrer la version dans PostgreSQL
  const version = await DocumentVersion.create({
    document_id: id,
    version_number: nextVersion,
    file_name: req.file.originalname,
    file_url: cloudinaryResult.secure_url,
    public_id: cloudinaryResult.public_id,
    uploaded_by: req.user.id
  });

  // Supprimer le fichier temporaire
  await fs.unlink(req.file.path);

  // Modifier le document
  await Document.updateStatus(id, "PENDING");

  res.status(201).json({
    message: `Version V${nextVersion} ajoutée avec succès.`,
    version
  });
};
export const getPendingDocuments = async (req, res) => {
  if (!req.supervisorInfo) {
    const error = new Error("Accès réservé aux superviseurs.");
    error.statusCode = 403;
    throw error;
  }

  const documents = await Document.findPendingBySupervisor(
    req.supervisorInfo.id
  );

  res.status(200).json({
    message: "Documents en attente récupérés avec succès.",
    documents
  });
};
export const reviewDocument = async (req, res) => {
  if (!req.supervisorInfo) {
    const error = new Error("Accès réservé aux superviseurs.");
    error.statusCode = 403;
    throw error;
  }

  const { id } = req.params;

  const { version_id, comment, status } = req.body;

  if (!version_id || !status) {
    const error = new Error(
      "La version et le statut sont obligatoires."
    );
    error.statusCode = 400;
    throw error;
  }

  const allowedStatuses = [
    "APPROVED",
    "REVISION_REQUIRED",
    "REJECTED"
  ];

  if (!allowedStatuses.includes(status)) {
    const error = new Error("Statut de review invalide.");
    error.statusCode = 400;
    throw error;
  }

  const document = await Document.findById(id);

  if (!document) {
    const error = new Error("Document introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const versions = await DocumentVersion.findByDocument(id);

  const versionExists = versions.some(
    (version) => version.id === Number(version_id)
  );

  if (!versionExists) {
    const error = new Error(
      "Cette version n'appartient pas à ce document."
    );
    error.statusCode = 400;
    throw error;
  }

  const supervisorDocuments =
    await Document.findPendingBySupervisor(
      req.supervisorInfo.id
    );

  const isHisDocument = supervisorDocuments.some(
    (doc) => doc.id === Number(id)
  );
console.log("supervisorDocuments: ",supervisorDocuments);
  if (!isHisDocument) {
    const error = new Error(
      "Vous n'avez pas accès à ce document."
    );
    error.statusCode = 403;
    throw error;
  }

  const review = await DocumentReview.create({
    document_id: id,
    version_id,
    supervisor_id: req.supervisorInfo.id,
    comment: comment || null,
    status
  });

  await Document.updateStatus(id, status);

  res.status(201).json({
    message: "Review enregistrée avec succès.",
    review
  });
};
export const getDocumentReviews = async (req, res) => {
  if (!req.internInfo) {
    const error = new Error("Accès réservé aux stagiaires.");
    error.statusCode = 403;
    throw error;
  }

  const { id } = req.params;

  const document = await Document.findById(id);
console.log("document: ",document);
  if (!document) {
    const error = new Error("Document introuvable.");
    error.statusCode = 404;
    throw error;
  }
console.log("document.intern_id: ",document.intern_id);
console.log("req.internInfo.id: ",req.internInfo.id);
  if (document.intern_id !== req.internInfo.id) {
    const error = new Error(
      "Vous n'avez pas accès aux reviews de ce document."
    );
    error.statusCode = 403;
    throw error;
  }

  const reviews = await DocumentReview.findByDocument(id);

  res.status(200).json({
    message: "Reviews récupérées avec succès.",
    reviews
  });
};