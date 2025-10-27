import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, ArrowLeft, User, AlertTriangle, Send } from 'lucide-react';
import './ClientDashboard.css';

const ClientReport = () => {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState("");
  const [freelancers, setFreelancers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const clientId = 5; // Should come from auth context

  useEffect(() => {
    fetchClientData();
    fetchFreelancers();
    fetchContracts();
    fetchAdmins();
    fetchComplaints();
  }, []);

  const fetchClientData = () => {
    fetch(`/api/clients/${clientId}`)
      .then((response) => response.json())
      .then((data) => {
        setClientName(data.name);
        setClientImage(data.image);
      });
  };

  const fetchFreelancers = () => {
    fetch(`/api/clients/${clientId}/freelancers`)
      .then((response) => response.json())
      .then((data) => {
        setFreelancers(data);
      })
      .catch((error) => {
        console.error('Error fetching freelancers:', error);
      });
  };

  const fetchContracts = () => {
    fetch(`/api/clients/${clientId}/contracts`)
      .then((response) => response.json())
      .then((data) => {
        setContracts(data);
      })
      .catch((error) => {
        console.error('Error fetching contracts:', error);
      });
  };

  const fetchAdmins = () => {
    fetch('/api/admins')
      .then((response) => response.json())
      .then((data) => {
        setAdmins(data);
        console.log(data)
      })
      .catch((error) => {
        console.error('Error fetching admins:', error);
      });
  };

  const fetchComplaints = () => {
    fetch(`/api/clients/${clientId}/complaints`)
      .then((response) => response.json())
      .then((data) => {
        setComplaints(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching complaints:', error);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>SkillBridge</h2>
          </div>
        </div>
        <div className="main-content">
          <div className="dashboard-header">
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>SkillBridge</h2>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/client-dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-contracts')}>
            <Briefcase size={20} />
            <span>My Contracts</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-messages')}>
            <MessageSquare size={20} />
            <span>Messages</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/post-task')}>
            <Plus size={20} />
            <span>Post a Job</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-profile')}>
            <User size={20} />
            <span>Your Profile</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-report')}>
            <AlertTriangle size={20} />
            <span>Report a Freelancer</span>
          </div>
          <div className="nav-item">
            <CreditCard size={20} />
            <span>Payments</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <div className="welcome-section">
            <img
              src={clientImage || 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg'}
              alt="Client profile"
              className="welcome-profile-image"
            />
            <div className="welcome-content">
              <h1>Report a Freelancer</h1>
              <p>Report inappropriate behavior or violations</p>
            </div>
          </div>
        </div>

        <div className="report-form-container">
          <div className="contract-card">
            <h3>Report a Freelancer</h3>
            <p>If you've experienced inappropriate behavior or violations of our terms of service, please report it here.</p>

            <form className="report-form" onSubmit={async (e) => {
              e.preventDefault();

              const formData = new FormData(e.target);
              const complaintData = {
                complainant_id: clientId,
                respondent_id: parseInt(formData.get('respondent_id')),
                contract_id: parseInt(formData.get('contract_id')),
                complainant_type: formData.get('complainant_type'),
                description: formData.get('description'),
                admin_id: parseInt(formData.get('admin_id'))
              };

              try {
                const response = await fetch(`/api/clients/${clientId}/contracts/${complaintData.contract_id}/complaints`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(complaintData)
                });

                if (response.ok) {
                  alert('Complaint submitted successfully! Our team will review it within 24 hours.');
                  fetchComplaints(); // Refresh complaints list
                  e.target.reset(); // Clear form
                } else {
                  const errorData = await response.json();
                  alert(`Failed to submit complaint: ${errorData.error || 'Unknown error'}`);
                }
              } catch (error) {
                console.error('Error submitting complaint:', error);
                alert('Error submitting complaint. Please try again.');
              }
            }}>
              <div className="form-group">
                <label htmlFor="respondent_id">Select Freelancer (Respondent)</label>
                <select name="respondent_id" id="respondent_id" required>
                  <option value="">Choose a freelancer...</option>
                  {freelancers.map((freelancer) => (
                    <option key={freelancer.id} value={freelancer.id}>
                      {freelancer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contract_id">Select Contract</label>
                <select name="contract_id" id="contract_id" required>
                  <option value="">Choose a contract...</option>
                  {contracts.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.task?.title || `Contract ${contract.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="complainant_type">Complainant Type</label>
                <select name="complainant_type" id="complainant_type" required>
                  <option value="">Select type...</option>
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="admin_id">Select Admin to Handle Complaint</label>
                <select name="admin_id" id="admin_id" required>
                  <option value="">Choose an admin...</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Complaint Description</label>
                <textarea
                  name="description"
                  id="description"
                  rows="5"
                  placeholder="Please provide detailed information about the complaint..."
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => navigate('/client-dashboard')}>Cancel</button>
                <button type="submit" className="submit-report-btn">
                  <Send size={16} />
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* My Complaints Section */}
        <div className="complaints-section">
          <div className="contract-card">
            <h3>My Complaints</h3>
            {complaints.length === 0 ? (
              <p>You haven't submitted any complaints yet.</p>
            ) : (
              <div className="complaints-list">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="complaint-item">
                    <div className="complaint-header">
                      <div className="complaint-info">
                        <h4>Complaint #{complaint.id}</h4>
                        <span className={`complaint-status ${complaint.status?.toLowerCase()}`}>
                          {complaint.status || 'open'}
                        </span>
                      </div>
                      <button
                        className="delete-complaint-btn"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this complaint?')) {
                            try {
                              const response = await fetch(`/api/clients/${clientId}/contracts/${complaint.contract_id}/complaints/${complaint.id}`, {
                                method: 'DELETE'
                              });

                              if (response.ok) {
                                alert('Complaint deleted successfully.');
                                fetchComplaints(); // Refresh the list
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
                      >
                        Delete
                      </button>
                    </div>
                    <div className="complaint-details">
                      <p><strong>Description:</strong> {complaint.description}</p>
                      <p><strong>Submitted:</strong> {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'Unknown'}</p>
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

export default ClientReport;