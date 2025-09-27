import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./Route/auth.routes.js";
import foodroutes from "./Route/food.route.js"
import dotenv from "dotenv";
import cors from "cors"
import foodpapartner from './Route/food-partner.routes.js'

const app = express();

dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "https://snackshot-2-dqh3.onrender.com",
    credentials: true, // allow cookies to be sent
  }));

app.use("/api/auth", authRoutes);
app.use("/api/food" , foodroutes)
app.use('/api/food-partner' , foodpapartner)




export default app;