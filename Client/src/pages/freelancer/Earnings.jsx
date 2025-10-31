import React, { useState, useEffect } from 'react';
import FreelancerSidebar from './FreelancerSidebar';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import './Earnings.css';

const Earnings = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [earningsStats, setEarningsStats] = useState({
    total_completed: 0,
    total_pending: 0,
    total_payments_count: 0
  });
  const [payments, setPayments] = useState([]);
  const freelancerId = user?.id;

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    if (user?.id) {
      fetchEarningsStats();
      fetchPayments();
    }
  }, [user?.id]);

  const fetchEarningsStats = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/freelancers/${freelancerId}/earnings-stats`);
      if (response.ok) {
        const stats = await response.json();
        setEarningsStats(stats);
      }
    } catch (error) {
      console.error('Error fetching earnings stats:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/freelancers/${freelancerId}/payments`);
      if (response.ok) {
        const paymentsData = await response.json();
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  return (
    <div className="freelancer-dashboard">
      <FreelancerSidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <div className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}>
      <div className="earnings-header">
        <div className="header-content">
          <div>
            <h1>Earnings</h1>
            <p>Track your income, transactions, and withdraw funds</p>
          </div>
          <button className="withdraw-btn">
            <span>⬇️</span> Withdraw Funds
          </button>
        </div>
      </div>

      <div className="earnings-container">
        <div className="stats-grid">
           <div className="stat-card">
             <div className="stat-header">
               <span>Total Completed Payments</span>
               <div className="stat-icon total">
                 <span>💰</span>
               </div>
             </div>
             <div className="stat-value">${earningsStats.total_completed.toLocaleString()}</div>
             <div className="stat-change">
               <span>📈 12% from last month</span>
             </div>
           </div>

           <div className="stat-card">
             <div className="stat-header">
               <span>Pending Payments</span>
               <div className="stat-icon pending">
                 <span>⏰</span>
               </div>
             </div>
             <div className="stat-value">${earningsStats.total_pending.toLocaleString()}</div>
             <div className="stat-subtitle">Awaiting completion</div>
           </div>

           <div className="stat-card">
             <div className="stat-header">
               <span>Total Payments Count</span>
               <div className="stat-icon count">
                 <span>📊</span>
               </div>
             </div>
             <div className="stat-value">{earningsStats.total_payments_count}</div>
             <div className="stat-subtitle">All payments received</div>
           </div>
         </div>


        <div className="pending-payments">
          <h3>Pending Payments</h3>
          <div className="pending-payment-cards">
            {payments.filter(payment => payment.status === 'pending').map((payment) => (
              <div key={payment.id} className="pending-payment-card">
                <div className="card-content">
                  <div className="client-info">
                    <img src={payment.client_image} alt={payment.client_name} className="client-avatar-small" />
                    <div>
                      <h4>{payment.task}</h4>
                      <p>{payment.client_name}</p>
                    </div>
                  </div>
                  <div className="payment-details">
                    <div className="amount">${parseFloat(payment.amount).toFixed(2)}</div>
                    <div className="method">{payment.method}</div>
                  </div>
                </div>
                <button className="withdraw-btn-mpesa">Withdraw from Mpesa</button>
              </div>
            ))}
          </div>
        </div>

        <div className="transaction-history">
          <div className="transaction-header">
            <h3>Transaction History</h3>
          </div>
          <div className="transaction-cards">
            {payments.map((payment) => (
              <div key={payment.id} className="payment-card">
                <div className="card-header">
                  <div className="client-info">
                    <img src={payment.client_image} alt={payment.client_name} className="client-avatar" />
                    <div>
                      <h4>{payment.client_name}</h4>
                      <p>{payment.task}</p>
                    </div>
                  </div>
                  <div className="payment-amount">
                    <span className="amount">${payment.amount}</span>
                  </div>
                </div>
                <div className="card-details">
                  <div className="detail-item">
                    <span className="label">Method:</span>
                    <span className="value">{payment.method}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`status ${payment.status.toLowerCase().replace(' ', '-')}`}>{payment.status}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">{new Date(payment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Earnings;