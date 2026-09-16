import express from "express";

import {
  getOrCreateConversation,
  getMyConversations,
  getConversationMessages,
  deleteMessage,
    updateMessage
} from "../controllers/message.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();


// Toutes les routes du chat nécessitent un JWT
router.use(protect);


// ==========================================
// CONVERSATIONS
// ==========================================

// Obtenir ou créer une conversation
router.post(
  "/conversations",
  asyncHandler(getOrCreateConversation)
);


// Mes conversations
router.get(
  "/conversations",
  asyncHandler(getMyConversations)
);


// Messages d'une conversation
router.get(
  "/conversations/:conversationId/messages",
  asyncHandler(getConversationMessages)
);


// Supprimer mon message
router.delete(
  "/messages/:messageId",
  asyncHandler(deleteMessage)
);
router.patch(
  "/messages/:messageId",
  updateMessage
);

export default router;