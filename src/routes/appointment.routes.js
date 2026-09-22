import express from "express";

import {
  createAppointment,
  getInternAppointments,
  getSupervisorAppointments,
  getAppointmentById,
  respondToAppointment,
  cancelAppointment,
  completeAppointment,
} from "../controllers/appointment.controller.js";

import {
  protect,
} from "../middlewares/auth.middleware.js";

import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();


// ======================================================
// CREATE
// INTERN + SUPERVISOR
// ======================================================

router.post(
  "/",
  protect,
  asyncHandler(createAppointment)
);
router.get(
  "/intern",
  protect,
  asyncHandler(getInternAppointments)
);


// ======================================================
// GET SUPERVISOR APPOINTMENTS
// ======================================================

router.get(
  "/supervisor",
  protect,
  asyncHandler(getSupervisorAppointments)
);


// ===========
// ===========================================
// GET ONE APPOINTMENT
// INTERN + SUPERVISOR
// ======================================================

router.get(
  "/:appointmentId",
  protect,
  asyncHandler(getAppointmentById)
);


// ======================================================
// ACCEPT / REJECT
// INTERN + SUPERVISOR
// ======================================================

router.patch(
  "/:appointmentId/respond",
  protect,
  asyncHandler(respondToAppointment)
);


// ======================================================
// CANCEL
// INTERN + SUPERVISOR
// ======================================================

router.patch(
  "/:appointmentId/cancel",
  protect,
  asyncHandler(cancelAppointment)
);


// ======================================================
// COMPLETE
// INTERN + SUPERVISOR
// ======================================================

router.patch(
  "/:appointmentId/complete",
  protect,
  asyncHandler(completeAppointment)
);
// ======================================================
// GET INTERN APPOINTMENTS
// ======================================================

router.get(
  "/intern",
  protect,
  asyncHandler(getInternAppointments)
);


// ======================================================
// GET SUPERVISOR APPOINTMENTS
// ======================================================

router.get(
  "/supervisor",
  protect,
  asyncHandler(getSupervisorAppointments)
);



export default router;