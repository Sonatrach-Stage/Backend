import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { askAI, summarizeAI, getSimilarProjects, compareAIProjects, getConversations, getConversation, deleteConversation } from "../controllers/aiController.js";

const router = express.Router();

router.post(
  "/ask",
  protect,
  asyncHandler(askAI)
);
router.post( "/documents/:id/summary", protect, asyncHandler(summarizeAI) );
router.get( "/documents/:id/similar", protect, asyncHandler(getSimilarProjects) );
router.post("/documents/compare",protect,asyncHandler(compareAIProjects));

// ==========================================
// CONVERSATIONS AI
// ==========================================

// Toutes les conversations de l'utilisateur
router.get(
  "/conversations",
  protect,
  asyncHandler(getConversations)
);

// Une conversation + tous ses messages
router.get(
  "/conversations/:id",
  protect,
  asyncHandler(getConversation)
);

// Supprimer une conversation
router.delete(
  "/conversations/:id",
  protect,
  asyncHandler(deleteConversation)
);
export default router;

