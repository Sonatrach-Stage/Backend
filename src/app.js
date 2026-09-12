import express from "express";
import cors from "cors";
import {notfound,errorHandler} from "./middlewares/error.middleware.js";
import passport from './config/passport.js';
import authRoutes from './routes/auth.routes.js';
import adminsec from './routes/adminsec.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/adminsec",adminsec);

app.get("/",(req,res)=>{
  res.json("the server of our project is running")
});

app.use(notfound);
app.use(errorHandler);
export default app;