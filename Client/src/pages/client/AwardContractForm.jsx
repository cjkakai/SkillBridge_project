import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, ArrowLeft, FileText } from 'lucide-react';
import './AwardContractForm.css';

const AwardContractForm = () => {
  const navigate = useNavigate();
  const { taskId, freelancerId } = useParams();
  const [task, setTask] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    contract_code: '',
    agreed_amount: '',
    started_at: new Date().toISOString().split('T')[0], // Today's date as default
    status: 'active'
  });

  useEffect(() => {
    if (taskId && freelancerId) {
      fetchTask();
      fetchFreelancer();
    }
  }, [taskId, freelancerId]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (response.ok) {
        const taskData = await response.json();
        setTask(taskData);
        // Auto-generate contract code
        const contractCode = `SK-${taskData.id}-${freelancerId}-${Date.now().toString().slice(-4)}`;
        setFormData(prev => ({
          ...prev,
          contract_code: contractCode,
          agreed_amount: taskData.budget_min || '' // Default to min budget
        }));
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    }
  };

  const fetchFreelancer = async () => {
    try {
      const response = await fetch(`/api/freelancers/${freelancerId}`);
      if (response.ok) {
        const freelancerData = await response.json();
        setFreelancer(freelancerData);
      }
    } catch (error) {
      console.error('Error fetching freelancer:', error);
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
      const response = await fetch(`/api/clients/5/create-contract`, { // Hardcoded client ID for now
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: parseInt(taskId),
          freelancer_id: parseInt(freelancerId),
          agreed_amount: parseFloat(formData.agreed_amount),
          contract_code: formData.contract_code,
          started_at: formData.started_at,
          status: formData.status
        })
      });

      if (response.ok) {
        alert('Contract awarded successfully!');
        navigate('/client-dashboard');
      } else {
        const errorData = await response.json();
        alert(`Failed to award contract: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Error creating contract. Please try again.');
    } finally {
      setSaving(false);
    }
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
          <p>Loading contract details...</p>
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
          <div className="nav-item">
            <CreditCard size={20} />
            <span>Payments</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="contract-form-header">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="contract-info">
            <FileText size={24} className="contract-icon" />
            <div>
              <h1>Award Contract</h1>
              <p>Create a contract for {freelancer?.name} on "{task?.title}"</p>
            </div>
          </div>
        </div>

        <div className="contract-form-container">
          <form onSubmit={handleSubmit} className="contract-form">
            <div className="form-group">
              <label htmlFor="contract_code">Contract Code</label>
              <input
                type="text"
                id="contract_code"
                name="contract_code"
                value={formData.contract_code}
                onChange={handleInputChange}
                required
                placeholder="Auto-generated contract code"
              />
            </div>

            <div className="form-group">
              <label htmlFor="agreed_amount">Agreed Amount (KSH)</label>
              <input
                type="number"
                id="agreed_amount"
                name="agreed_amount"
                value={formData.agreed_amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                placeholder="Enter agreed amount"
              />
            </div>

            <div className="form-group">
              <label htmlFor="started_at">Contract Start Date</label>
              <input
                type="date"
                id="started_at"
                name="started_at"
                value={formData.started_at}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <input
                type="text"
                value="Active"
                disabled
                className="status-input"
              />
              <small className="status-note">Status will be set to Active upon creation</small>
            </div>

            <div className="contract-summary">
              <h3>Contract Summary</h3>
              <div className="summary-item">
                <span className="summary-label">Task:</span>
                <span className="summary-value">{task?.title}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Freelancer:</span>
                <span className="summary-value">{freelancer?.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Budget Range:</span>
                <span className="summary-value">KSH {task?.budget_min} - KSH {task?.budget_max}</span>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="award-btn"
                disabled={saving}
              >
                {saving ? 'Creating Contract...' : 'Award Contract'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AwardContractForm;