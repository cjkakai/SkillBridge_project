import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, ArrowLeft, Calendar, DollarSign, User, FileText, Clock, Star, Download, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/auth/LogoutButton';
import { BASE_URL } from '../../config';
import '../client/ClientDashboard.css';
import '../client/ClientContracts.css';

const ContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState("");
  const [contractStatus, setContractStatus] = useState("");
  const [showAddMilestoneForm, setShowAddMilestoneForm] = useState(false);
  const clientId = user?.id;

  useEffect(() => {
    if (user?.id) {
      fetchContract();
      fetchClientData();
    }
  }, [id, user?.id]);

  useEffect(() => {
    if (contract) {
      setContractStatus(contract.status || 'active');
    }
  }, [contract]);

  const fetchClientData = () => {
    fetch(`${BASE_URL}/api/clients/${clientId}`)
      .then((response) => response.json())
      .then((data) => {
        setClientName(data.name);
        setClientImage(data.image);
      });
  };

  const fetchContract = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/contracts/${id}`);
      if (response.ok) {
        const data = await response.json();
        setContract(data);

        // Fetch milestones separately
        const milestonesResponse = await fetch(`${BASE_URL}/api/contracts/${id}/milestones`);
        if (milestonesResponse.ok) {
          const milestonesData = await milestonesResponse.json();
          console.log(milestonesData)
          setMilestones(milestonesData);

          // Calculate progress based on milestone weights
          const completedMilestones = milestonesData.filter(m => m.completed === true);
          const totalWeight = milestonesData.reduce((sum, m) => sum + (parseFloat(m.weight) || 0), 0);
          const completedWeight = completedMilestones.reduce((sum, m) => sum + (parseFloat(m.weight) || 0), 0);
          const completionRate = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
          console.log('Completion Rate:', completionRate);
          setProgress(completionRate);
        }
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        const response = await fetch(`${BASE_URL}/api/contracts/${id}/milestones/${milestoneId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // Refresh contract data to update milestones and progress
          fetchContract();
          alert('Milestone deleted successfully.');
        } else {
          const errorData = await response.json();
          alert(`Failed to delete milestone: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting milestone:', error);
        alert('Error deleting milestone. Please try again.');
      }
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const milestoneData = {
      title: formData.get('title'),
      description: formData.get('description'),
      due_date: formData.get('due_date'),
      weight: parseFloat(formData.get('weight')) / 100 // Convert percentage to decimal
    };

    try {
      const response = await fetch(`${BASE_URL}/api/contracts/${id}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(milestoneData)
      });

      if (response.ok) {
        // Refresh contract data to update milestones and progress
        fetchContract();
        setShowAddMilestoneForm(false);
        e.target.reset();
        alert('Milestone added successfully.');
      } else {
        const errorData = await response.json();
        alert(`Failed to add milestone: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding milestone:', error);
      alert('Error adding milestone. Please try again.');
    }
  };

  const handleDownloadFile = async (milestoneId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/milestones/${milestoneId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `milestone_${milestoneId}_file`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const numStars = Math.round(parseFloat(rating)) || 0;
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          fill={i < numStars ? '#FFD700' : 'none'}
          color={i < numStars ? '#FFD700' : '#E0E0E0'}
        />
      );
    }
    return stars;
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
          <div className="nav-item" onClick={() => navigate('/client/dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div className="nav-item active">
            <Briefcase size={20} />
            <span>My Contracts</span>
          </div>
          <div className="nav-item">
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
          <div className="nav-item" onClick={() => navigate('/client-payment')}>
            <CreditCard size={20} />
            <span>Payments</span>
          </div>
          <LogoutButton />
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
              <h1>Contract Details</h1>
              <p>Code: {contract?.contract_code}</p>
            </div>
          </div>
          <button onClick={() => navigate('/client-contracts')}>
            <ArrowLeft size={20} />
            Back to Contracts
          </button>
        </div>

        {contract && (
          <div className="contract-details-page">
            {/* Contract Status */}
            <div className="contract-card">
              <div className="contract-header">
                <div className="contract-code">
                  <FileText size={20} />
                  <span>Contract Code: {contract.contract_code}</span>
                </div>
              </div>
            </div>

            {/* Task Details */}
            <div className="contract-card">
              <h3>Task Details</h3>
              <div className="contract-task">
                <h4>{contract.task?.title}</h4>
                <p>{contract.task?.description}</p>
                <div className="task-deadline">
                  <Clock size={16} />
                  <span>Deadline: {contract.task?.deadline ? formatDate(contract.task.deadline) : 'Not set'}</span>
                </div>
              </div>
            </div>

            {/* Freelancer Details */}
            <div className="contract-card">
              <h3>Freelancer Details</h3>
              <div className="contract-freelancer">
                <div className="freelancer-avatar">
                  <img
                    src={contract.freelancer?.image || '/default-avatar.png'}
                    alt={`${contract.freelancer?.name} avatar`}
                  />
                </div>
                <div className="freelancer-info">
                  <h3>{contract.freelancer?.name}</h3>
                  <p>{contract.freelancer?.bio}</p>
                  <div className="freelancer-rating">
                    {renderStars(contract.freelancer?.ratings)}
                    <span>({contract.freelancer?.ratings || 0})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Information */}
            <div className="contract-card">
              <h3>Contract Information</h3>
              <div className="contract-details"style={{marginTop:'10px'}}>
                <div style={{display:'flex', alignItems:"center", gap:'5px'}}>
                  <DollarSign size={16} />
                  <span>Agreed Amount: ksh{parseFloat(contract.agreed_amount).toFixed(2)}</span>
                </div>
                <div style={{display:'flex', alignItems:"center", gap:'5px'}}>
                  <Calendar size={16} />
                  <span>Started: {formatDate(contract.started_at)}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="contract-card">
              <h3>Contact Information</h3>
              <div className="contract-contact">
                <div className="contact-item">
                  <span className="contact-label">📧 Email:</span>
                  <span>{contract.freelancer?.email}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">📞 Contact:</span>
                  <span>{contract.freelancer?.contact}</span>
                </div>
              </div>
            </div>

            {/* Project Progress */}
            <div className="contract-card">
              <h3>Project Progress</h3>

              {/* Add Milestone Section */}
              <div className="add-milestone-section">
                <button
                  className="add-milestone-btn"
                  onClick={() => setShowAddMilestoneForm(!showAddMilestoneForm)}
                >
                  <Plus size={16} />
                  {showAddMilestoneForm ? 'Cancel' : 'Add Milestone'}
                </button>

                {showAddMilestoneForm && (
                  <form className="add-milestone-form" onSubmit={handleAddMilestone}>
                    <div className="form-group">
                      <label htmlFor="milestone-title">Title</label>
                      <input
                        type="text"
                        id="milestone-title"
                        name="title"
                        required
                        placeholder="Enter milestone title"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="milestone-description">Description</label>
                      <textarea
                        id="milestone-description"
                        name="description"
                        rows="3"
                        placeholder="Describe the milestone"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="milestone-due-date">Due Date</label>
                      <input
                        type="date"
                        id="milestone-due-date"
                        name="due_date"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="milestone-weight">Weight (%)</label>
                      <input
                        type="number"
                        id="milestone-weight"
                        name="weight"
                        min="1"
                        max="100"
                        required
                        placeholder="Enter weight as percentage (e.g., 25)"
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="submit-milestone-btn">
                        <Plus size={16} />
                        Add Milestone
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {milestones && milestones.length > 0 ? (
                <>
                  <div className="task-progress-container">
                    <div className="progress-text-above">{progress || 0}% Complete</div>
                    <div className="task-progress-full">
                      <div className="progress-fill-full" style={{ width: `${progress || 0}%` }}></div>
                    </div>
                  </div>

                  <div className="milestones-section">
                    <h4>Milestones</h4>
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id || index} className="milestone-item">
                        <div className="milestone-header">
                          <span className="milestone-title">{milestone.title}</span>
                          <div className="milestone-actions">
                            <span className={`milestone-status ${milestone.completed ? 'completed' : 'pending'}`}>
                              {milestone.completed ? 'Completed' : 'Pending'}
                            </span>
                            <button
                              className="delete-milestone-btn"
                              onClick={() => handleDeleteMilestone(milestone.id)}
                              title="Delete milestone"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="milestone-description" style={{width:'600px'}}>{milestone.description}</p>
                        <div className="milestone-details">
                          <span>Due: {milestone.due_date ? formatDate(milestone.due_date) : 'Not set'}</span>
                          <span>Created: {milestone.created_at ? formatDate(milestone.created_at) : 'Not set'}</span>
                          <span>Weight: {milestone.weight ? (milestone.weight * 100) + '%' : 'Not set'}</span>
                          {milestone.file_url && (
                            <button
                              className="download-btn"
                              onClick={() => handleDownloadFile(milestone.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px'
                              }}
                            >
                              <Download size={14} />
                              Download File
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p>No milestones found for this contract.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractDetails;