import express from "express";
import cors from "cors";
import {notfound,errorHandler} from "./middlewares/error.middleware.js";
import passport from './config/passport.js';
import authRoutes from './routes/auth.routes.js';
import adminsec from './routes/adminsec.routes.js';
import chatRoutes from './routes/chat.routes.js';
import actandtach from './routes/tachesandactivities.routes.js';
import adminsupRoutes from'./routes/adminsup.routes.js';
import { swaggerSetup } from './config/swagger.js';
import companyRoutes from "./routes/company.routes.js";
import profileRoutes from "./routes/profile.routes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/adminsec",adminsec);
app.use("/actandtach",actandtach);
app.use("/chat",chatRoutes);
app.use("/adminsup",adminsupRoutes);
app.use("/companies", companyRoutes);
app.use("/profile", profileRoutes);
swaggerSetup(app);
app.get("/",(req,res)=>{
  res.json("the server of our project is running")
});

app.use(notfound);
app.use(errorHandler);
export default app;