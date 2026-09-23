import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import Message from "../models/messagemodel.js";
import { createNotification } from "../utils/notification.js";
import { emitNotification } from "../utils/notificationSocket.js";
const onlineUsers = new Map();
export const initSocket = (httpServer) => {

  const io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  });

  io.use(async (socket, next) => {

    try {

      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Token manquant"));
      }

      const decoded = jwt.verify(
        token.replace("Bearer ", ""),
        process.env.JWT_SECRET
      );

      const result = await pool.query(
        `
        SELECT id, name, email, is_active
        FROM users
        WHERE id = $1
        `,
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return next(new Error("Utilisateur introuvable"));
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return next(new Error("Utilisateur désactivé"));
      }

      socket.user = user;

      next();

    } catch (error) {

      console.error(
        "Erreur authentification Socket.IO :",
        error.message
      );

      next(new Error("Token invalide"));

    }

  });

  io.on("connection", (socket) => {

    console.log(
      `Socket connecté : ${socket.user.name} (id: ${socket.user.id})`
    );
const userId = socket.user.id;

onlineUsers.set(userId, socket.id);
socket.join(`user_${userId}`);
console.log(
  `🟢 ${socket.user.name} est maintenant ONLINE`
);
socket.broadcast.emit("user_online", {
  user_id: userId
});
    // JOIN CONVERSATION
  socket.on("join_conversation", async ({ conversation_id }) => {

  try {

    if (!conversation_id) {
      return socket.emit("message_error", {
        message: "conversation_id est obligatoire"
      });
    }

    // Vérifier que l'utilisateur appartient à la conversation
    const result = await pool.query(
      `
      SELECT c.*
      FROM conversations c
      JOIN supervisor s
        ON s.id = c.supervisor_id
      JOIN intern i
        ON i.id = c.intern_id
      WHERE c.id = $1
      AND (s.user_id = $2 OR i.user_id = $2)
      `,
      [conversation_id, socket.user.id]
    );

    // Conversation inexistante ou utilisateur non autorisé
    if (result.rows.length === 0) {

      return socket.emit("message_error", {
        message: "Vous n'avez pas accès à cette conversation"
      });

    }

    // Rejoindre la room
    socket.join(`conversation_${conversation_id}`);

    console.log(
      `${socket.user.name} a rejoint conversation_${conversation_id}`
    );

    // Confirmer au client
    socket.emit("conversation_joined", {
      conversation_id
    });

  } catch (error) {

    console.error("Erreur join_conversation :", error);

    socket.emit("message_error", {
      message: "Impossible de rejoindre la conversation"
    });

  }

});

    // SEND MESSAGE
socket.on("send_message", async ({ conversation_id, content }) => {

  try {

    if (!conversation_id || !content || !content.trim()) {
      return socket.emit("message_error", {
        message: "conversation_id et content sont obligatoires"
      });
    }

    // Vérifier que l'utilisateur appartient à la conversation
    // et récupérer les user_id des deux participants
    const result = await pool.query(
      `
      SELECT
        c.*,
        s.user_id AS supervisor_user_id,
        i.user_id AS intern_user_id
      FROM conversations c
      JOIN supervisor s
        ON s.id = c.supervisor_id
      JOIN intern i
        ON i.id = c.intern_id
      WHERE c.id = $1
      AND (s.user_id = $2 OR i.user_id = $2)
      `,
      [conversation_id, socket.user.id]
    );

    if (result.rows.length === 0) {
      return socket.emit("message_error", {
        message: "Vous n'avez pas accès à cette conversation"
      });
    }

    const conversation = result.rows[0];

    // ==========================================
    // Déterminer le destinataire
    // ==========================================

    const recipientUserId =
      Number(conversation.supervisor_user_id) === Number(socket.user.id)
        ? conversation.intern_user_id
        : conversation.supervisor_user_id;

    // ==========================================
    // Créer le message
    // ==========================================

    const message = await Message.create(
      conversation_id,
      socket.user.id,
      content.trim()
    );

    // ==========================================
    // Créer la notification dans la DB
    // ==========================================

    const notification = await createNotification({
      user_id: recipientUserId,
      title: "Nouveau message",
      message: `${socket.user.name} vous a envoyé un nouveau message.`,
      type: "CHAT"
    });

    // ==========================================
    // Envoyer la notification en temps réel
    // ==========================================

    emitNotification(
      recipientUserId,
      notification
    );

    // ==========================================
    // Envoyer le message dans la conversation
    // ==========================================

    io.to(`conversation_${conversation_id}`).emit(
      "new_message",
      message
    );

  } catch (error) {

    console.error("Erreur send_message :", error);

    socket.emit("message_error", {
      message: "Impossible d'envoyer le message"
    });
  }

});
socket.on("typing", async ({ conversation_id }) => {

  try {

    const result = await pool.query(
      `
      SELECT c.*
      FROM conversations c
      JOIN supervisor s
        ON s.id = c.supervisor_id
      JOIN intern i
        ON i.id = c.intern_id
      WHERE c.id = $1
      AND (s.user_id = $2 OR i.user_id = $2)
      `,
      [conversation_id, socket.user.id]
    );

    if (result.rows.length === 0) {
      return;
    }

    // Prévenir les autres personnes de la conversation
    socket.to(`conversation_${conversation_id}`).emit(
      "user_typing",
      {
        user_id: socket.user.id
      }
    );

  } catch (error) {

    console.error("Erreur typing :", error);

  }

});
socket.on("stop_typing", async ({ conversation_id }) => {

  try {

    const result = await pool.query(
      `
      SELECT c.*
      FROM conversations c
      JOIN supervisor s
        ON s.id = c.supervisor_id
      JOIN intern i
        ON i.id = c.intern_id
      WHERE c.id = $1
      AND (s.user_id = $2 OR i.user_id = $2)
      `,
      [conversation_id, socket.user.id]
    );

    if (result.rows.length === 0) {
      return;
    }

    socket.to(`conversation_${conversation_id}`).emit(
      "user_stop_typing",
      {
        user_id: socket.user.id
      }
    );

  } catch (error) {

    console.error("Erreur stop_typing :", error);

  }

});
socket.on("mark_as_read", async ({ conversation_id }) => {

  try {

    if (!conversation_id) {
      return;
    }

    // Vérifier que l'utilisateur appartient à la conversation
    const result = await pool.query(
      `
      SELECT c.*
      FROM conversations c
      JOIN supervisor s
        ON s.id = c.supervisor_id
      JOIN intern i
        ON i.id = c.intern_id
      WHERE c.id = $1
      AND (s.user_id = $2 OR i.user_id = $2)
      `,
      [conversation_id, socket.user.id]
    );

    if (result.rows.length === 0) {
      return socket.emit("message_error", {
        message: "Vous n'avez pas accès à cette conversation"
      });
    }

    // Marquer les messages comme lus
    const count = await Message.markAsRead(
      conversation_id,
      socket.user.id
    );

    // Informer les autres utilisateurs
    socket.to(`conversation_${conversation_id}`).emit(
      "messages_read",
      {
        conversation_id,
        user_id: socket.user.id,
        count
      }
    );

  } catch (error) {

    console.error("Erreur mark_as_read :", error);

    socket.emit("message_error", {
      message: "Impossible de marquer les messages comme lus"
    });

  }

});
    socket.on("disconnect", () => {

  onlineUsers.delete(socket.user.id);

  console.log(
    `🔴 ${socket.user.name} est maintenant OFFLINE`
  );

  socket.broadcast.emit("user_offline", {
    user_id: socket.user.id
  });

});

  });

  return io;
};