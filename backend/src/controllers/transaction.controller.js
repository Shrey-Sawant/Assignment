import db from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const dbQuery = async (query, params) => {
    try {
        const [results] = await db.promise().query(query, params);
        return results;
    } catch (error) {
        throw new ApiError(500, "Database Error");
    }
};

const getTransactions = asyncHandler(async (req, res, next) => {
    const  user_id  = req.user.id;

    console.log(`Fetching transactions for user ID: ${user_id}`);

    try {
        const transactions = await dbQuery("SELECT * FROM Transactions WHERE user_id = ? ORDER BY created_at DESC", [user_id]);
        
        if (transactions.length === 0) {
            console.log(`No transactions found for user ID: ${user_id}`);
            return next(new ApiError(404, "No transactions found"));
        }

        console.log(`Transactions retrieved successfully for user ID: ${user_id}`);
        return res.status(200).json(new ApiResponse(200, transactions, "Transactions retrieved successfully"));
    } catch (err) {
        console.error(`Error fetching transactions for user ID: ${user_id}`, err);
        return next(new ApiError(500, "Error fetching transactions"));
    }
});

const depositFunds = asyncHandler(async (req, res, next) => {
    const  user_id = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return next(new ApiError(400, "Invalid deposit amount"));
    }
    console.log(`Initiating deposit of ${amount} for user ID: ${user_id}`);
    try {
        await dbQuery("UPDATE Accounts SET balance = balance + ? WHERE user_id = ?", [amount, user_id]);
      
        await dbQuery("INSERT INTO Transactions (user_id, type, amount) VALUES (?, 'deposit', ?)", [user_id, amount]);
        console.log(`Transaction record created for user ID: ${user_id}, deposit amount: ${amount}`);
        return res.status(200).json(new ApiResponse(200, { amount }, "Deposit successful"));
    } catch (err) {
        return next(new ApiError(500, "Error during deposit"));
    }
});

const withdrawFunds = asyncHandler(async (req, res, next) => {
    const user_id = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        console.log(`Invalid withdrawal amount received: ${amount}`);
        return next(new ApiError(400, "Invalid withdrawal amount"));
    }

    try {
        console.log(`Initiating withdrawal of ${amount} for user ID: ${user_id}`);

        // Fetch account balance
        const [account] = await dbQuery("SELECT balance FROM Accounts WHERE user_id = ?", [user_id]);
        console.log(`Fetched balance for user ID: ${user_id}, current balance: ${account.balance}`);

        if (account.balance < amount) {
            console.log(`Insufficient funds for withdrawal. User ID: ${user_id}, balance: ${account.balance}, requested amount: ${amount}`);
            return next(new ApiError(400, "Insufficient funds"));
        }

        // Update account balance
        await dbQuery("UPDATE Accounts SET balance = balance - ? WHERE user_id = ?", [amount, user_id]);
        console.log(`Balance updated successfully for user ID: ${user_id}, new balance: ${account.balance - amount}`);

        // Insert transaction record
        await dbQuery("INSERT INTO Transactions (user_id, type, amount) VALUES (?, 'withdraw', ?)", [user_id, amount]);
        console.log(`Transaction record created for user ID: ${user_id}, withdrawal amount: ${amount}`);

        return res.status(200).json(new ApiResponse(200, { amount }, "Withdrawal successful"));
    } catch (err) {
        console.error('Error during withdrawal:', err.message || err);
        return next(new ApiError(500, "Error during withdrawal"));
    }
});

const balance = asyncHandler(async (req, res, next) => {
    const  user_id  = req.user.id;

    try {
        const [account] = await dbQuery("SELECT balance FROM Accounts WHERE user_id = ?", [user_id]);

        return res.status(200).json(new ApiResponse(200, account.balance, "Balance retrieved successfully"));
    } catch (err) {
        return next(new ApiError(500, "Error fetching balance"));
    }
});

export { getTransactions, depositFunds, withdrawFunds,balance };
