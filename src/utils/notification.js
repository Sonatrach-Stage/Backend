import Notification from "../models/notificationmodel.js";

export const createNotification = async ({
  user_id,
  title,
  message,
  type,
}) => {
  const notification = await Notification.create({
    user_id,
    title,
    message,
    type,
  });

  return notification;
};