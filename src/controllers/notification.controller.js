import Notification from "../models/notificationmodel.js";

// ======================================================
// GET MY NOTIFICATIONS
// ======================================================

export const getMyNotifications = async (req, res) => {

  const notifications = await Notification.findByUser(
    req.user.id
  );

  return res.status(200).json({
    success: true,
    notifications,
  });
};


// ======================================================
// GET MY UNREAD NOTIFICATIONS
// ======================================================

export const getMyUnreadNotifications = async (req, res) => {

  const notifications = await Notification.findUnreadByUser(
    req.user.id
  );

  return res.status(200).json({
    success: true,
    notifications,
  });
};


// ======================================================
// COUNT UNREAD NOTIFICATIONS
// ======================================================

export const countUnreadNotifications = async (req, res) => {

  const count = await Notification.countUnread(
    req.user.id
  );

  return res.status(200).json({
    success: true,
    count,
  });
};


// ======================================================
// MARK ONE NOTIFICATION AS READ
// ======================================================

export const markNotificationAsRead = async (req, res) => {

  const { notificationId } = req.params;

  const notification = await Notification.markAsRead(
    notificationId,
    req.user.id
  );

  if (!notification) {
    const error = new Error(
      "Notification introuvable."
    );

    error.statusCode = 404;

    throw error;
  }

  return res.status(200).json({
    success: true,
    message: "Notification marquée comme lue.",
    notification,
  });
};


// ======================================================
// MARK ALL NOTIFICATIONS AS READ
// ======================================================

export const markAllNotificationsAsRead = async (req, res) => {

  const notifications =
    await Notification.markAllAsRead(
      req.user.id
    );

  return res.status(200).json({
    success: true,
    message: "Toutes les notifications ont été marquées comme lues.",
    notifications,
  });
};


// ======================================================
// DELETE NOTIFICATION
// ======================================================

export const deleteNotification = async (req, res) => {

  const { notificationId } = req.params;

  const notification = await Notification.delete(
    notificationId,
    req.user.id
  );

  if (!notification) {
    const error = new Error(
      "Notification introuvable."
    );

    error.statusCode = 404;

    throw error;
  }

  return res.status(200).json({
    success: true,
    message: "Notification supprimée.",
    notification,
  });
};