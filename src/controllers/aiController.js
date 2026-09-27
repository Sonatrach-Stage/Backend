import { askRAG } from "../services/ai/ragService.js";

import AIConversation from "../models/aiConversationModel.js";
import AIMessage from "../models/aiMessageModel.js";
import { summarizeDocument } from "../services/ai/documentSummaryService.js";
import {findSimilarProjects} from "../services/ai/similarProjectsService.js";
import { compareProjects } from "../services/ai/projectComparisonService.js";

export const askAI = async (req, res) => {

  const { question, conversationId } = req.body;

  // ==========================================
  // 1. Vérifier la question
  // ==========================================

  if (!question || !question.trim()) {
    const error = new Error(
      "La question est obligatoire."
    );
    error.statusCode = 400;
    throw error;
  }

  // ==========================================
  // 2. Utilisateur connecté
  // ==========================================

  const userId = req.user?.id;

  if (!userId) {
    const error = new Error(
      "Utilisateur non authentifié."
    );
    error.statusCode = 401;
    throw error;
  }

  // ==========================================
  // 3. Récupérer l'entreprise
  // ==========================================

  const companyId =
    req.internInfo?.company_id ||
    req.supervisorInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  // ==========================================
  // 4. Créer ou récupérer la conversation
  // ==========================================

  let conversation;

  if (conversationId) {

    conversation =
      await AIConversation.findById(
        conversationId
      );

    if (!conversation) {
      const error = new Error(
        "Conversation introuvable."
      );
      error.statusCode = 404;
      throw error;
    }

    // La conversation doit appartenir
    // à l'utilisateur connecté
    if (conversation.user_id !== userId) {
      const error = new Error(
        "Vous n'avez pas accès à cette conversation."
      );
      error.statusCode = 403;
      throw error;
    }

  } else {

    conversation =
      await AIConversation.create(
        userId,
        question.slice(0, 80)
      );
  }

  // ==========================================
  // 5. Récupérer l'ancien historique
  // ==========================================

  const history =
  await AIMessage.findRecentByConversation(
    conversation.id,
    10
  );
  console.log("voici l'historique: ",history);
  // ==========================================
  // 6. Enregistrer la nouvelle question
  // ==========================================

  await AIMessage.create(
    conversation.id,
    "user",
    question
  );

  // ==========================================
  // 7. Appeler le RAG
  // ==========================================

  const result = await askRAG(
    question,
    companyId,
    history
  );

  // ==========================================
  // 8. Enregistrer la réponse de l'IA
  // ==========================================

  await AIMessage.create(
    conversation.id,
    "assistant",
    result.answer
  );

  // ==========================================
  // 9. Mettre à jour la conversation
  // ==========================================

  await AIConversation.updateTimestamp(
    conversation.id
  );

  // ==========================================
  // 10. Réponse au frontend
  // ==========================================

  return res.status(200).json({

    conversation: {
      id: conversation.id,
      title: conversation.title
    },

    answer: result.answer,

    sources: result.sources

  });
};
// ==========================================
// RÉSUMER UN DOCUMENT
// ==========================================

export const summarizeAI = async (req, res) => {

  // ==========================================
  // 1. UTILISATEUR CONNECTÉ
  // ==========================================

  const userId = req.user?.id;

  if (!userId) {
    const error = new Error(
      "Utilisateur non authentifié."
    );
    error.statusCode = 401;
    throw error;
  }


  // ==========================================
  // 2. RÉCUPÉRER L'ID DU DOCUMENT
  // ==========================================

  const { id } = req.params;


  if (!id) {
    const error = new Error(
      "L'identifiant du document est obligatoire."
    );
    error.statusCode = 400;
    throw error;
  }


  // ==========================================
  // 3. RÉCUPÉRER L'ENTREPRISE
  // ==========================================

  const companyId =
    req.internInfo?.company_id ||
    req.supervisorInfo?.company_id;


  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }


  // ==========================================
  // 4. GÉNÉRER LE RÉSUMÉ
  // ==========================================

  const result =
    await summarizeDocument(
      id,
      companyId
    );


  // ==========================================
  // 5. RÉPONSE
  // ==========================================

  return res.status(200).json(result);
};
export const getSimilarProjects = async (req, res) => {

  const userId = req.user?.id;

  if (!userId) {
    const error = new Error(
      "Utilisateur non authentifié."
    );
    error.statusCode = 401;
    throw error;
  }

  const { id } = req.params;

  if (!id) {
    const error = new Error(
      "L'identifiant du document est obligatoire."
    );
    error.statusCode = 400;
    throw error;
  }

  const companyId =
    req.internInfo?.company_id ||
    req.supervisorInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const similarProjects =
    await findSimilarProjects(
      id,
      companyId,
      5
    );

  return res.status(200).json({
    documentId: Number(id),
    similarProjects
  });
};

