import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const TransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [amount, setAmount] = useState(0);
  const options = { withCredentials: true };

  useEffect(() => {
    fetchTransactionsAndBalance();
  }, []);

  const fetchTransactionsAndBalance = async () => {
    try {
      const userTransactions = await axios.get('http://localhost:3000/api/transaction/transactions', options);
      const userBalance = await axios.get('http://localhost:3000/api/transaction/balance', options);

      setTransactions(userTransactions.data.data);
      setBalance(userBalance.data.balance);
    } catch (err) {
      console.error('Error fetching transactions or balance', err);
      toast.error("Error fetching data.");
    }
  };

  const handleTransaction = async () => {
    if (transactionType === 'Withdraw' && amount > balance) {
      toast.error("Insufficient Funds");
      return;
    }

    try {
      const newBalance = transactionType === 'Deposit' ? balance + amount : balance - amount;

      const response = await axios.post(`http://localhost:3000/api/transaction/${transactionType.toLowerCase()}`, { amount },options);

      if (response.status === 200) {
        setBalance(newBalance);
        toast.success(`${transactionType} successful!`);
        fetchTransactionsAndBalance();
        setIsModalOpen(false);
      } else {
        toast.error("Transaction failed!");
      }
    } catch (err) {
      console.error('Error during transaction', err);
      toast.error("Transaction failed!");
    }
  };

  return (
    <div>
      <h1>Your Transactions</h1>
      <h2>Balance: ${balance}</h2>
      <div>
        <button onClick={() => { setTransactionType("Deposit"); setIsModalOpen(true); }}>Deposit</button>
        <button onClick={() => { setTransactionType("Withdraw"); setIsModalOpen(true); }}>Withdraw</button>
      </div>
      <div>
        {transactions.length === 0 ? (
          <p>No transactions available</p>
        ) : (
          <ul>
            {transactions.map((transaction, index) => (
              <li key={index}>{transaction.type} - ${transaction.amount}</li>
            ))}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{transactionType} Funds</h3>
            <label>Amount: </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="1"
              step="any"
            />
            <div>
              <button onClick={handleTransaction}>Confirm</button>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;
