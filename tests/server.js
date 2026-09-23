import { initSocket } from "../src/sockets/socket.js";
import "../env.js";
import http from "http";
import { swaggerSetup } from '../src/config/swagger.js';
import { setSocketIO } from "../src/utils/notificationSocket.js";
import app from "../src/app.js";

const PORT = process.env.PORT||3000;

const httpServer = http.createServer(app);

swaggerSetup(app);
const io = initSocket(httpServer);
setSocketIO(io);
httpServer.listen(PORT,"0.0.0.0",()=>{
  console.log("the server is running on ",PORT);
});
console.log("APRÈS LISTEN");
export { io };