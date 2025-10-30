import React, { useState, useEffect } from 'react';
import FreelancerSidebar from './FreelancerSidebar';
import { AlertTriangle, Send, FileText, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './FreelancerReport.css';

const FreelancerReport = () => {
  const { user } = useAuth();
  const [freelancer, setFreelancer] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const freelancerId = user?.id

  useEffect(() => {
    fetchFreelancerData();
    fetchContracts();
    fetchAdmins();
    fetchComplaints();
  }, []);

  const fetchFreelancerData = async () => {
    try {
      const response = await fetch(`/api/freelancers/${freelancerId}`);
      if (response.ok) {
        const data = await response.json();
        setFreelancer(data);
      }
    } catch (error) {
      console.error('Error fetching freelancer data:', error);
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await fetch(`/api/freelancers/${freelancerId}/contracts`);
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setContracts(data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admins');
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`/api/freelancers/${freelancerId}/complaints`);
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="freelancer-report-container">
        <FreelancerSidebar />
        <div className="report-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="loading-spinner">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="freelancer-report-container">
      <FreelancerSidebar />
      <div className="report-content">
        <div style={{ backgroundColor: 'white', padding: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Report a Client</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>Report inappropriate behavior or violations of our terms</p>
          </div>
        </div>

        <div style={{ padding: '32px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                <AlertTriangle size={24} style={{ display: 'inline', marginRight: '8px', color: '#ef4444' }} />
                Report a Client
              </h2>
              <p style={{ color: '#6b7280', margin: 0 }}>
                If you've experienced inappropriate behavior or violations of our terms of service, please report it here.
              </p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();

              const formData = new FormData(e.target);
              const complaintData = {
                complainant_id: freelancerId,
                respondent_id: parseInt(formData.get('respondent_id')),
                contract_id: parseInt(formData.get('contract_id')),
                complainant_type: 'freelancer',
                description: formData.get('description'),
                admin_id: parseInt(formData.get('admin_id'))
              };

              try {
                const response = await fetch(`/api/freelancers/${freelancerId}/contracts/${complaintData.contract_id}/complaints`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(complaintData)
                });

                if (response.ok) {
                  alert('Complaint submitted successfully! Our team will review it within 24 hours.');
                  fetchComplaints();
                  e.target.reset();
                } else {
                  const errorData = await response.json();
                  alert(`Failed to submit complaint: ${errorData.error || 'Unknown error'}`);
                }
              } catch (error) {
                console.error('Error submitting complaint:', error);
                alert('Error submitting complaint. Please try again.');
              }
            }}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Select Client (Respondent)
                    </label>
                    <select
                      name="respondent_id"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="">Choose a client...</option>
                      {contracts.map((contract) => (
                        <option key={contract.id} value={contract.client?.id}>
                          {contract.client?.name || 'Unknown Client'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Select Contract
                    </label>
                    <select
                      name="contract_id"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="">Choose a contract...</option>
                      {contracts.map((contract) => (
                        <option key={contract.id} value={contract.id}>
                          {contract.task?.title || `Contract ${contract.contract_code}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Assign to Admin
                    </label>
                    <select
                      name="admin_id"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="">Choose an admin...</option>
                      {admins.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Complaint Description
                  </label>
                  <textarea
                    name="description"
                    rows="6"
                    placeholder="Please provide detailed information about the complaint, including what happened, when it occurred, and any relevant context..."
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical',
                      backgroundColor: '#ffffff',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                  >
                    <Send size={16} />
                    Submit Complaint
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* My Complaints Section */}
        <div style={{ padding: '0 32px 32px 32px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                <FileText size={24} style={{ display: 'inline', marginRight: '8px', color: '#6b7280' }} />
                My Complaints
              </h2>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Track the status of your submitted complaints
              </p>
            </div>

            {complaints.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: '#6b7280'
              }}>
                <AlertTriangle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p>You haven't submitted any complaints yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {complaints.map((complaint) => (
                  <div key={complaint.id} style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          padding: '4px 12px',
                          backgroundColor: complaint.status === 'open' ? '#fef3c7' : complaint.status === 'resolved' ? '#d1fae5' : '#f3f4f6',
                          color: complaint.status === 'open' ? '#92400e' : complaint.status === 'resolved' ? '#065f46' : '#374151',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {complaint.status === 'open' ? <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> :
                           complaint.status === 'resolved' ? <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> :
                           <XCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />}
                          {complaint.status || 'open'}
                        </div>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          Complaint #{complaint.id}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this complaint?')) {
                            try {
                              const response = await fetch(`/api/freelancers/${freelancerId}/contracts/${complaint.contract_id}/complaints/${complaint.id}`, {
                                method: 'DELETE'
                              });

                              if (response.ok) {
                                alert('Complaint deleted successfully.');
                                fetchComplaints();
                              } else {
                                const errorData = await response.json();
                                alert(`Failed to delete complaint: ${errorData.error || 'Unknown error'}`);
                              }
                            } catch (error) {
                              console.error('Error deleting complaint:', error);
                              alert('Error deleting complaint. Please try again.');
                            }
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>
                        {complaint.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                      <Clock size={12} />
                      Submitted {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerReport;