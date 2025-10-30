import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Briefcase, AlertTriangle, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminData, setAdminData] = useState({});
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalClients: 0,
    totalFreelancers: 0,
    totalContracts: 0,
    unresolvedComplaints: 0
  });
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [latestPayments, setLatestPayments] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchAdminData();
      fetchStats();
    }
  }, [user?.id]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch(`/api/admins/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAdminData(data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [paymentsRes, clientsRes, freelancersRes, contractsRes, complaintsRes, topClientsRes, latestPaymentsRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/clients'),
        fetch('/api/freelancers'),
        fetch('/api/contracts'),
        fetch(`/api/admins/${user.id}/complaints`),
        fetch('/api/top-clients'),
        fetch('/api/latest-payments')
      ]);

      const payments = paymentsRes.ok ? await paymentsRes.json() : [];
      const clients = clientsRes.ok ? await clientsRes.json() : [];
      const freelancers = freelancersRes.ok ? await freelancersRes.json() : [];
      const contracts = contractsRes.ok ? await contractsRes.json() : [];
      const complaints = complaintsRes.ok ? await complaintsRes.json() : [];
      const topClientsData = topClientsRes.ok ? await topClientsRes.json() : [];

      const totalPayments = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

      // Filter top 5 freelancers by ratings (highest first)
      const sortedFreelancers = freelancers
        .filter(f => f.ratings !== null && f.ratings !== undefined)
        .sort((a, b) => (b.ratings || 0) - (a.ratings || 0))
        .slice(0, 5);

      setStats({
        totalPayments,
        totalClients: clients.length,
        totalFreelancers: freelancers.length,
        totalContracts: contracts.length,
        unresolvedComplaints: complaints.length
      });

      setTopFreelancers(sortedFreelancers);
      setTopClients(topClientsData);
      setLatestPayments(latestPaymentsRes.ok ? await latestPaymentsRes.json() : []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}>
        <div className="admin-dashboard-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-content">
              <h1>Welcome back, {adminData.name}</h1>
              <p className="admin-email">{adminData.email}</p>
              <p>This is how SkillBridge platform is doing</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <DollarSign size={24} className="stat-icon green" />
                <h3>Total Payments</h3>
              </div>
              <div className="stat-number">ksh {stats.totalPayments.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <Users size={24} className="stat-icon blue" />
                <h3>Clients on SkillBridge</h3>
              </div>
              <div className="stat-number">{stats.totalClients}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <Users size={24} className="stat-icon orange" />
                <h3>Freelancers on SkillBridge</h3>
              </div>
              <div className="stat-number">{stats.totalFreelancers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <Briefcase size={24} className="stat-icon purple" />
                <h3>All Contracts</h3>
              </div>
              <div className="stat-number">{stats.totalContracts}</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <AlertTriangle size={24} className="stat-icon red" />
                <h3>Unresolved Complaints</h3>
              </div>
              <div className="stat-number">{stats.unresolvedComplaints}</div>
            </div>
          </div>

          {/* Top Performers Section */}
          <div className="top-performers-section">
            <div className="performers-row">
              {/* Top Freelancers */}
              <div className="performers-column">
                <h2>Top 5 Freelancers</h2>
                <div className="performer-cards">
                  {topFreelancers.map((freelancer, index) => (
                    <div key={freelancer.id} className="performer-card">
                      <div className="performer-rank">#{index + 1}</div>
                      <img
                        src={freelancer.image ? `${freelancer.image}` : 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg'}
                        alt={freelancer.name}
                        className="performer-image"
                      />
                      <div className="performer-info">
                        <h4>{freelancer.name}</h4>
                        <p>{freelancer.email}</p>
                        <p>{freelancer.contact}</p>
                        <div className="rating-display">
                          <div className="stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={`star ${star <= Math.round(freelancer.ratings || 0) ? 'filled' : ''}`}
                                fill={star <= Math.round(freelancer.ratings || 0) ? '#ffc107' : 'none'}
                                color={star <= Math.round(freelancer.ratings || 0) ? '#ffc107' : '#ddd'}
                              />
                            ))}
                          </div>
                          <span className="rating-number">{(freelancer.ratings || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Clients */}
              <div className="performers-column">
                <h2>Top 5 Clients</h2>
                <div className="performer-cards">
                  {topClients.map((client, index) => (
                    <div key={client.id} className="performer-card">
                      <div className="performer-rank">#{index + 1}</div>
                      <img
                        src={client.image ? `${client.image}` : 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg'}
                        alt={client.name}
                        className="performer-image"
                      />
                      <div className="performer-info">
                        <h4>{client.name}</h4>
                        <p>{client.email}</p>
                        <p>{client.contact}</p>
                        <p className="contract-count">{client.contract_count} contracts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Latest Payments Section */}
          <div className="latest-payments-section">
            <h2>Latest Payments</h2>
            <div className="payments-container">
              {latestPayments.map((payment, index) => (
                <div key={payment.id} className="payment-card">
                  <div className="payment-header">
                    <div className="payment-amount">ksh {parseFloat(payment.amount).toFixed(2)}</div>
                    <div className={`payment-status ${payment.status}`}>
                      {payment.status}
                    </div>
                  </div>
                  <div className="payment-details">
                    <p><strong>Client:</strong> {payment.client_name}</p>
                    <p><strong>Freelancer:</strong> {payment.freelancer_name}</p>
                    <p><strong>Method:</strong> {payment.method}</p>
                    <p><strong>Date:</strong> {new Date(payment.created_at).toLocaleDateString()}</p>
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

export default AdminDashboard;