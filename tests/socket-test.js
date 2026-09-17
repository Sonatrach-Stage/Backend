import io from "socket.io-client";

const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzIsImlhdCI6MTc4OTY0NTMzNywiZXhwIjoxNzg5NjQ2MjM3fQ.HSgjNskghQK3tufZ_GKnOokxg9AyXg_GFGW4GRbo4oQ";

const socket = io("http://localhost:3000", {
  auth: {
    token: accessToken
  }
});

socket.on("connect", () => {

  console.log("✅ Socket.IO connecté !");
  console.log("Socket ID :", socket.id);

  // Rejoindre la conversation
  socket.emit("join_conversation", {
    conversation_id: 4
  });

});

socket.on("conversation_joined", (data) => {

  console.log("✅ Conversation rejointe :", data);

  // Tester typing
  socket.emit("typing", {
    conversation_id: data.conversation_id
  });

  // Après 3 secondes : arrêter typing
  setTimeout(() => {

    socket.emit("stop_typing", {
      conversation_id: data.conversation_id
    });

  }, 3000);

});

socket.on("user_typing", (data) => {

  console.log(
    "✍️ Utilisateur en train d'écrire :",
    data.user_id
  );

});

socket.on("user_stop_typing", (data) => {

  console.log(
    "🛑 Utilisateur a arrêté d'écrire :",
    data.user_id
  );

});

socket.on("message_error", (error) => {

  console.log("❌ Erreur :", error.message);

});

socket.on("connect_error", (error) => {

  console.log("❌ Erreur connexion :", error.message);

});

socket.on("disconnect", () => {

  console.log("🔴 Socket.IO déconnecté");

});
socket.on("user_online", (data) => {

  console.log(
    "🟢 Utilisateur ONLINE :",
    data.user_id
  );

});

socket.on("user_offline", (data) => {

  console.log(
    "🔴 Utilisateur OFFLINE :",
    data.user_id
  );

});