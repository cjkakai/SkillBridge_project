import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ClientSidebar from './ClientSidebar';
import { BASE_URL } from '../../config';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, ArrowLeft, FileText, User, Trash2, AlertTriangle } from 'lucide-react';
import './AwardContractForm.css';

const AwardContractForm = () => {
  const navigate = useNavigate();
  const { taskId, freelancerId } = useParams();
  const { user } = useAuth();
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
  const [milestones, setMilestones] = useState([]);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    due_date: '',
    weight: ''
  });
  const [contractId, setContractId] = useState(null);

  const clientId = user?.id;

  useEffect(() => {
    if (taskId && freelancerId) {
      fetchTask();
      fetchFreelancer();
    }
  }, [taskId, freelancerId, clientId]);
 

  const fetchTask = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/tasks/${taskId}`);
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
      const response = await fetch(`${BASE_URL}/api/freelancers/${freelancerId}`);
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
      const response = await fetch(`${BASE_URL}/api/clients/${clientId}/create-contract`, {
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
        const contractData = await response.json();
        setContractId(contractData.id);
        alert('Contract awarded successfully! You can now add milestones.');
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

  const handleMilestoneInputChange = (e) => {
    const { name, value } = e.target;
    setMilestoneForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!contractId) {
      alert('Please create the contract first.');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/contracts/${contractId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: milestoneForm.title,
          description: milestoneForm.description,
          due_date: milestoneForm.due_date,
          weight: parseFloat(milestoneForm.weight) / 100 // Convert percentage back to decimal
        })
      });

      if (response.ok) {
        const newMilestone = await response.json();
        setMilestones(prev => [...prev, newMilestone]);
        setMilestoneForm({
          title: '',
          description: '',
          due_date: '',
          weight: ''
        });
        alert('Milestone added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add milestone: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding milestone:', error);
      alert('Error adding milestone. Please try again.');
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/contracts/${contractId}/milestones`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: milestones.find(m => m.id === milestoneId)?.title
        })
      });

      if (response.ok) {
        setMilestones(prev => prev.filter(m => m.id !== milestoneId));
      } else {
        alert('Failed to delete milestone');
      }
    } catch (error) {
      console.error('Error deleting milestone:', error);
      alert('Error deleting milestone. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <ClientSidebar />
        <div className="main-content">
          <p>Loading contract details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <ClientSidebar />

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
          {/* Contract Form */}
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

          {/* Milestones Section */}
          {contractId && (
            <div className="milestones-section">
              <h3>Project Milestones</h3>
              <p>Define the key deliverables and milestones for this contract.</p>

              {/* Add Milestone Form */}
              <form onSubmit={handleAddMilestone} className="milestone-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="milestone_title">Title</label>
                    <input
                      type="text"
                      id="milestone_title"
                      name="title"
                      value={milestoneForm.title}
                      onChange={handleMilestoneInputChange}
                      required
                      placeholder="e.g., Initial Design Phase"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="milestone_weight">Weight (%)</label>
                    <input
                      type="number"
                      id="milestone_weight"
                      name="weight"
                      value={milestoneForm.weight}
                      onChange={handleMilestoneInputChange}
                      min="0"
                      max="100"
                      step="0.1"
                      required
                      placeholder="e.g., 25"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="milestone_description">Description</label>
                  <textarea
                    id="milestone_description"
                    name="description"
                    value={milestoneForm.description}
                    onChange={handleMilestoneInputChange}
                    rows="3"
                    placeholder="Describe what needs to be delivered in this milestone..."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="milestone_due_date">Due Date</label>
                  <input
                    type="date"
                    id="milestone_due_date"
                    name="due_date"
                    value={milestoneForm.due_date}
                    onChange={handleMilestoneInputChange}
                    required
                  />
                </div>
                <button type="submit" className="add-milestone-btn">
                  <Plus size={16} />
                  Add Milestone
                </button>
              </form>

              {/* Milestones List */}
              {milestones.length > 0 && (
                <div className="milestones-list">
                  <h4>Added Milestones</h4>
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id || index} className="milestone-item">
                      <div className="milestone-content">
                        <h5>{milestone.title}</h5>
                        <p>{milestone.description}</p>
                        <div className="milestone-meta">
                          <span>Weight: {(milestone.weight * 100).toFixed(1)}%</span>
                          <span>Due: {milestone.due_date ? formatDate(milestone.due_date) : 'Not set'}</span>
                        </div>
                      </div>
                      <button
                        className="delete-milestone-btn"
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        title="Delete milestone"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AwardContractForm;