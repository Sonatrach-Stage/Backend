import express from "express";

import {
  getAllCompanies,
  getPendingCompanies,
  getApprovedCompanies,
  approveCompany,
  rejectCompany,
  deleteCompany,
} from "../controllers/adminsup.controller.js";

import {
  protect,
  restrictTo,
} from "../middlewares/auth.middleware.js";

import asyncHandler from "../utils/asyncHandler.js";
const router = express.Router();

router.use(protect);
router.use(restrictTo("SUPER_ADMIN"));

router.get("/companies", asyncHandler(getAllCompanies));

router.get("/companies/pending",asyncHandler(getPendingCompanies));

router.get("/companies/approved", asyncHandler(getApprovedCompanies));

router.patch("/companies/:id/approve", asyncHandler(approveCompany));

router.patch("/companies/:id/reject", asyncHandler(rejectCompany));

router.delete("/companies/:id", asyncHandler(deleteCompany));

export default router;