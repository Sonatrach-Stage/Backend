import Document from "../models/documentmodel.js";
import DocumentVersion from "../models/documentversionmodel.js";
import Taches from "../models/tachesmodel.js";

import { extractTextFromFile } from "../utils/textExtractor.js";

import DocumentReview from "../models/documentreviewmodel.js";

import { uploadToCloudinary } from "../utils/cloudinary.js";
import cloudinary from "../utils/cloudinary.js";

import fs from "fs/promises";

import supervisor from "../models/supervisormodel.js";
import Intern from "../models/internmodel.js";

import { createNotification } from "../utils/notification.js";
import { emitNotification } from "../utils/notificationSocket.js";
import { createChunks } from "../utils/chunker.js";
 import { indexDocumentChunks } from "../services/ai/embeddingIndexService.js";

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

  console.log("task_title =", task_title);

  const task_id = await Taches.findByTitle(task_title);

  console.log("task_id =", task_id);

  const document = await Document.create({
    intern_id: req.internInfo.id,
    task_id: task_id,
    title,
    description: description || null,
    document_type
  });

  // =====================================================
  // NOTIFICATION AU SUPERVISEUR
  // =====================================================

  const supervisorData = await supervisor.findById(
    req.internInfo.supervisor_id
  );

  if (supervisorData) {

    const notification = await createNotification({
      user_id: supervisorData.user_id,
      title: "Nouveau document",
      message:
        `Votre stagiaire a créé un nouveau document : "${title}".`,
      type: "DOCUMENT"
    });

    emitNotification(
      supervisorData.user_id,
      notification
    );
  }

  return res.status(201).json({
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

  const versions =
    await DocumentVersion.findByDocument(id);

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

  // =====================================================
  // EXTRACTION DU CONTENU
  // =====================================================

  const fileContent =
    await extractTextFromFile(
      req.file.path,
      req.file.mimetype
    );

  // =====================================================
  // UPLOAD CLOUDINARY
  // =====================================================

  const cloudinaryResult =
    await uploadToCloudinary(
      req.file.path,
      "documents"
    );

  // =====================================================
  // ENREGISTRER LA VERSION
  // =====================================================

  const version =
    await DocumentVersion.create({

      document_id: id,

      version_number: nextVersion,

      file_name: req.file.originalname,

      file_url: cloudinaryResult.secure_url,

      public_id: cloudinaryResult.public_id,

      resource_type:
        cloudinaryResult.resource_type,

      file_content: fileContent,

      uploaded_by: req.user.id
    });

    // ==========================================
// INDEXATION IA 
// ==========================================

    const chunks = createChunks(fileContent);

await indexDocumentChunks({
  documentId: id,
  versionId: version.id,
  chunks
});
  // =====================================================
  // SUPPRIMER LE FICHIER TEMPORAIRE
  // =====================================================

  await fs.unlink(req.file.path);

  // =====================================================
  // MODIFIER LE STATUT DU DOCUMENT
  // =====================================================

  await Document.updateStatus(
    id,
    "PENDING"
  );

  // =====================================================
  // NOTIFICATION AU SUPERVISEUR
  // =====================================================

  const supervisorData =
    await supervisor.findById(
      req.internInfo.supervisor_id
    );

  if (supervisorData) {

    const notification =
      await createNotification({

        user_id: supervisorData.user_id,

        title:
          "Nouvelle version de document",

        message:
          `Votre stagiaire a ajouté la version V${nextVersion} du document "${document.title}".`,

        type: "DOCUMENT",
      });

    emitNotification(
      supervisorData.user_id,
      notification
    );
  }

  return res.status(201).json({
    message:
      `Version V${nextVersion} ajoutée avec succès.`,

    version
  });
};


// =====================================================
// GET PENDING DOCUMENTS
// =====================================================

export const getPendingDocuments = async (req, res) => {

  if (!req.supervisorInfo) {
    const error = new Error(
      "Accès réservé aux superviseurs."
    );
    error.statusCode = 403;
    throw error;
  }

  const documents =
    await Document.findPendingBySupervisor(
      req.supervisorInfo.id
    );

  res.status(200).json({
    message:
      "Documents en attente récupérés avec succès.",

    documents
  });
};


// =====================================================
// REVIEW DOCUMENT
// =====================================================

export const reviewDocument = async (req, res) => {

  // Vérifier que c'est un superviseur
  if (!req.supervisorInfo) {
    const error = new Error(
      "Accès réservé aux superviseurs."
    );
    error.statusCode = 403;
    throw error;
  }

  const { id } = req.params;

  // version_id représente le numéro de version
  // 1 = V1
  // 2 = V2
  // 3 = V3

  const {
    version_id,
    comment,
    status
  } = req.body;

  // =====================================================
  // VÉRIFIER LES CHAMPS OBLIGATOIRES
  // =====================================================

  if (!version_id || !status) {
    const error = new Error(
      "La version et le statut sont obligatoires."
    );
    error.statusCode = 400;
    throw error;
  }

  // =====================================================
  // VÉRIFIER LE STATUT
  // =====================================================

  const allowedStatuses = [
    "APPROVED",
    "REVISION_REQUIRED",
    "REJECTED"
  ];

  if (!allowedStatuses.includes(status)) {
    const error = new Error(
      "Statut de review invalide."
    );
    error.statusCode = 400;
    throw error;
  }

  // =====================================================
  // VÉRIFIER LE DOCUMENT
  // =====================================================

  const document =
    await Document.findById(id);

  if (!document) {
    const error = new Error(
      "Document introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  // =====================================================
  // VÉRIFIER QUE LE SUPERVISEUR EST RESPONSABLE
  // =====================================================

  const supervisorDocument =
    await Document.findBySupervisor(
      req.supervisorInfo.id,
      id
    );

  if (!supervisorDocument) {
    const error = new Error(
      "Vous n'avez pas accès à ce document."
    );
    error.statusCode = 403;
    throw error;
  }

  // =====================================================
  // RÉCUPÉRER LES VERSIONS
  // =====================================================

  const versions =
    await DocumentVersion.findByDocument(id);

  const version = versions.find(
    (version) =>
      version.version_number ===
      Number(version_id)
  );

  if (!version) {
    const error = new Error(
      "Cette version n'appartient pas à ce document."
    );
    error.statusCode = 400;
    throw error;
  }

  // =====================================================
  // CRÉER LA REVIEW
  // =====================================================

  const review =
    await DocumentReview.create({

      document_id: id,

      // ID réel de document_versions
      version_id: version.id,

      supervisor_id:
        req.supervisorInfo.id,

      comment:
        comment || null,

      status
    });

  // =====================================================
  // METTRE À JOUR LE STATUT DU DOCUMENT
  // =====================================================

  await Document.updateStatus(
    id,
    status
  );

  // =====================================================
  // NOTIFICATION À L'INTERN
  // =====================================================

  const internData =
    await Intern.findById(
      document.intern_id
    );

  if (internData) {

    let notificationTitle;
    let notificationMessage;

    if (status === "APPROVED") {

      notificationTitle =
        "Document approuvé";

      notificationMessage =
        `Votre document "${document.title}" a été approuvé par votre superviseur.`;
    }

    if (status === "REVISION_REQUIRED") {

      notificationTitle =
        "Modification demandée";

      notificationMessage =
        `Votre superviseur demande une modification du document "${document.title}".`;
    }

    if (status === "REJECTED") {

      notificationTitle =
        "Document rejeté";

      notificationMessage =
        `Votre document "${document.title}" a été rejeté par votre superviseur.`;
    }

    const notification =
      await createNotification({

        user_id: internData.user_id,

        title: notificationTitle,

        message: notificationMessage,

        type: "DOCUMENT"
      });

    // Notification temps réel
    emitNotification(
      internData.user_id,
      notification
    );
  }

  return res.status(201).json({
    message:
      "Review enregistrée avec succès.",

    review
  });
};


// =====================================================
// GET DOCUMENT REVIEWS
// =====================================================

export const getDocumentReviews = async (req, res) => {

  if (!req.internInfo) {
    const error = new Error(
      "Accès réservé aux stagiaires."
    );
    error.statusCode = 403;
    throw error;
  }

  const { id } = req.params;

  const document =
    await Document.findById(id);

  console.log(
    "document: ",
    document
  );

  if (!document) {
    const error = new Error(
      "Document introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  console.log(
    "document.intern_id: ",
    document.intern_id
  );

  console.log(
    "req.internInfo.id: ",
    req.internInfo.id
  );

  if (
    document.intern_id !==
    req.internInfo.id
  ) {
    const error = new Error(
      "Vous n'avez pas accès aux reviews de ce document."
    );
    error.statusCode = 403;
    throw error;
  }

  const reviews =
    await DocumentReview.findByDocument(id);

  res.status(200).json({
    message:
      "Reviews récupérées avec succès.",

    reviews
  });
};


// =====================================================
// UPDATE DOCUMENT
// =====================================================

export const updateDocument = async (req, res) => {

  if (!req.internInfo) {
    const error = new Error(
      "Accès réservé aux stagiaires."
    );
    error.statusCode = 403;
    throw error;
  }

  const { id } = req.params;

  const {
    title,
    description,
    document_type,
    task_id
  } = req.body;

  const document =
    await Document.findById(id);

  if (!document) {
    const error = new Error(
      "Document introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    document.intern_id !==
    req.internInfo.id
  ) {
    const error = new Error(
      "Vous n'avez pas accès à ce document."
    );
    error.statusCode = 403;
    throw error;
  }

  if (
    !title &&
    !description &&
    !document_type &&
    !task_id
  ) {
    const error = new Error(
      "Au moins un champ doit être fourni."
    );
    error.statusCode = 400;
    throw error;
  }

  const updatedDocument =
    await Document.update(id, {

      title,

      description,

      document_type,

      task_id

    });

  // =====================================================
  // NOTIFICATION AU SUPERVISEUR
  // =====================================================

  const supervisorData =
    await supervisor.findById(
      req.internInfo.supervisor_id
    );

  if (supervisorData) {

    const notification =
      await createNotification({

        user_id: supervisorData.user_id,

        title: "Document modifié",

        message:
          `Votre stagiaire a modifié le document "${document.title}".`,

        type: "DOCUMENT",
      });

    emitNotification(
      supervisorData.user_id,
      notification
    );
  }

  res.status(200).json({
    message:
      "Document modifié avec succès.",

    document: updatedDocument
  });
};


// =====================================================
// DELETE DOCUMENT
// =====================================================

export const deleteDocument = async (req, res) => {

  if (!req.internInfo) {
    const error = new Error(
      "Accès réservé aux stagiaires."
    );
    error.statusCode = 403;
    throw error;
  }

  const { id } = req.params;

  const document =
    await Document.findById(id);

  if (!document) {
    const error = new Error(
      "Document introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  if (
    document.intern_id !==
    req.internInfo.id
  ) {
    const error = new Error(
      "Vous n'avez pas accès à ce document."
    );
    error.statusCode = 403;
    throw error;
  }

  // =====================================================
  // RÉCUPÉRER LES VERSIONS
  // =====================================================

  const versions =
    await DocumentVersion.findByDocument(id);

  // =====================================================
  // SUPPRIMER LES FICHIERS CLOUDINARY
  // =====================================================

  for (const version of versions) {

    if (version.public_id) {

      await cloudinary.uploader.destroy(
        version.public_id,
        {
          resource_type:
            version.resource_type
        }
      );
    }
  }

  // =====================================================
  // RÉCUPÉRER LE SUPERVISEUR AVANT SUPPRESSION
  // =====================================================

  const supervisorData =
    await supervisor.findById(
      req.internInfo.supervisor_id
    );

  // =====================================================
  // SUPPRIMER LE DOCUMENT
  // =====================================================

  await Document.delete(id);

  // =====================================================
  // NOTIFICATION AU SUPERVISEUR
  // =====================================================

  if (supervisorData) {

    const notification =
      await createNotification({

        user_id: supervisorData.user_id,

        title: "Document supprimé",

        message:
          `Votre stagiaire a supprimé le document "${document.title}".`,

        type: "DOCUMENT",
      });

    emitNotification(
      supervisorData.user_id,
      notification
    );
  }

  res.status(200).json({
    message:
      "Document supprimé avec succès."
  });
};


// =====================================================
// GET DOCUMENT VERSION
// =====================================================

export const getDocumentVersion = async (req, res) => {

  const {
    id,
    versionId
  } = req.params;

  const document =
    await Document.findById(id);

  if (!document) {
    const error = new Error(
      "Document introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  // =====================================================
  // CAS 1 : STAGIAIRE
  // =====================================================

  if (req.internInfo) {

    if (
      document.intern_id !==
      req.internInfo.id
    ) {
      const error = new Error(
        "Vous n'avez pas accès à ce document."
      );
      error.statusCode = 403;
      throw error;
    }
  }

  // =====================================================
  // CAS 2 : SUPERVISEUR
  // =====================================================

  else if (req.supervisorInfo) {

    const supervisorDocument =
      await Document.findBySupervisor(
        req.supervisorInfo.id,
        id
      );

    if (!supervisorDocument) {
      const error = new Error(
        "Vous n'avez pas accès à ce document."
      );
      error.statusCode = 403;
      throw error;
    }
  }

  // =====================================================
  // AUTRE UTILISATEUR
  // =====================================================

  else {

    const error = new Error(
      "Accès refusé."
    );
    error.statusCode = 403;
    throw error;
  }

  // =====================================================
  // RÉCUPÉRER LA VERSION
  // =====================================================

  const version =
    await DocumentVersion.findById(
      versionId
    );

  if (!version) {
    const error = new Error(
      "Version introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  // Vérifier que la version appartient au document
  if (
    version.document_id !==
    Number(id)
  ) {
    const error = new Error(
      "Cette version n'appartient pas à ce document."
    );
    error.statusCode = 403;
    throw error;
  }

  res.status(200).json({
    message:
      "Version récupérée avec succès.",

    version
  });
};


// =====================================================
// SEARCH DOCUMENTS
// =====================================================

export const searchDocuments = async (req, res) => {

  const { q } = req.query;

  if (!q || !q.trim()) {
    const error = new Error(
      "Le terme de recherche est obligatoire."
    );
    error.statusCode = 400;
    throw error;
  }

  const search = q.trim();

  let documents;

  if (req.internInfo) {

    documents =
      await Document.searchByIntern(
        req.internInfo.id,
        search
      );

  } else if (req.supervisorInfo) {

    documents =
      await Document.searchBySupervisor(
        req.supervisorInfo.id,
        search
      );

  } else {

    const error = new Error(
      "Accès refusé."
    );
    error.statusCode = 403;
    throw error;
  }

  res.status(200).json({
    message:
      "Recherche effectuée avec succès.",

    search,

    documents
  });
}