import express from "express";
import { register, login, getUserData, resetPassword, sendMail, getAllCustomers, getCustomerTransactions } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/authLogin.middleware.js";
import { verifyCode } from "../middlewares/authCode.middleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", verifyJWT, getUserData);

router.post("/reset-password",verifyCode, resetPassword);

router.post("/send-verification-mail", sendMail);

router.get("/customers", verifyJWT, getAllCustomers);

router.get("/customers/:customer_id/transactions", verifyJWT, getCustomerTransactions);

export default router;
