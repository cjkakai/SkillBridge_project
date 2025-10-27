import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, ArrowLeft, Calendar, DollarSign, User, FileText, Clock, Star, Download, AlertTriangle } from 'lucide-react';
import '../client/ClientDashboard.css';
import '../client/ClientContracts.css';

const ContractDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState("");
  const [contractStatus, setContractStatus] = useState("");
  const clientId = 5; // Should come from auth context

  useEffect(() => {
    fetchContract();
    fetchClientData();
  }, [id]);

  useEffect(() => {
    if (contract) {
      setContractStatus(contract.status || 'active');
    }
  }, [contract]);

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

        // Fetch milestones separately
        const milestonesResponse = await fetch(`/api/contracts/${id}/milestones`);
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
          <div className="nav-item" onClick={() => navigate('/')}>
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
              <h1>Contract Details</h1>
              <p>Code: {contract?.contract_code}</p>
            </div>
          </div>
          <button className="back-btn" onClick={() => navigate('/client-contracts')}>
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
              <div className="contract-details">
                <div className="detail-item">
                  <DollarSign size={16} />
                  <span>Agreed Amount: ${contract.agreed_amount}</span>
                </div>
                <div className="detail-item">
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
              {milestones && milestones.length > 0 ? (
                <>
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress || 0 }%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{progress || 0}% Complete</span>
                  </div>

                  <div className="milestones-section">
                    <h4>Milestones</h4>
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id || index} className="milestone-item">
                        <div className="milestone-header">
                          <span className="milestone-title">{milestone.title}</span>
                          <span className={`milestone-status ${milestone.completed ? 'completed' : 'pending'}`}>
                            {milestone.completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                        <p className="milestone-description">{milestone.description}</p>
                        <div className="milestone-details">
                          <span>Due: {milestone.due_date ? formatDate(milestone.due_date) : 'Not set'}</span>
                          <span>Created: {milestone.created_at ? formatDate(milestone.created_at) : 'Not set'}</span>
                          <span>Weight: {milestone.weight ? (milestone.weight * 100) + '%' : 'Not set'}</span>
                          {milestone.file_url && (
                            <button
                              className="download-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(milestone.file_url, '_blank');
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