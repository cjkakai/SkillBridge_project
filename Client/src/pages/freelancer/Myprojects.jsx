import React, { useState, useEffect } from 'react';
import FreelancerSidebar from './FreelancerSidebar';
import './Myprojects.css';

const Myprojects = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [contracts, setContracts] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [contractsCount, setContractsCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock freelancer ID - in real app, get from auth context
  const freelancerId = 1001;

  useEffect(() => {
    fetchProjectData();
  }, []);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      
      // Fetch contracts from API
      const contractsResponse = await fetch(`/api/freelancers/${freelancerId}/contracts`);
      if (!contractsResponse.ok) {
        throw new Error(`HTTP error! status: ${contractsResponse.status}`);
      }
      const contractsData = await contractsResponse.json();
      
      if (!Array.isArray(contractsData)) {
        console.error('Contracts data is not an array:', contractsData);
        setContracts([]);
        setContractsCount(0);
        return;
      }
      
      // Process contracts with task data
      const processedContracts = [];
      for (const contract of contractsData) {
        try {
          // Fetch task details
          const taskResponse = await fetch(`/api/tasks/${contract.task_id}`);
          const taskData = taskResponse.ok ? await taskResponse.json() : {
            title: 'Unknown Task',
            description: 'No description available',
            deadline: null
          };
          
          // Create sample milestones
          const milestones = [
            { id: 1, title: 'Initial Setup', status: 'completed', amount: 1000 },
            { id: 2, title: 'Development', status: 'in_progress', amount: 2000 },
            { id: 3, title: 'Testing', status: 'pending', amount: 1000 }
          ];
          
          const completedCount = milestones.filter(m => m.status === 'completed').length;
          const progress = Math.round((completedCount / milestones.length) * 100);
          
          processedContracts.push({
            ...contract,
            task: taskData,
            milestones,
            progress,
            total_amount: parseFloat(contract.agreed_amount || 0)
          });
        } catch (error) {
          console.error('Error processing contract:', contract.id, error);
        }
      }
      
      setContracts(processedContracts);
      setContractsCount(processedContracts.length);
      
      // Fetch payments
      try {
        const paymentsResponse = await fetch(`/api/freelancers/${freelancerId}/payments`);
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          const total = Array.isArray(paymentsData) ? 
            paymentsData
              .filter(payment => payment.status === 'completed')
              .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0) : 0;
          setTotalPayments(total);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        setTotalPayments(0);
      }
      
      // Fetch messages
      try {
        const messagesResponse = await fetch(`/api/freelancers/${freelancerId}/messages`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          const unread = Array.isArray(messagesData) ? 
            messagesData.filter(msg => !msg.is_read).length : 0;
          setUnreadMessages(unread);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setUnreadMessages(0);
      }
      
    } catch (error) {
      console.error('Error fetching project data:', error);
      setContracts([]);
      setContractsCount(0);
      setTotalPayments(0);
      setUnreadMessages(0);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMilestoneStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { bg: '#dcfce7', color: '#166534' };
      case 'in_progress':
        return { bg: '#dbeafe', color: '#1e40af' };
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <FreelancerSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
        {/* Global Header */}
        <div style={{ 
          backgroundColor: 'white', 
          borderBottom: '1px solid #e5e7eb', 
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button style={{ 
            color: '#2563eb', 
            fontSize: '14px', 
            fontWeight: '500',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}>← Back to Selection</button>
        </div>
        <div className="my-projects-container">
      {/* Header */}
      <div className="my-projects-header">
        <div>
          <h1>My Projects</h1>
          <p>Track and manage all your active and completed projects</p>
        </div>
      </div>

      <div className="my-projects-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-content">
              <div>
                <p className="stat-label">Total Payments</p>
                <p className="stat-value">
                  {loading ? '...' : `$${totalPayments.toLocaleString()}`}
                </p>
              </div>
              <div className="stat-icon payments">
                <span>💰</span>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <div>
                <p className="stat-label">Total Contracts</p>
                <p className="stat-value">
                  {loading ? '...' : contractsCount}
                </p>
              </div>
              <div className="stat-icon contracts">
                <span>📄</span>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <div>
                <p className="stat-label">Unread Messages</p>
                <p className="stat-value">
                  {loading ? '...' : unreadMessages}
                </p>
              </div>
              <div className="stat-icon messages">
                <span>💬</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="project-tabs">
          <button
            onClick={() => setActiveTab('active')}
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          >
            Active Projects ({contracts.filter(c => c.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
          >
            Completed ({contracts.filter(c => c.status === 'completed').length})
          </button>
        </div>

        {/* Project Cards */}
        {loading ? (
          <div className="loading-card">
            <p>Loading projects...</p>
          </div>
        ) : (
          <div>
            <p className="projects-count">Found {contracts.length} contracts</p>
            {contracts.length === 0 ? (
              <div className="no-projects-card">
                <p>No projects found.</p>
              </div>
            ) : (
              <div className="projects-list">
                {contracts
                  .filter(contract => activeTab === 'active' ? (contract.status === 'active' || !contract.status) : contract.status === 'completed')
                  .map((contract) => (
                <div key={contract.id} className="project-card">
                  <div className="project-header">
                    <div className="project-info">
                      <div className="client-avatar">
                        {contract.client?.image ? (
                          <img src={contract.client.image} alt={contract.client.name} />
                        ) : (
                          <span>{contract.client?.name?.charAt(0) || 'C'}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="project-title">
                          {contract.task?.title || 'Project Title'}
                        </h3>
                        <p className="client-name">Client: {contract.client?.name || 'Unknown Client'}</p>
                        <p className="project-description">
                          {contract.task?.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                    <div className="project-actions">
                      <span className={`status-badge ${contract.status}`}>
                        {contract.status === 'active' ? 'In Progress' : 'Completed'}
                      </span>
                      <button className="view-details-btn">View Details</button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Overall Progress</span>
                      <span className="progress-percentage">{contract.progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${contract.progress || 0}%` }}></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="project-details">
                    <div className="detail-item">
                      <p className="detail-label">Budget</p>
                      <p className="detail-value">
                        ${contract.total_amount?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="detail-item">
                      <p className="detail-label">Client Contact</p>
                      <p className="detail-value">
                        {contract.client?.contact || 'N/A'}
                      </p>
                    </div>
                    <div className="detail-item">
                      <p className="detail-label">Deadline</p>
                      <p className="detail-value">
                        {contract.task?.deadline ? formatDate(contract.task.deadline) : 'N/A'}
                      </p>
                    </div>
                    <div className="detail-item">
                      <p className="detail-label">Client Email</p>
                      <p className="detail-value">
                        {contract.client?.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Milestones */}
                  {contract.milestones && contract.milestones.length > 0 && (
                    <div className="milestones-section">
                      <h4 className="milestones-title">Milestones</h4>
                      <div className="milestones-list">
                        {contract.milestones.map((milestone, index) => {
                          const statusStyle = getMilestoneStatusColor(milestone.status);
                          return (
                            <div key={milestone.id} className="milestone-item">
                              <div className="milestone-info">
                                <div className={`milestone-icon ${milestone.status}`}>
                                  {milestone.status === 'completed' ? '✓' : index + 1}
                                </div>
                                <span className="milestone-title">{milestone.title}</span>
                              </div>
                              <div className="milestone-details">
                                <span className="milestone-amount">
                                  ${milestone.amount?.toLocaleString() || '0'}
                                </span>
                                <span className="milestone-status" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                  {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1).replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                  ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Myprojects;