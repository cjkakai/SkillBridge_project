import React, { useState, useEffect } from 'react';
import FreelancerSidebar from './FreelancerSidebar';
import { useAuth } from '../../context/AuthContext';
import './Myprojects.css';

const Myprojects = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [contracts, setContracts] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [contractsCount, setContractsCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock freelancer ID - in real app, get from auth context

  const freelancerId = 1017;

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

          // Fetch client details if not included in contract
          let clientData = contract.client;
          if (!clientData && contract.client_id) {
            try {
              const clientResponse = await fetch(`/api/clients/${contract.client_id}`);
              if (clientResponse.ok) {
                clientData = await clientResponse.json();
              }
            } catch (clientError) {
              console.error('Error fetching client data:', clientError);
            }
          }

          // Fetch actual milestones from API
          let milestones = [];
          try {
            const milestonesResponse = await fetch(`/api/contracts/${contract.id}/milestones`);
            if (milestonesResponse.ok) {
              milestones = await milestonesResponse.json();
            }
          } catch (milestoneError) {
            console.error('Error fetching milestones:', milestoneError);
          }

          // Calculate progress based on actual milestones
          const completedCount = milestones.filter(m => m.completed).length;
          const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

          processedContracts.push({
            ...contract,
            task: taskData,
            client: clientData,
            milestones: milestones.map(m => ({
              id: m.id,
              title: m.title,
              status: m.completed ? 'completed' : 'pending',
              amount: m.weight || 0
            })),
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
      <div style={{
        flex: 1,
        backgroundColor: '#f3f4f6',
        marginLeft: sidebarCollapsed ? '72px' : '280px',
        transition: 'margin-left 0.3s ease'
      }}>
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
            Active Contracts ({contracts.filter(c => c.status === 'active').length})
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
                <div key={contract.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #f3f4f6',
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.1)';
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '2px solid #f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f9fafb'
                      }}>
                        {contract.client?.image ? (
                          <img
                            src={contract.client.image}
                            alt={contract.client.name || 'Client'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '18px'
                          }}>
                            {contract.client?.name?.charAt(0) || 'C'}
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                          {contract.task?.title || 'Project Title'}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                            {contract.client?.name || 'Unknown Client'}
                          </span>
                          <span style={{
                            color: contract.status === 'active' ? '#10b981' : contract.status === 'completed' ? '#059669' : '#6b7280',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            backgroundColor: contract.status === 'active' ? '#d1fae5' : contract.status === 'completed' ? '#dcfce7' : '#f3f4f6',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            {contract.status === 'active' ? 'In Progress' : contract.status === 'completed' ? 'Completed' : contract.status}
                          </span>
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {contract.task?.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontWeight: '600', color: '#111827' }}>
                          ${contract.total_amount?.toLocaleString() || '0'}
                        </span>
                      </div>
                      {contract.task?.deadline && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#6b7280' }}>📅</span>
                          <span style={{ color: '#6b7280', fontSize: '14px' }}>
                            {formatDate(contract.task.deadline)}
                          </span>
                        </div>
                      )}
                      {contract.progress !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#6b7280' }}>📊</span>
                          <span style={{ color: '#6b7280', fontSize: '14px' }}>
                            {contract.progress}% Complete
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>
                        Started {contract.started_at ? formatDate(contract.started_at) : 'N/A'}
                      </span>
                      <button
                        style={{
                          padding: '8px 24px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}>
                        View Details
                      </button>
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