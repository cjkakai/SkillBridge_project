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
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState("");
  const [formData, setFormData] = useState({
    agreed_amount: '',
    status: '',
    deadline: '',
    notes: ''
  });
  const clientId = 2; // Should come from auth context

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
          deadline: data.task?.deadline ? data.task.deadline.split('T')[0] : '',
          notes: data.notes || ''
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
    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        navigate('/client-contracts');
      } else {
        console.error('Failed to update contract');
      }
    } catch (error) {
      console.error('Error updating contract:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/clients/${clientId}/contracts/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          navigate('/client-contracts');
        } else {
          console.error('Failed to delete contract');
        }
      } catch (error) {
        console.error('Error deleting contract:', error);
      }
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
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" className="delete-btn" onClick={handleDelete}>
                  <Trash2 size={16} />
                  Delete Contract
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