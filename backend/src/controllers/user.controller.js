import db from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
};

const generateVerificationCode = () => {
    return Math.floor(1000 + Math.random() * 9000);
  };

  const generateToken = (user) => {
    const payload = {
        id: user.user_id,
        role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
    });
    return token;
};

const dbQuery = async (query, params) => {
    try {
        const [results] = await db.promise().query(query, params);
        return results;
    } catch (error) {
        throw new ApiError(500, "Database Error");
    }
};

const register = asyncHandler(async (req, res, next) => {
    const { full_name, password, email, role } = req.body;

    if (!full_name || !password || !email || !role) {
        return next(new ApiError(400, "All fields are required"));
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return next(new ApiError(400, "Invalid email format"));
    }

    try {
        const hashPassword = await bcrypt.hash(password, 10);
        const insertUserResult = await dbQuery(
            "INSERT INTO Users (full_name, password, email, role) VALUES (?, ?, ?, ?)",
            [full_name, hashPassword, email, role]
        );

        if (!insertUserResult.affectedRows) {
            throw new ApiError(500, "Failed to insert user");
        }

        return res.status(200).json(new ApiResponse(200, { email, full_name }, "User Registered Successfully"));
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return next(new ApiError(400, "Email is already in use"));
        }
        return next(new ApiError(500, "An unexpected error occurred"));
    }
});

const login = asyncHandler(async (req, res, next) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        console.log("Error: Missing required fields");
        return next(new ApiError(400, "All fields are required"));
    }

    try {
        console.log(`Attempting login for email: ${email} and role: ${role}`);
        const user = await dbQuery("SELECT * FROM Users WHERE email = ? AND role = ?", [email, role]);
        
        if (user.length === 0) {
            console.log(`Error: No user found with email: ${email} and role: ${role}`);
            return next(new ApiError(401, "Invalid credentials"));
        }

        const isMatch = await bcrypt.compare(password, user[0].password);
        
        if (!isMatch) {
            console.log(`Error: Incorrect password for user: ${email}`);
            return next(new ApiError(401, "Invalid credentials"));
        }

        const token = await generateToken(user[0]);
        console.log(`Login successful for user: ${email}`);
        res.cookie("authToken", token, options);
        return res.status(200).json(new ApiResponse(200, { ...user[0], token }, "Successfully logged in"));
    } catch (err) {
        console.log("Error: An unexpected error occurred during login");
        return next(new ApiError(500, "An unexpected error occurred"));
    }
});

const getUserData = asyncHandler(async (req, res, next) => {
    try {
        const [result] = await db.promise().query(
            "SELECT user_id, full_name, email, role FROM Users WHERE user_id = ?", 
            [req.user.id]
        );

        if (result.length === 0) {
            return next(new ApiError(404, "User not found"));
        }

        return res.status(200).json(new ApiResponse(200, result[0], "Data retrieved successfully"));
    } catch (err) {
        return next(new ApiError(500, "Database error"));
    }
});

const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return next(new ApiError(400, "Email and password are required"));
    }
  
    try {
      const [rows] = await db.promise().query("SELECT password FROM Users WHERE email = ?", [email]);
      
      if (rows.length === 0) {
        return next(new ApiError(404, "User not found"));
      }
  
      const storedPassword = rows[0].password;
  
      const isMatch = await bcrypt.compare(password, storedPassword);
      if (isMatch) {
        return next(new ApiError(400, "New password cannot be the same as the old password"));
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      await db.promise().query("UPDATE Users SET password = ? WHERE email = ?", [hashedPassword, email]);
  
      return res.status(200).json(new ApiResponse(200, "Password reset successfully"));
    } catch (err) {
      return next(new ApiError(500, "An error occurred while resetting the password"));
    }
  });
  
  const sendMail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
  
    if (!email) {
      return next(new ApiError(400, "Email is required"));
    }
  
    const verificationCode = generateVerificationCode();
  
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  
    try {
      await transporter.sendMail({
        from: 'TechAsia <no-reply@techasia.com>',
        to: email,
        subject: "Password Verification Code",
        text: `Hello,
  
  We received a request to reset your password. Please use the following code to verify your identity:
  
  Verification Code: ${verificationCode}
  
  If you did not request this, please ignore this email.
  
  Best regards,
  Your Team`,
      });
  
      return res.status(200).json(new ApiResponse(200, { verificationCode, email }, "Email Sent Successfully"));
    } catch (error) {
      return next(new ApiError(500, "Something went wrong while sending mail, please try again"));
    }
  });

const getAllCustomers = asyncHandler(async (req, res, next) => {
    const customers = await db.query("SELECT user_id, full_name, email FROM Users WHERE role = 'customer'");
    
    return res.status(200).json(new ApiResponse(200, customers, "Customer accounts retrieved successfully"));
});

const getCustomerTransactions = asyncHandler(async (req, res, next) => {
    const { customer_id } = req.params;

    const transactions = await db.query("SELECT * FROM Transactions WHERE user_id = ? ORDER BY created_at DESC", [customer_id]);
    
    return res.status(200).json(new ApiResponse(200, transactions, "Transaction history retrieved successfully"));
});

export { register, login, getUserData, resetPassword, sendMail , getAllCustomers, getCustomerTransactions };   