export const compareAIProjects = async (
  req,
  res
) => {

  // ==========================================
  // AUTHENTIFICATION
  // ==========================================

  const userId = req.user?.id;

  if (!userId) {
    const error = new Error(
      "Utilisateur non authentifié."
    );

    error.statusCode = 401;

    throw error;
  }

  // ==========================================
  // RÉCUPÉRER LES DOCUMENTS
  // ==========================================

  const {
    documentId1,
    documentId2
  } = req.body;

  if (!documentId1 || !documentId2) {
    const error = new Error(
      "Les deux identifiants des documents sont obligatoires."
    );

    error.statusCode = 400;

    throw error;
  }

  // ==========================================
  // EMPÊCHER LE MÊME DOCUMENT
  // ==========================================

  if (
    Number(documentId1) ===
    Number(documentId2)
  ) {
    const error = new Error(
      "Les deux documents doivent être différents."
    );

    error.statusCode = 400;

    throw error;
  }

  // ==========================================
  // COMPANY ID
  // ==========================================

  const companyId =
    req.internInfo?.company_id ||
    req.supervisorInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );

    error.statusCode = 403;

    throw error;
  }

  // ==========================================
  // COMPARAISON
  // ==========================================

  const result =
    await compareProjects(
      Number(documentId1),
      Number(documentId2),
      companyId
    );

  // ==========================================
  // RÉPONSE
  // ==========================================

  return res.status(200).json(result);
};

// ==========================================
// RÉCUPÉRER TOUTES LES CONVERSATIONS AI
// ==========================================

export const getConversations = async (req, res) => {

  const userId = req.user?.id;

  if (!userId) {
    const error = new Error(
      "Utilisateur non authentifié."
    );
    error.statusCode = 401;
    throw error;
  }

  const conversations =
    await AIConversation.findByUser(userId);

  return res.status(200).json({
    conversations
  });
};


// ==========================================
// RÉCUPÉRER UNE CONVERSATION + SES MESSAGES
// ==========================================

export const getConversation = async (req, res) => {

  const userId = req.user?.id;

  if (!userId) {
    const error = new Error(
      "Utilisateur non authentifié."
    );
    error.statusCode = 401;
    throw error;
  }

  const { id } = req.params;

  const conversation =
    await AIConversation.findById(id);

  if (!conversation) {
    const error = new Error(
      "Conversation introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  // Vérifier que la conversation
  // appartient bien à l'utilisateur
  if (conversation.user_id !== userId) {
    const error = new Error(
      "Vous n'avez pas accès à cette conversation."
    );
    error.statusCode = 403;
    throw error;
  }

  const messages =
    await AIMessage.findByConversation(id);

  return res.status(200).json({
    conversation: {
      id: conversation.id,
      title: conversation.title,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at
    },
    messages
  });
};


// ==========================================
// SUPPRIMER UNE CONVERSATION AI
// ==========================================

export const deleteConversation = async (req, res) => {

  const userId = req.user?.id;

  if (!userId) {
    const error = new Error(
      "Utilisateur non authentifié."
    );
    error.statusCode = 401;
    throw error;
  }

  const { id } = req.params;

  const conversation =
    await AIConversation.findById(id);

  if (!conversation) {
    const error = new Error(
      "Conversation introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  // Vérifier que la conversation
  // appartient bien à l'utilisateur
  if (conversation.user_id !== userId) {
    const error = new Error(
      "Vous n'avez pas accès à cette conversation."
    );
    error.statusCode = 403;
    throw error;
  }

  await AIConversation.delete(id);

  return res.status(200).json({
    message: "Conversation supprimée avec succès."
  });
};