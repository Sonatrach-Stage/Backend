import express from "express";

import {
  getMyNotifications,
  getMyUnreadNotifications,
  countUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();


// ======================================================
// GET NOTIFICATIONS
// ======================================================

router.get(
  "/",
  protect,
  asyncHandler(getMyNotifications)
);


// ======================================================
// GET UNREAD NOTIFICATIONS
// ======================================================

router.get(
  "/unread",
  protect,
  asyncHandler(getMyUnreadNotifications)
);


// ======================================================
// COUNT UNREAD
// ======================================================

router.get(
  "/unread/count",
  protect,
  asyncHandler(countUnreadNotifications)
);


// ======================================================
// MARK ALL AS READ
// ======================================================

router.patch(
  "/read-all",
  protect,
  asyncHandler(markAllNotificationsAsRead)
);


// ======================================================
// MARK ONE AS READ
// ======================================================

router.patch(
  "/:notificationId/read",
  protect,
  asyncHandler(markNotificationAsRead)
);


// ======================================================
// DELETE
// ======================================================

router.delete(
  "/:notificationId",
  protect,
  asyncHandler(deleteNotification)
);


export default router;