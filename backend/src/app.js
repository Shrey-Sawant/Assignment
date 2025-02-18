import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express()

app.use(cors({
    origin: ['http://localhost:5173','*','https://smartenergymeter.techasiamechatronics.com'], 
    credentials: true,  
  }))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());
app.set("trust proxy",1);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

import  userRoute from "./routes/userRouter.routes.js";
import transactionRoute from "./routes/transactionRouter.routes.js";
import {errorHandler} from "./middlewares/errorhandling.middleware.js";

app.use('/api/user',userRoute);
app.use('/api/transaction',transactionRoute);
app.use(errorHandler);

export default app;