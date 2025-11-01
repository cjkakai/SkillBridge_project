import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, CheckCircle, DollarSign, Mail, Users, FileText, User, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ClientSidebar from './ClientSidebar';
import { BASE_URL } from '../../config';
import './ClientPayment.css';

const ClientPayment = () => {
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [freelancers, setFreelancers] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaForm, setMpesaForm] = useState({
    phone: '',
    amount: ''
  });
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const clientId = user?.id;

  useEffect(() => {
    if (clientId) {
      fetchContracts();
      fetchPayments();
    } else {
      navigate('/client/dashboard');
    }
  }, [clientId, navigate]);

  const fetchContracts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/clients/${clientId}/contracts`);
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/clients/${clientId}/payments`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);

        // Extract unique payee_ids and fetch freelancer data
        const payeeIds = [...new Set(data.map(payment => payment.payee_id))];
        if (payeeIds.length > 0) {
          await fetchFreelancers(payeeIds);
        }
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFreelancers = async (freelancerIds) => {
    try {
      const freelancerPromises = freelancerIds.map(id =>
        fetch(`${BASE_URL}/api/freelancers/${id}`)
      );

      const responses = await Promise.all(freelancerPromises);
      const freelancersData = {};

      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        const freelancerId = freelancerIds[i];

        if (response.ok) {
          const data = await response.json();
          freelancersData[freelancerId] = data;
        }
      }

      setFreelancers(freelancersData);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
    }
  };

  const handleMpesaPayment = (contract) => {
    setSelectedContract(contract);
    setMpesaForm({
      phone: '',
      amount: contract.agreed_amount || ''
    });
    setShowMpesaModal(true);
  };

  const handleMpesaSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    console.log(selectedContract)

    try {
      const response = await fetch(`${BASE_URL}/api/payments/mpesa/stkpush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contract_id: selectedContract.id,
          payer_id: clientId,
          payee_id: selectedContract.freelancer.id,
          phone: mpesaForm.phone,
          amount: parseInt(mpesaForm.amount)
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`M-Pesa payment initiated successfully! Checkout ID: ${data.mpesa_checkout_id}`);
        setShowMpesaModal(false);
        setMpesaForm({ phone: '', amount: '' });
      } else {
        alert('Failed to initiate M-Pesa payment. Please try again.');
      }
    } catch (error) {
      console.error('Error initiating M-Pesa payment:', error);
      alert('Failed to initiate M-Pesa payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayPalPayment = (contract) => {
    // Placeholder for PayPal integration
    alert('PayPal payment integration coming soon!');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <ClientSidebar />

        {/* Main Content */}
        <div className="main-content">
          <div className="loading">Loading contracts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <ClientSidebar />

      <div className="main-content">
        <div className="payment-header">
          <h1>Contract Payments</h1>
          <p>Manage payments for your active contracts</p>
        </div>

        <div className="contracts-grid">
          {contracts.length === 0 ? (
            <div className="no-contracts">
              <p>No contracts found. Create contracts to make payments.</p>
            </div>
          ) : (
            contracts.map((contract) => (
              <div key={contract.id} className="contract-card">
                <div className="contract-header">
                  <h3>{contract.task?.title || 'Unknown Task'}</h3>
                  <span className={`status ${contract.status}`}>
                    {contract.status}
                  </span>
                </div>

                <div className="contract-details">
                  <div className="detail-item">
                    <span className="label">Freelancer:</span>
                    <span className="value">{contract.freelancer?.name || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Agreed Amount:</span>
                    <span className="value">${contract.agreed_amount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Started:</span>
                    <span className="value">
                      {contract.started_at ? new Date(contract.started_at).toLocaleDateString() : 'Not started'}
                    </span>
                  </div>
                </div>

                <div className="payment-buttons">
                  <button
                    className="mpesa-btn"
                    onClick={() => handleMpesaPayment(contract)}
                    disabled={contract.status !== 'active'}
                  >
                    M-Pesa
                  </button>
                  <button
                    className="paypal-btn"
                    onClick={() => handlePayPalPayment(contract)}
                    disabled={contract.status !== 'active'}
                  >
                    PayPal
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="payment-history">
          <h2>Payment History</h2>
          {payments.length === 0 ? (
            <div className="no-payments">
              <p>No payment history found.</p>
            </div>
          ) : (
            <div className="payments-list">
              {payments.map((payment) => {
                const freelancer = freelancers[payment.payee_id];
                return (
                  <div key={payment.id} className="payment-item">
                    <div className="payment-info">
                      <img
                        src={freelancer?.image || '/default-avatar.png'}
                        alt={freelancer?.name || 'Payee'}
                        className="payee-image"
                      />
                      <div className="payment-details">
                        <div className="payee-name">{freelancer?.name || 'Unknown Payee'}</div>
                        <div className="payment-amount">${payment.amount}</div>
                        <div className="payment-date">
                          {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'Unknown Date'}
                        </div>
                      </div>
                    </div>
                    <div className="payment-status">
                      <span className={`status ${payment.status}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* M-Pesa Payment Modal */}
        {showMpesaModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>M-Pesa Payment</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowMpesaModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="contract-info">
                  <h3>Contract: {selectedContract?.task?.title}</h3>
                  <p>Freelancer: {selectedContract?.freelancer?.name}</p>
                  <p>Amount: ${selectedContract?.agreed_amount}</p>
                </div>

                <form onSubmit={handleMpesaSubmit} className="mpesa-form">
                  <div className="form-group">
                    <label htmlFor="phone">M-Pesa Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      value={mpesaForm.phone}
                      onChange={(e) => setMpesaForm({...mpesaForm, phone: e.target.value})}
                      placeholder="254XXXXXXXXX"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="amount">Amount (KES)</label>
                    <input
                      type="number"
                      id="amount"
                      value={mpesaForm.amount}
                      onChange={(e) => setMpesaForm({...mpesaForm, amount: e.target.value})}
                      placeholder="Enter amount"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowMpesaModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={processing}
                    >
                      {processing ? 'Processing...' : 'Initiate Payment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPayment;