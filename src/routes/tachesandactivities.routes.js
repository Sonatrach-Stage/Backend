import express from "express";

import {
getSupervisorsTaches,getSupervisorsActivities,getInternsTaches,getInternsActivities,createTachebysup,updateTachebysup,deleteTachebysup,createTachebyIntern,updateTachebyIntern,
deleteTachebyIntern,createActivity,updateActivity,deleteActivity
} from "../controllers/activitiesandtachescontroller.js";

import { protect, restrictTo } from "../middlewares/auth.middleware.js";

import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.use(protect);
router.get(
  "/sup/taches",
  asyncHandler(getSupervisorsTaches)
);

router.get(
  "/sup/activities",
  asyncHandler(getSupervisorsActivities)
);

router.get(
  "/int/taches",
  asyncHandler(getInternsTaches)
);

router.get(
  "/int/activities",
  asyncHandler(getInternsActivities)
);

router.post(
  "/sup/new_tache",
  asyncHandler(createTachebysup)
);

router.patch(
  "/sup/modify_tache/:tacheId",
  asyncHandler(updateTachebysup)
);

router.delete(
  "/sup/delete_tache/:tacheId",
  asyncHandler(deleteTachebysup)
);

router.post(
  "/interns/new_tache",
  asyncHandler(createTachebyIntern)
);

router.patch(
  "/interns/modify_tache/:tacheId",
  asyncHandler(updateTachebyIntern)
);

router.delete(
  "/interns/delete_tache/:tacheId",
  asyncHandler(deleteTachebyIntern)
);

router.post(
  "/sup/new_activity",
  asyncHandler(createActivity)
);

router.patch(
  "/sup/modify_activity/:activityId",
  asyncHandler(updateActivity)
);

router.delete(
  "/sup/delete_activity/:activityId",
  asyncHandler(deleteActivity)
);


export default router;