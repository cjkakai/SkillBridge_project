import React, { useState, useEffect } from 'react';
import FreelancerSidebar from './FreelancerSidebar';
import { useAuth } from '../../context/AuthContext';
import './Earnings.css';

const Earnings = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [totalPayments, setTotalPayments] = useState(0);
  const freelancerId = user?.freelancerId || 1001;

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    if (user?.id) {
      fetchEarningsData();
    }
  }, [user?.id]);

  const fetchEarningsData = async () => {
    try {
      const paymentsResponse = await fetch(`/api/freelancers/${freelancerId}/payments`);
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        const total = paymentsData
          .filter(payment => payment.status === 'completed')
          .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
        setTotalPayments(total);
      }
    } catch (error) {
      console.error('Error fetching earnings data:', error);
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
              <span>Total Earnings</span>
              <div className="stat-icon total">
                <span>💰</span>
              </div>
            </div>
            <div className="stat-value">${totalPayments.toLocaleString()}</div>
            <div className="stat-change">
              <span>📈 12% from last month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Available Balance</span>
              <div className="stat-icon available">
                <span>💳</span>
              </div>
            </div>
            <div className="stat-value">${Math.round(totalPayments * 0.7).toLocaleString()}</div>
            <div className="stat-subtitle">Ready to withdraw</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Pending</span>
              <div className="stat-icon pending">
                <span>⏰</span>
              </div>
            </div>
            <div className="stat-value">${Math.round(totalPayments * 0.2).toLocaleString()}</div>
            <div className="stat-subtitle">2 pending payments</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>This Month</span>
              <div className="stat-icon month">
                <span>📊</span>
              </div>
            </div>
            <div className="stat-value">${Math.round(totalPayments * 0.3).toLocaleString()}</div>
            <div className="stat-subtitle">From 5 projects</div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Earnings Trend</h3>
            <div className="chart-container">
              <div className="y-axis">
                <span>6000</span>
                <span>4500</span>
                <span>3000</span>
                <span>1500</span>
                <span>0</span>
              </div>
              <div className="x-axis">
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
              </div>
              <svg className="chart-svg" viewBox="0 0 400 220">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#dbeafe" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="44" x2="400" y2="44" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="0" y1="88" x2="400" y2="88" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="0" y1="132" x2="400" y2="132" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="0" y1="176" x2="400" y2="176" stroke="#f3f4f6" strokeWidth="1" />
                <path d="M 0 176 L 57 154 L 114 132 L 171 143 L 228 121 L 285 110 L 342 88 L 400 66 L 400 220 L 0 220 Z" fill="url(#areaGradient)" />
                <path d="M 0 176 Q 28 165 57 154 Q 85 143 114 132 Q 142 137 171 143 Q 199 132 228 121 Q 256 115 285 110 Q 313 99 342 88 Q 371 77 400 66" stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle cx="0" cy="176" r="4" fill="#3b82f6" />
                <circle cx="57" cy="154" r="4" fill="#3b82f6" />
                <circle cx="114" cy="132" r="4" fill="#3b82f6" />
                <circle cx="171" cy="143" r="4" fill="#3b82f6" />
                <circle cx="228" cy="121" r="4" fill="#3b82f6" />
                <circle cx="285" cy="110" r="4" fill="#3b82f6" />
                <circle cx="342" cy="88" r="4" fill="#3b82f6" />
                <circle cx="400" cy="66" r="4" fill="#3b82f6" />
              </svg>
            </div>
          </div>

          <div className="category-card">
            <h3>Earnings by Category</h3>
            <div className="category-list">
              <div className="category-item">
                <div className="category-info">
                  <div className="category-dot"></div>
                  <span>Web Development</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '85%'}}></div>
                </div>
              </div>
              <div className="category-item">
                <div className="category-info">
                  <div className="category-dot"></div>
                  <span>Design</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '45%'}}></div>
                </div>
              </div>
              <div className="category-item">
                <div className="category-info">
                  <div className="category-dot"></div>
                  <span>Consulting</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '15%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pending-payments">
          <h3>Pending Payments</h3>
          <div className="payment-list">
            <div className="payment-item">
              <div>
                <h4>E-commerce Website</h4>
                <p>TechCorp Inc. • Backend Development</p>
                <span className="status pending-approval">Pending Approval</span>
              </div>
              <div className="payment-amount">
                <div className="amount">$1,500</div>
                <div className="due-date">Due: Oct 25, 2025</div>
              </div>
            </div>
            <div className="payment-item">
              <div>
                <h4>Mobile App Design</h4>
                <p>StartupHub • Prototyping</p>
                <span className="status in-escrow">In Escrow</span>
              </div>
              <div className="payment-amount">
                <div className="amount">$960</div>
                <div className="due-date">Due: Oct 28, 2025</div>
              </div>
            </div>
          </div>
        </div>

        <div className="transaction-history">
          <div className="transaction-header">
            <h3>Transaction History</h3>
            <button className="export-btn">
              <span>⬇️</span> Export
            </button>
          </div>
          <div className="transaction-tabs">
            <button className="tab active">All Transactions</button>
            <button className="tab">Income</button>
            <button className="tab">Expenses</button>
          </div>
          <div className="transaction-table">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>TXN-2024-001</td>
                  <td className="income">↓ Payment Received</td>
                  <td>E-commerce Website</td>
                  <td>TechCorp Inc.</td>
                  <td className="amount-positive">+$1,250</td>
                  <td>Bank Transfer</td>
                  <td><span className="status completed">Completed</span></td>
                  <td>Oct 21, 2025</td>
                </tr>
                <tr>
                  <td>TXN-2024-002</td>
                  <td className="income">↓ Payment Received</td>
                  <td>Mobile App Design</td>
                  <td>StartupHub</td>
                  <td className="amount-positive">+$800</td>
                  <td>PayPal</td>
                  <td><span className="status completed">Completed</span></td>
                  <td>Oct 18, 2025</td>
                </tr>
                <tr>
                  <td>TXN-2024-003</td>
                  <td className="expense">↑ Withdrawal</td>
                  <td>-</td>
                  <td>-</td>
                  <td className="amount-negative">-$2,500</td>
                  <td>Bank Transfer</td>
                  <td><span className="status processing">Processing</span></td>
                  <td>Oct 15, 2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Earnings;