let io = null;

export const setSocketIO = (socketIO) => {
  io = socketIO;
};

export const emitNotification = (userId, notification) => {
  if (!io) {
    console.log("Socket.IO non initialisé.");
    return;
  }

  io.to(`user_${userId}`).emit(
    "new_notification",
    notification
  );
};