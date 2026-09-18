import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getMyProfile,getUserProfile,updateMyProfile
} from "../controllers/profile.controller.js";
import upload from '../middlewares/uploadmiddleware.js';
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/",protect, asyncHandler(getMyProfile));
router.patch(
  "/me",
  protect,
  upload.single("profil_image"),
  asyncHandler(updateMyProfile)
);
router.get("/:userId", protect, asyncHandler(getUserProfile));
export default router;