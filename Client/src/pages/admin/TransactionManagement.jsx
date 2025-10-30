import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { fetchPayments, fetchTasks, fetchClients, fetchFreelancers } from "../../services/api";
import "./UserManagement.css"; // Reuse same CSS

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        const [payments, tasks, clients, freelancers] = await Promise.all([
          fetchPayments(),
          fetchTasks(),
          fetchClients(),
          fetchFreelancers(),
        ]);

        const taskMap = Object.fromEntries(tasks.map(t => [t.id, t]));
        const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));
        const freelancerMap = Object.fromEntries(freelancers.map(f => [f.id, f]));

        const enriched = payments.map(payment => {
          const task = taskMap[payment.task_id];
          const client = task ? clientMap[task.client_id] : null;
          const freelancer = task ? freelancerMap[task.freelancer_id] : null;

          return {
            id: payment.id,
            transactionId: `TXN-${payment.id.toString().padStart(3, "0")}`,
            clientName: client ? client.name : "Unknown Client",
            freelancerName: freelancer ? freelancer.name : "Unknown Freelancer",
            projectTitle: task ? task.title : "Unknown Project",
            amount: payment.amount,
            status: payment.status || "Completed",
            paymentDate: payment.created_at
              ? new Date(payment.created_at).toLocaleDateString()
              : "N/A",
          };
        });

        setTransactions(enriched);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, []);

  // --------------------------
  // 🔍 Filtering and Sorting
  // --------------------------
  const filteredTransactions = transactions
    .filter((t) => {
      const matchesSearch =
        t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.freelancerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "All" || t.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortField === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      } else if (sortField === "date") {
        return sortOrder === "asc"
          ? new Date(a.paymentDate) - new Date(b.paymentDate)
          : new Date(b.paymentDate) - new Date(a.paymentDate);
      } else if (sortField === "status") {
        return sortOrder === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      return 0;
    });

  // --------------------------
  // 🖨️ Export & Print Feature
  // --------------------------
  const handleExport = () => {
    const printable = filteredTransactions
      .map(
        (t) =>
          `${t.transactionId}\t${t.clientName}\t${t.freelancerName}\t${t.projectTitle}\t$${t.amount}\t${t.status}\t${t.paymentDate}`
      )
      .join("\n");

    const header =
      "Transaction ID\tClient\tFreelancer\tProject\tAmount\tStatus\tDate\n";
    const blob = new Blob([header + printable], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_report_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // --------------------------
  // UI Actions
  // --------------------------
  const handleViewDetails = (id) => {
    const t = transactions.find((x) => x.id === id);
    if (!t) return;
    alert(
      `Transaction Details:\n\nID: ${t.transactionId}\nClient: ${t.clientName}\nFreelancer: ${t.freelancerName}\nProject: ${t.projectTitle}\nAmount: $${t.amount}\nStatus: ${t.status}\nDate: ${t.paymentDate}`
    );
  };

  const handleRefund = async (id) => {
    if (!window.confirm("Are you sure you want to process a refund?")) return;
    try {
      const res = await fetch(`http://localhost:5555/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Refunded" }),
      });
      if (res.ok) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: "Refunded" } : t))
        );
        alert("Refund processed successfully!");
      } else alert("Failed to process refund.");
    } catch (err) {
      console.error("Refund error:", err);
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Sidebar />
        <div className="admin-main">
          <Header />
          <div className="admin-content" style={{ textAlign: "center", padding: "50px" }}>
            Loading transactions...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Header />

        <div className="admin-content">
          <div className="user-management-header">
            <h2>Transaction Management</h2>
            <div className="actions">
              <button className="btn-export" onClick={handleExport}>
                Export Report
              </button>
              <button className="btn-print" onClick={handlePrint}>
                Print
              </button>
            </div>
          </div>

          <div className="user-filters">
            <input
              type="text"
              placeholder="Search transactions..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>

            <select
              className="filter-select"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="status">Sort by Status</option>
            </select>

            <select
              className="filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Client</th>
                  <th>Freelancer</th>
                  <th>Project</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.transactionId}</td>
                    <td>{t.clientName}</td>
                    <td>{t.freelancerName}</td>
                    <td>{t.projectTitle}</td>
                    <td>${t.amount}</td>
                    <td>
                      <span className={`status-badge status-${t.status.toLowerCase()}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>{t.paymentDate}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => handleViewDetails(t.id)}>
                          View
                        </button>
                        <button className="btn-delete" onClick={() => handleRefund(t.id)}>
                          Refund
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <p style={{ textAlign: "center", marginTop: "20px" }}>
                No transactions found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionManagement;
