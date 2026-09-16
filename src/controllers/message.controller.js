import Conversation from "../models/conversationmodel.js";
import Message from "../models/messagemodel.js";
import pool from "../config/db.js";
import User from "../models/usermodel.js"

// =====================================================
// GET OR CREATE CONVERSATION
// SUPERVISOR <-> INTERN
// =====================================================

export const getOrCreateConversation = async (req, res) => {
  try {
    // ==========================================
    // 1. Utilisateur connecté
    // ==========================================

    const currentUserId = req.user.id;

    // L'utilisateur avec qui on veut discuter
    const { user_name: targetUserName } = req.body;

    if (!targetUserName) {
      return res.status(400).json({
        message: "user_Name est obligatoire."
      });
    }
const user= await User.findByName(targetUserName);
const targetUserId= user.id;



    if (Number(currentUserId) === Number(targetUserId)) {
      return res.status(400).json({
        message: "Vous ne pouvez pas créer une conversation avec vous-même."
      });
    }

    // ==========================================
    // 2. Chercher si currentUser est SUPERVISOR
    // ==========================================

    const supervisorResult = await pool.query(
      `
      SELECT
        s.id,
        s.user_id,
        s.company_id,
        u.name,
        u.email
      FROM supervisor s
      JOIN users u ON u.id = s.user_id
      WHERE s.user_id = $1
      `,
      [currentUserId]
    );
console.log("supervisorResult",supervisorResult);
    // ==========================================
    // 3. Chercher si currentUser est INTERN
    // ==========================================

    const internResult = await pool.query(
      `
      SELECT
        i.id,
        i.user_id,
        i.supervisor_id,
        i.company_id,
        u.name,
        u.email
      FROM intern i
      JOIN users u ON u.id = i.user_id
      WHERE i.user_id = $1
      `,
      [currentUserId]
    );
console.log("internResult",internResult);
    let conversation;

    // =====================================================
    // CAS 1 : CURRENT USER = SUPERVISOR
    // =====================================================

    if (supervisorResult.rows.length > 0) {

      const supervisor = supervisorResult.rows[0];

      // ------------------------------------------
      // Chercher le target comme INTERN
      // ------------------------------------------

      const targetInternResult = await pool.query(
        `
        SELECT
          i.id,
          i.user_id,
          i.supervisor_id,
          i.company_id,
          u.name,
          u.email
        FROM intern i
        JOIN users u ON u.id = i.user_id
        WHERE i.user_id = $1
        `,
        [targetUserId]
      );

      if (targetInternResult.rows.length === 0) {
        return res.status(404).json({
          message: "Le destinataire n'est pas un stagiaire."
        });
      }

      const intern = targetInternResult.rows[0];

      // ------------------------------------------
      // Vérifier que le stagiaire appartient
      // à ce superviseur
      // ------------------------------------------

      if (Number(intern.supervisor_id) !== Number(supervisor.id)) {
        return res.status(403).json({
          message: "Ce stagiaire ne vous est pas affecté."
        });
      }

      // ------------------------------------------
      // Vérifier la même entreprise
      // ------------------------------------------

      if (Number(intern.company_id) !== Number(supervisor.company_id)) {
        return res.status(403).json({
          message: "Le stagiaire et le superviseur ne sont pas dans la même entreprise."
        });
      }

      // ------------------------------------------
      // Chercher la conversation
      // ------------------------------------------

      conversation = await Conversation.findByParticipants(
        supervisor.id,
        intern.id
      );

      // ------------------------------------------
      // Si elle n'existe pas → création
      // ------------------------------------------

      if (!conversation) {
        conversation = await Conversation.create(
          supervisor.id,
          intern.id
        );
      }

      return res.status(200).json({
        message: "Conversation récupérée avec succès.",
        conversation
      });
    }

    // =====================================================
    // CAS 2 : CURRENT USER = INTERN
    // =====================================================

    if (internResult.rows.length > 0) {

      const intern = internResult.rows[0];

      // ------------------------------------------
      // Vérifier que le stagiaire possède
      // un superviseur
      // ------------------------------------------

      if (!intern.supervisor_id) {
        return res.status(400).json({
          message: "Vous n'avez pas encore de superviseur."
        });
      }

      // ------------------------------------------
      // Chercher le target comme SUPERVISOR
      // ------------------------------------------

      const targetSupervisorResult = await pool.query(
        `
        SELECT
          s.id,
          s.user_id,
          s.company_id,
          u.name,
          u.email
        FROM supervisor s
        JOIN users u ON u.id = s.user_id
        WHERE s.user_id = $1
        `,
        [targetUserId]
      );

      if (targetSupervisorResult.rows.length === 0) {
        return res.status(404).json({
          message: "Le destinataire n'est pas un superviseur."
        });
      }

      const supervisor = targetSupervisorResult.rows[0];

      // ------------------------------------------
      // Vérifier que c'est bien son superviseur
      // ------------------------------------------
console.log("mon supervisor.id",supervisor.id)
console.log("mon intern.supervisor_id",intern.supervisor_id)
console.log("mon intern",intern)
console.log("mon supervisor",supervisor)
      if (Number(intern.supervisor_id) !== Number(supervisor.id)) {
        return res.status(403).json({
          message: "Ce superviseur ne vous est pas affecté."
        });
      }

      // ------------------------------------------
      // Vérifier la même entreprise
      // ------------------------------------------

      if (Number(intern.company_id) !== Number(supervisor.company_id)) {
        return res.status(403).json({
          message: "Le stagiaire et le superviseur ne sont pas dans la même entreprise."
        });
      }

      // ------------------------------------------
      // Chercher la conversation
      // ------------------------------------------

      conversation = await Conversation.findByParticipants(
        supervisor.id,
        intern.id
      );

      // ------------------------------------------
      // Si elle n'existe pas → création
      // ------------------------------------------

      if (!conversation) {
        conversation = await Conversation.create(
          supervisor.id,
          intern.id
        );
      }

      return res.status(200).json({
        message: "Conversation récupérée avec succès.",
        conversation
      });
    }

    // =====================================================
    // CAS 3 : utilisateur qui n'est ni INTERN ni SUPERVISOR
    // =====================================================

    return res.status(403).json({
      message: "Seuls les superviseurs et les stagiaires peuvent utiliser le chat."
    });

  } catch (error) {

    console.error(
      "Erreur getOrCreateConversation:",
      error
    );

    return res.status(500).json({
      message: "Erreur serveur."
    });
  }
};


