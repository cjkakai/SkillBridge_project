import React from "react";

const RecentTransactions = ({ data }) => {
  console.log("Recent transactions data received:", data);

  // Ensure we always have an array
  const transactions = Array.isArray(data) ? data : [];

  return (
    <div className="recent-transactions">
      <h3>Recent Transactions</h3>
      <div className="transactions-list">
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <div key={index} className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-id">#{transaction.transactionId || transaction.id}</div>
                <div className="transaction-details">
                  {transaction.clientName || transaction.user} → {transaction.freelancerName || transaction.freelancer}
                </div>
                <div className="transaction-project">{transaction.projectTitle || transaction.project}</div>
              </div>
              <div className="transaction-amount">${transaction.amount}</div>
            </div>
          ))
        ) : (
          <div className="no-data">No recent transactions</div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
