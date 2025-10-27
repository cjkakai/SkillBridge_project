import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, ArrowLeft, Trash2 } from 'lucide-react';
import './ClientDashboard.css';
import './ClientContracts.css';

const EditContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState("");
  const [formData, setFormData] = useState({
    agreed_amount: '',
    status: '',
  });
  const clientId = 5; // Should come from auth context

  useEffect(() => {
    fetchContract();
    fetchClientData();
  }, [id]);

  const fetchClientData = () => {
    fetch(`/api/clients/${clientId}`)
      .then((response) => response.json())
      .then((data) => {
        setClientName(data.name);
        setClientImage(data.image);
      });
  };

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/contracts/${id}`);
      if (response.ok) {
        const data = await response.json();
        setContract(data);
        setFormData({
          agreed_amount: data.agreed_amount || '',
          status: data.status || '',
          deadline: data.task?.deadline ? data.task.deadline.split('T')[0] : ''
        });
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Contract updated successfully!');
        navigate('/client-contracts');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to update contract: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Error updating contract: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>SkillBridge</h2>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div className="nav-item active">
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
              <h1>Edit Contract</h1>
              <p>Modify contract details</p>
            </div>
          </div>
          <button className="back-btn" onClick={() => navigate('/client-contracts')}>
            <ArrowLeft size={20} />
            Back to Contracts
          </button>
        </div>

        {contract && (
          <div className="edit-contract-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="agreed_amount">Agreed Amount ($)</label>
                <input
                  type="number"
                  id="agreed_amount"
                  name="agreed_amount"
                  value={formData.agreed_amount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="deadline">Task Deadline</label>
                <input
                  type="text"
                  placeholder='change task deadline in client dashboard'
                  id="deadline"
                  name="deadline"
                />
              </div>


              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditContract;