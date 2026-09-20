import express from "express";
import upload from '../middlewares/uploadmiddleware.js';
import multer from "multer";
import {
  createDocument,
  getMyDocuments,
  getMyDocumentById,
  getDocumentVersions,
  addDocumentVersion,
  getPendingDocuments,
  reviewDocument,
  getDocumentReviews
} from "../controllers/document.controller.js";

import {
  protect,
  restrictTo
} from "../middlewares/auth.middleware.js";

import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("INTERN"),
  asyncHandler(createDocument)
);
router.get(
  "/pending",
  protect,
  restrictTo("SUPERVISOR"),
  asyncHandler(getPendingDocuments)
);

router.get(
  "/my",
  protect,
  restrictTo("INTERN"),
  asyncHandler(getMyDocuments)
);

router.get(
  "/:id",
  protect,
  restrictTo("INTERN"),
  asyncHandler(getMyDocumentById)
);

router.get(
  "/:id/versions",
  protect,
  restrictTo("INTERN"),
  asyncHandler(getDocumentVersions)
);
router.post(
  "/:id/versions",
  protect,
  restrictTo("INTERN"),
  upload.single("file"),
  asyncHandler(addDocumentVersion)
);
router.post(
  "/:id/review",
  protect,
  restrictTo("SUPERVISOR"),
  asyncHandler(reviewDocument)
);
router.get(
  "/:id/reviews",
  protect,
  restrictTo("INTERN"),
  asyncHandler(getDocumentReviews)
);

export default router;