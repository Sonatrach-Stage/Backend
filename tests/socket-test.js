import io from "socket.io-client";

// ===============================
// TOKENS
// ===============================

const supervisorToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsImlhdCI6MTc4OTY4NDI3MywiZXhwIjoxNzg5Njg1MTczfQ.gTFsgbfh7rOBVMiYdEgofivfU_Juv-ujAYnDBebSy5w";
const internToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzIsImlhdCI6MTc4OTY4NDIyNSwiZXhwIjoxNzg5Njg1MTI1fQ.BVJJbPab6PxFV4SWKnCs5yU5A-5Xzw_ntX5mwZBbSXM";

// ===============================
// SUPERVISOR
// ===============================

const supervisorSocket = io("http://localhost:3000", {
  auth: {
    token: supervisorToken
  }
});

supervisorSocket.on("connect", () => {

  console.log("🟢 SUPERVISOR connecté");
  console.log("Socket ID :", supervisorSocket.id);

  supervisorSocket.emit("join_conversation", {
    conversation_id: 4
  });

});

supervisorSocket.on("conversation_joined", (data) => {

  console.log(
    "✅ SUPERVISOR a rejoint la conversation",
    data
  );
setTimeout(() => {
  console.log("💬 SUPERVISOR envoie un message");

  supervisorSocket.emit("send_message", {
    conversation_id: data.conversation_id,
    content: "Bonjour, je suis votre superviseur."
  });
}, 7000);
});

supervisorSocket.on("new_message", (message) => {

  console.log(
    "📩 SUPERVISOR reçoit :",
    message
  );

});

supervisorSocket.on("user_typing", (data) => {

  console.log(
    "✍️ SUPERVISOR voit que l'utilisateur écrit :",
    data
  );

});

supervisorSocket.on("user_stop_typing", (data) => {

  console.log(
    "🛑 SUPERVISOR voit que l'utilisateur a arrêté d'écrire :",
    data
  );

});

supervisorSocket.on("messages_read", (data) => {

  console.log(
    "👀 SUPERVISOR : messages lus",
    data
  );

});

supervisorSocket.on("user_online", (data) => {

  console.log(
    "🟢 SUPERVISOR voit ONLINE :",
    data.user_id
  );

});

supervisorSocket.on("user_offline", (data) => {

  console.log(
    "🔴 SUPERVISOR voit OFFLINE :",
    data.user_id
  );

});

supervisorSocket.on("message_error", (error) => {

  console.log(
    "❌ SUPERVISOR erreur :",
    error.message
  );

});


// ===============================
// INTERN
// ===============================


// ===============================
// INTERN
// ===============================

const internSocket = io("http://localhost:3000", {
  auth: {
    token: internToken
  }
});

internSocket.on("connect", () => {

  console.log("🟢 INTERN connecté");
  console.log("Socket ID :", internSocket.id);

  internSocket.emit("join_conversation", {
    conversation_id: 4
  });

});

internSocket.on("conversation_joined", (data) => {

  console.log(
    "✅ INTERN a rejoint la conversation",
    data
  );
internSocket.on("new_message", (message) => {
  console.log("🔥🔥🔥 INTERN A REÇU LE MESSAGE !!!");
setTimeout(() => {
  console.log("👀 INTERN marque les messages comme lus");

  internSocket.emit("mark_as_read", {
    conversation_id: message.conversation_id
  });
}, 2000);
  console.log("📩 INTERN reçoit :", message);
});
  setTimeout(() => {

    console.log("✍️ INTERN commence à écrire");

    internSocket.emit("typing", {
      conversation_id: data.conversation_id
    });

  }, 2000);

  setTimeout(() => {

    console.log("🛑 INTERN arrête d'écrire");

    internSocket.emit("stop_typing", {
      conversation_id: data.conversation_id
    });

  }, 5000);

});