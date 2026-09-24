import express from "express";

import {
getAdminStatistics,getSecondaryAdminStatistics,getSupervisorStatistics,getInternStatistics
} from "../controllers/statisticscontroller.js";

import { protect } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
"/adminsup",
protect,
asyncHandler(getAdminStatistics)
);
router.get(
"/admin-secondary",
protect,
asyncHandler(getSecondaryAdminStatistics)
);
router.get( "/supervisor", 
  protect, 
  asyncHandler(getSupervisorStatistics) );
  router.get( "/intern", protect, asyncHandler(getInternStatistics) );
export default router