// =====================================================
// GET MY CONVERSATIONS
// =====================================================

export const getMyConversations = async (req, res) => {
  try {

    const userId = req.user.id;

    // ------------------------------------------
    // Est-ce un superviseur ?
    // ------------------------------------------

    const supervisorResult = await pool.query(
      `
      SELECT id
      FROM supervisor
      WHERE user_id = $1
      `,
      [userId]
    );

    if (supervisorResult.rows.length > 0) {

      const supervisorId = supervisorResult.rows[0].id;

      const conversations =
        await Conversation.findBySupervisor(supervisorId);

      return res.status(200).json({
        conversations
      });
    }

    // ------------------------------------------
    // Est-ce un stagiaire ?
    // ------------------------------------------

    const internResult = await pool.query(
      `
      SELECT id
      FROM intern
      WHERE user_id = $1
      `,
      [userId]
    );

    if (internResult.rows.length > 0) {

      const internId = internResult.rows[0].id;

      const conversations =
        await Conversation.findByIntern(internId);

      return res.status(200).json({
        conversations
      });
    }

    return res.status(403).json({
      message: "Utilisateur non autorisé à utiliser le chat."
    });

  } catch (error) {

    console.error(
      "Erreur getMyConversations:",
      error
    );

    return res.status(500).json({
      message: "Erreur serveur."
    });
  }
};


// =====================================================
// GET CONVERSATION MESSAGES
// =====================================================

export const getConversationMessages = async (req, res) => {
  try {

    const userId = req.user.id;
    const { conversationId } = req.params;

    // ==========================================
    // Vérifier que la conversation existe
    // ==========================================

    const conversationResult = await pool.query(
      `
      SELECT
        c.*,
        s.user_id AS supervisor_user_id,
        i.user_id AS intern_user_id
      FROM conversations c
      JOIN supervisor s
        ON s.id = c.supervisor_id
      JOIN intern i
        ON i.id = c.intern_id
      WHERE c.id = $1
      `,
      [conversationId]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        message: "Conversation introuvable."
      });
    }

    const conversation = conversationResult.rows[0];

    // ==========================================
    // Vérifier que l'utilisateur appartient
    // à cette conversation
    // ==========================================

    if (
      Number(conversation.supervisor_user_id) !== Number(userId) &&
      Number(conversation.intern_user_id) !== Number(userId)
    ) {
      return res.status(403).json({
        message: "Accès refusé à cette conversation."
      });
    }

    // ==========================================
    // Récupérer les messages
    // ==========================================

    const messages =
      await Message.findByConversation(conversationId);

    // ==========================================
    // Marquer les messages comme lus
    // ==========================================

    await Message.markAsRead(
      conversationId,
      userId
    );

    return res.status(200).json({
      conversation,
      messages
    });

  } catch (error) {

    console.error(
      "Erreur getConversationMessages:",
      error
    );

    return res.status(500).json({
      message: "Erreur serveur."
    });
  }
};


// =====================================================
// DELETE MESSAGE
// =====================================================

export const deleteMessage = async (req, res) => {
  try {

    const userId = req.user.id;
    const { messageId } = req.params;

    const deletedMessage =
      await Message.delete(
        messageId,
        userId
      );

    if (!deletedMessage) {
      return res.status(404).json({
        message: "Message introuvable ou vous n'êtes pas son auteur."
      });
    }

    return res.status(200).json({
      message: "Message supprimé avec succès.",
      deletedMessage
    });

  } catch (error) {

    console.error(
      "Erreur deleteMessage:",
      error
    );

    return res.status(500).json({
      message: "Erreur serveur."
    });
  }
};
// =====================================================
// UPDATE MESSAGE
// =====================================================

export const updateMessage = async (req, res) => {
  try {

    const userId = req.user.id;
    const { messageId } = req.params;
    const { content } = req.body;

    // Vérifier que le contenu existe
    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Le contenu du message est obligatoire."
      });
    }

    // Modifier uniquement son propre message
    const updatedMessage = await Message.update(
      messageId,
      userId,
      content.trim()
    );

    if (!updatedMessage) {
      return res.status(404).json({
        message: "Message introuvable ou vous n'êtes pas son auteur."
      });
    }

    return res.status(200).json({
      message: "Message modifié avec succès.",
      updatedMessage
    });

  } catch (error) {

    console.error(
      "Erreur updateMessage:",
      error
    );

    return res.status(500).json({
      message: "Erreur serveur."
    });
  }
};