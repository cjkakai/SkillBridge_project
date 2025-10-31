import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { BASE_URL } from '../../config';
import './TransactionManagement.css';

const TransactionManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPayment, setExpandedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/payments`);
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const paymentsData = await response.json();
      setPayments(paymentsData);
      setError(null);
    } catch (err) {
      setError('Error fetching payments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      completed: { bg: '#d1fae5', text: '#065f46', label: 'Completed' },
      pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
      failed: { bg: '#fee2e2', text: '#991b1b', label: 'Failed' },
      cancelled: { bg: '#f3f4f6', text: '#374151', label: 'Cancelled' }
    };

    const style = statusStyles[status] || statusStyles.pending;

    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.text,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {style.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'mpesa':
        return '📱';
      case 'card':
        return '💳';
      case 'bank':
        return '🏦';
      default:
        return '💰';
    }
  };

  if (loading) {
    return (
      <div className="transaction-management">
        <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="loading-spinner">Loading payments...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-management">
        <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={fetchPayments}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-management">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}>
        <div className="transaction-content">
          <div className="transaction-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#d1fae5' }}>
                <span style={{ fontSize: '20px' }}>✅</span>
              </div>
              <div className="stat-content">
                <h3>Completed</h3>
                <div className="stat-value">{payments.filter(p => p.status === 'completed').length}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
                <span style={{ fontSize: '20px' }}>⏳</span>
              </div>
              <div className="stat-content">
                <h3>Pending</h3>
                <div className="stat-value">{payments.filter(p => p.status === 'pending').length}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fee2e2' }}>
                <span style={{ fontSize: '20px' }}>❌</span>
              </div>
              <div className="stat-content">
                <h3>Failed</h3>
                <div className="stat-value">{payments.filter(p => p.status === 'failed').length}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e0f2fe' }}>
                <span style={{ fontSize: '20px' }}>💰</span>
              </div>
              <div className="stat-content">
                <h3>Total Volume</h3>
                <div className="stat-value">
                  {formatCurrency(payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0))}
                </div>
              </div>
            </div>
          </div>

          <div className="payments-table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client (Payer)</th>
                  <th>Freelancer (Payee)</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="payment-id">#{payment.id}</td>
                      <td>
                        <div className="user-info-cell">
                          <strong>{payment.client_name || 'Unknown Client'}</strong>
                          <br />
                          <span className="user-id">ID: {payment.payer_id}</span>
                        </div>
                      </td>
                      <td>
                        <div className="user-info-cell">
                          <strong>{payment.freelancer_name || 'Unknown Freelancer'}</strong>
                          <br />
                          <span className="user-id">ID: {payment.payee_id}</span>
                        </div>
                      </td>
                      <td className="amount-cell">{formatCurrency(payment.amount)}</td>
                      <td>
                        <div className="method-cell">
                          <span className="method-icon">{getPaymentMethodIcon(payment.method)}</span>
                          <span className="method-text">{payment.method || 'N/A'}</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(payment.status)}</td>
                      <td className="date-cell">{formatDate(payment.created_at)}</td>
                      <td>
                        <button
                          className="view-details-btn"
                          onClick={() => setExpandedPayment(expandedPayment === payment.id ? null : payment.id)}
                        >
                          {expandedPayment === payment.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-payments">No payments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {expandedPayment && (
            <div className="payment-details-modal">
              <div className="payment-details-content">
                <div className="payment-details-header">
                  <h3>Payment Details #{expandedPayment}</h3>
                  <button
                    className="close-details-btn"
                    onClick={() => setExpandedPayment(null)}
                  >
                    ×
                  </button>
                </div>

                {(() => {
                  const payment = payments.find(p => p.id === expandedPayment);
                  if (!payment) return null;

                  return (
                    <div className="payment-details-grid">
                      <div className="detail-item">
                        <label>Payment ID</label>
                        <span>#{payment.id}</span>
                      </div>

                      <div className="detail-item">
                        <label>Contract ID</label>
                        <span>#{payment.contract_id}</span>
                      </div>

                      <div className="detail-item">
                        <label>Client (Payer)</label>
                        <span>{payment.client_name || 'Unknown Client'} (ID: {payment.payer_id})</span>
                      </div>

                      <div className="detail-item">
                        <label>Freelancer (Payee)</label>
                        <span>{payment.freelancer_name || 'Unknown Freelancer'} (ID: {payment.payee_id})</span>
                      </div>

                      <div className="detail-item">
                        <label>Amount</label>
                        <span className="amount-highlight">{formatCurrency(payment.amount)}</span>
                      </div>

                      <div className="detail-item">
                        <label>Payment Method</label>
                        <span>{payment.method || 'N/A'}</span>
                      </div>

                      <div className="detail-item">
                        <label>Status</label>
                        {getStatusBadge(payment.status)}
                      </div>

                      <div className="detail-item">
                        <label>Created At</label>
                        <span>{formatDate(payment.created_at)}</span>
                      </div>

                      {payment.provider_ref && (
                        <div className="detail-item">
                          <label>Provider Reference</label>
                          <span>{payment.provider_ref}</span>
                        </div>
                      )}

                      {payment.provider_receipt && (
                        <div className="detail-item">
                          <label>Provider Receipt</label>
                          <span>{payment.provider_receipt}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionManagement;