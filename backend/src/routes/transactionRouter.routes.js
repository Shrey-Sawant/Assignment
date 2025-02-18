import express from "express";
import { getTransactions, depositFunds, withdrawFunds, balance } from "../controllers/transaction.controller.js";
import { verifyJWT } from "../middlewares/authLogin.middleware.js";

const router = express.Router();

router.get("/transactions", verifyJWT, getTransactions);

router.post("/deposit", verifyJWT, depositFunds);

router.post("/withdraw", verifyJWT, withdrawFunds);

router.get("/balance", verifyJWT, balance);

export default router;
