import React, { useState, useEffect } from 'react';

const BrowseTasks = () => {
  const [currentPage, setCurrentPage] = useState('my-projects');
  const [activeTab, setActiveTab] = useState('active');
  const [jobTab, setJobTab] = useState('all');
  const [contracts, setContracts] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [contractsCount, setContractsCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Mock freelancer ID - in real app, get from auth context
  const freelancerId = 1001;

  useEffect(() => {
    fetchProjectData();
  }, []);

  useEffect(() => {
    if (currentPage === 'browse-jobs') {
      fetchTasks();
    } else if (currentPage === 'earnings') {
      fetchEarningsData();
    }
  }, [currentPage]);

  const fetchEarningsData = async () => {
    try {
      const paymentsResponse = await fetch(`/api/freelancers/${freelancerId}/payments`);
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        console.log('Earnings payments data:', paymentsData);
        const total = paymentsData
          .filter(payment => payment.status === 'completed')
          .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
        setTotalPayments(total);
      }
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const tasksData = await response.json();
        console.log('Tasks data:', tasksData);
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      
      // Fetch contracts from API
      const contractsResponse = await fetch(`/api/freelancers/${freelancerId}/contracts`);
      if (!contractsResponse.ok) {
        throw new Error(`HTTP error! status: ${contractsResponse.status}`);
      }
      const contractsData = await contractsResponse.json();
      console.log('Raw contracts data:', contractsData);
      
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
      
      console.log('Processed contracts:', processedContracts);
      setContracts(processedContracts);
      setContractsCount(processedContracts.length);
      
      if (processedContracts.length === 0) {
        console.log('No contracts found for freelancer:', freelancerId);
      }
      
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
      // Ensure minimum loading time for better UX
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '240px', 
        backgroundColor: '#1e293b', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ padding: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0 }}>SkillBridge</h1>
        </div>
        <nav style={{ flex: 1 }}>
          <div 
            onClick={() => setCurrentPage('my-projects')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 24px', 
              backgroundColor: currentPage === 'my-projects' ? '#2563eb' : 'transparent',
              color: currentPage === 'my-projects' ? 'white' : '#9ca3af',
              borderTopRightRadius: currentPage === 'my-projects' ? '8px' : '0',
              borderBottomRightRadius: currentPage === 'my-projects' ? '8px' : '0',
              marginRight: currentPage === 'my-projects' ? '16px' : '0',
              cursor: 'pointer'
            }}>
            <span style={{ marginRight: '12px' }}>📁</span>
            My Projects
          </div>
          <div 
            onClick={() => setCurrentPage('browse-jobs')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 24px', 
              color: currentPage === 'browse-jobs' ? 'white' : '#9ca3af',
              backgroundColor: currentPage === 'browse-jobs' ? '#2563eb' : 'transparent',
              borderTopRightRadius: currentPage === 'browse-jobs' ? '8px' : '0',
              borderBottomRightRadius: currentPage === 'browse-jobs' ? '8px' : '0',
              marginRight: currentPage === 'browse-jobs' ? '16px' : '0',
              cursor: 'pointer'
            }}>
            <span style={{ marginRight: '12px' }}>🔍</span>
            Browse Jobs
          </div>

          <div 
            onClick={() => setCurrentPage('earnings')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px 24px', 
              color: currentPage === 'earnings' ? 'white' : '#9ca3af',
              backgroundColor: currentPage === 'earnings' ? '#2563eb' : 'transparent',
              borderTopRightRadius: currentPage === 'earnings' ? '8px' : '0',
              borderBottomRightRadius: currentPage === 'earnings' ? '8px' : '0',
              marginRight: currentPage === 'earnings' ? '16px' : '0',
              cursor: 'pointer'
            }}>
            <span style={{ marginRight: '12px' }}>💰</span>
            Earnings
          </div>
        </nav>
      </div>

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
        {currentPage === 'my-projects' && (
          <>
        {/* Header */}
        <div style={{ backgroundColor: 'white', padding: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>My Projects</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>Track and manage all your active and completed projects</p>
          </div>
        </div>

        <div style={{ padding: '32px' }}>
          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Total Payments</p>
                  <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    {loading ? '...' : `$${totalPayments.toLocaleString()}`}
                  </p>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#dcfce7', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ color: '#16a34a', fontSize: '24px' }}>💰</span>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Total Contracts</p>
                  <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    {loading ? '...' : contractsCount}
                  </p>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ color: '#2563eb', fontSize: '24px' }}>📄</span>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Unread Messages</p>
                  <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    {loading ? '...' : unreadMessages}
                  </p>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#fef3c7', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ color: '#d97706', fontSize: '24px' }}>💬</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '32px', 
            borderBottom: '1px solid #e5e7eb', 
            marginBottom: '32px' 
          }}>
            <button
              onClick={() => setActiveTab('active')}
              style={{
                paddingBottom: '16px',
                paddingLeft: '4px',
                paddingRight: '4px',
                borderBottom: activeTab === 'active' ? '2px solid #3b82f6' : '2px solid transparent',
                fontWeight: '500',
                fontSize: '14px',
                color: activeTab === 'active' ? '#3b82f6' : '#6b7280',
                background: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                cursor: 'pointer'
              }}
            >
              Active Projects ({contracts.filter(c => c.status === 'active').length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              style={{
                paddingBottom: '16px',
                paddingLeft: '4px',
                paddingRight: '4px',
                borderBottom: activeTab === 'completed' ? '2px solid #3b82f6' : '2px solid transparent',
                fontWeight: '500',
                fontSize: '14px',
                color: activeTab === 'completed' ? '#3b82f6' : '#6b7280',
                background: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                cursor: 'pointer'
              }}
            >
              Completed ({contracts.filter(c => c.status === 'completed').length})
            </button>
          </div>

          {/* Project Cards */}
          {loading ? (
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px', textAlign: 'center' }}>
              <p style={{ color: '#6b7280' }}>Loading projects...</p>
            </div>
          ) : (
            <div>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>Found {contracts.length} contracts</p>
              {contracts.length === 0 ? (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280' }}>No projects found.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {contracts
                    .filter(contract => activeTab === 'active' ? (contract.status === 'active' || !contract.status) : contract.status === 'completed')
                    .map((contract) => (
                <div key={contract.id} style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '56px', 
                        height: '56px', 
                        backgroundColor: contract.client?.image ? 'transparent' : '#3b82f6', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'white', 
                        fontWeight: 'bold', 
                        fontSize: '18px',
                        backgroundImage: contract.client?.image ? `url(${contract.client.image})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}>
                        {!contract.client?.image && (contract.client?.name?.charAt(0) || 'C')}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                          {contract.task?.title || 'Project Title'}
                        </h3>
                        <p style={{ color: '#6b7280', margin: '0 0 4px 0' }}>Client: {contract.client?.name || 'Unknown Client'}</p>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                          {contract.task?.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ 
                        backgroundColor: contract.status === 'active' ? '#dbeafe' : '#dcfce7', 
                        color: contract.status === 'active' ? '#1e40af' : '#166534', 
                        padding: '8px 16px', 
                        borderRadius: '9999px', 
                        fontSize: '14px', 
                        fontWeight: '500' 
                      }}>
                        {contract.status === 'active' ? 'In Progress' : 'Completed'}
                      </span>
                      <button style={{ 
                        color: '#3b82f6', 
                        fontWeight: '500',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}>View Details</button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Overall Progress</span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{contract.progress || 0}%</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '12px' }}>
                      <div style={{ backgroundColor: '#3b82f6', height: '12px', borderRadius: '9999px', width: `${contract.progress || 0}%` }}></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '32px', 
                    marginBottom: '32px' 
                  }}>
                    <div>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Budget</p>
                      <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                        ${contract.total_amount?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Client Contact</p>
                      <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                        {contract.client?.contact || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Deadline</p>
                      <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                        {contract.task?.deadline ? formatDate(contract.task.deadline) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Client Email</p>
                      <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                        {contract.client?.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Milestones */}
                  {contract.milestones && contract.milestones.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 24px 0' }}>Milestones</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {contract.milestones.map((milestone, index) => {
                          const statusStyle = getMilestoneStatusColor(milestone.status);
                          return (
                            <div key={milestone.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  backgroundColor: milestone.status === 'completed' ? '#10b981' : milestone.status === 'in_progress' ? '#3b82f6' : '#d1d5db', 
                                  borderRadius: '50%', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  color: 'white', 
                                  fontWeight: '500' 
                                }}>
                                  {milestone.status === 'completed' ? '✓' : index + 1}
                                </div>
                                <span style={{ fontWeight: '500', color: '#111827' }}>{milestone.title}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                                  ${milestone.amount?.toLocaleString() || '0'}
                                </span>
                                <span style={{ 
                                  backgroundColor: statusStyle.bg, 
                                  color: statusStyle.color, 
                                  padding: '4px 12px', 
                                  borderRadius: '9999px', 
                                  fontSize: '14px', 
                                  fontWeight: '500' 
                                }}>
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
          </>
        )}
        
        {currentPage === 'browse-jobs' && (
          <>
            {/* Header */}
            <div style={{ backgroundColor: 'white', padding: '32px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Browse Jobs</h1>
                <p style={{ color: '#6b7280', margin: 0 }}>Find your next opportunity from thousands of available jobs</p>
              </div>
            </div>

            <div style={{ padding: '32px' }}>
              {/* Search and Filters */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
                  <div style={{ flex: '2', position: 'relative', maxWidth: '400px' }}>
                    <input 
                      type="text" 
                      placeholder="Search jobs by title, skills, or keywords..."
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 40px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>🔍</span>
                  </div>
                  <select style={{ padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minWidth: '150px', flexShrink: 0 }}>
                    <option>All Categories</option>
                    <option>Web Development</option>
                    <option>Mobile Development</option>
                    <option>Design</option>
                    <option>Writing</option>
                    <option>Marketing</option>
                    <option>Data Science</option>
                    <option>DevOps</option>
                  </select>
                  <select style={{ padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minWidth: '140px', flexShrink: 0 }}>
                    <option>Newest First</option>
                    <option>Highest Budget</option>
                    <option>Lowest Budget</option>
                    <option>Fewest Proposals</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button style={{ 
                    padding: '8px 16px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px', 
                    backgroundColor: 'white',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>
                    ⚙️ More Filters
                  </button>
                  <span style={{ padding: '4px 12px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '16px', fontSize: '12px' }}>Remote</span>
                  <span style={{ padding: '4px 12px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '16px', fontSize: '12px' }}>Fixed Price</span>
                  <span style={{ padding: '4px 12px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '16px', fontSize: '12px' }}>Expert Level</span>
                </div>
              </div>

              {/* Job Tabs */}
              <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
                <button
                  onClick={() => setJobTab('all')}
                  style={{
                    paddingBottom: '16px',
                    borderBottom: jobTab === 'all' ? '2px solid #3b82f6' : '2px solid transparent',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: jobTab === 'all' ? '#3b82f6' : '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  All Jobs ({tasks.length})
                </button>
                <button
                  onClick={() => setJobTab('best-matches')}
                  style={{
                    paddingBottom: '16px',
                    borderBottom: jobTab === 'best-matches' ? '2px solid #3b82f6' : '2px solid transparent',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: jobTab === 'best-matches' ? '#3b82f6' : '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Best Matches
                </button>
                <button
                  onClick={() => setJobTab('saved')}
                  style={{
                    paddingBottom: '16px',
                    borderBottom: jobTab === 'saved' ? '2px solid #3b82f6' : '2px solid transparent',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: jobTab === 'saved' ? '#3b82f6' : '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Saved (0)
                </button>
              </div>

              {/* Job Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tasksLoading ? (
                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <p style={{ color: '#6b7280' }}>Loading jobs...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <p style={{ color: '#6b7280' }}>No jobs available.</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div style={{ 
                            width: '48px', 
                            height: '48px', 
                            backgroundColor: '#3b82f6', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white', 
                            fontWeight: 'bold' 
                          }}>
                            {task.title?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                              {task.title || 'Untitled Task'}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <span style={{ color: '#6b7280', fontSize: '14px' }}>Client ID: {task.client_id}</span>
                              <span style={{ color: '#6b7280', fontSize: '14px' }}>Status: {task.status}</span>
                            </div>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                              {task.description || 'No description available'}
                            </p>
                          </div>
                        </div>
                        <button style={{ color: '#6b7280', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>🔖</button>
                      </div>
                      
                      {task.skills && task.skills.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                          {task.skills.map((skill, index) => (
                            <span key={index} style={{ padding: '4px 12px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '16px', fontSize: '12px' }}>
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontWeight: '600', color: '#111827' }}>
                              ${task.budget_min?.toLocaleString() || '0'} - ${task.budget_max?.toLocaleString() || '0'}
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '14px' }}>Fixed</span>
                          </div>
                          {task.deadline && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: '#6b7280' }}>📅</span>
                              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                                {formatDate(task.deadline)}
                              </span>
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#6b7280' }}>📍</span>
                            <span style={{ color: '#6b7280', fontSize: '14px' }}>Remote</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ color: '#6b7280', fontSize: '14px' }}>
                            Posted {formatDate(task.created_at)}
                          </span>
                          <button style={{ 
                            padding: '8px 24px', 
                            backgroundColor: '#3b82f6', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}>Apply Now</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
        
        {currentPage === 'dashboard' && (
          <div style={{ padding: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827' }}>Dashboard</h1>
            <p style={{ color: '#6b7280' }}>Dashboard content coming soon...</p>
          </div>
        )}
        
        {currentPage === 'my-proposals' && (
          <div style={{ padding: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827' }}>My Proposals</h1>
            <p style={{ color: '#6b7280' }}>My Proposals content coming soon...</p>
          </div>
        )}
        
        {currentPage === 'messages' && (
          <div style={{ padding: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827' }}>Messages</h1>
            <p style={{ color: '#6b7280' }}>Messages content coming soon...</p>
          </div>
        )}
        
        {currentPage === 'earnings' && (
          <>
            {/* Header */}
            <div style={{ backgroundColor: 'white', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Earnings</h1>
                  <p style={{ color: '#6b7280', margin: 0 }}>Track your income, transactions, and withdraw funds</p>
                </div>
                <button style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⬇️</span> Withdraw Funds
                </button>
              </div>
            </div>

            <div style={{ padding: '32px' }}>
              {/* Stats Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '24px', 
                marginBottom: '32px' 
              }}>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Total Earnings</span>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: '#dbeafe', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <span style={{ color: '#3b82f6', fontSize: '20px' }}>💰</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>${totalPayments.toLocaleString()}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#10b981', fontSize: '12px' }}>📈 12% from last month</span>
                  </div>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Available Balance</span>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: '#dcfce7', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <span style={{ color: '#16a34a', fontSize: '20px' }}>💳</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>${Math.round(totalPayments * 0.7).toLocaleString()}</div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>Ready to withdraw</div>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Pending</span>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: '#fef3c7', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <span style={{ color: '#d97706', fontSize: '20px' }}>⏰</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>${Math.round(totalPayments * 0.2).toLocaleString()}</div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>2 pending payments</div>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>This Month</span>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: '#fef3c7', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <span style={{ color: '#d97706', fontSize: '20px' }}>📊</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>${Math.round(totalPayments * 0.3).toLocaleString()}</div>
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>From 5 projects</div>
                </div>
              </div>

              {/* Charts Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Earnings Trend Chart */}
                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 24px 0' }}>Earnings Trend</h3>
                  <div style={{ 
                    height: '300px',
                    position: 'relative',
                    padding: '20px'
                  }}>
                    {/* Y-axis labels */}
                    <div style={{ 
                      position: 'absolute', 
                      left: '10px', 
                      top: '20px', 
                      bottom: '40px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      <span>6000</span>
                      <span>4500</span>
                      <span>3000</span>
                      <span>1500</span>
                      <span>0</span>
                    </div>
                    
                    {/* X-axis labels */}
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '10px', 
                      left: '50px', 
                      right: '20px', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                      <span>Sep</span>
                      <span>Oct</span>
                    </div>
                    
                    {/* SVG Chart */}
                    <svg 
                      style={{ 
                        position: 'absolute',
                        top: '20px',
                        left: '50px',
                        right: '20px',
                        bottom: '40px',
                        width: 'calc(100% - 70px)',
                        height: '220px'
                      }}
                      viewBox="0 0 400 220"
                    >
                      {/* Grid lines */}
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
                          <stop offset="50%" stopColor="#dbeafe" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>
                      
                      {/* Horizontal grid lines */}
                      <line x1="0" y1="44" x2="400" y2="44" stroke="#f3f4f6" strokeWidth="1" />
                      <line x1="0" y1="88" x2="400" y2="88" stroke="#f3f4f6" strokeWidth="1" />
                      <line x1="0" y1="132" x2="400" y2="132" stroke="#f3f4f6" strokeWidth="1" />
                      <line x1="0" y1="176" x2="400" y2="176" stroke="#f3f4f6" strokeWidth="1" />
                      
                      {/* Area fill */}
                      <path 
                        d="M 0 176 L 57 154 L 114 132 L 171 143 L 228 121 L 285 110 L 342 88 L 400 66 L 400 220 L 0 220 Z"
                        fill="url(#areaGradient)"
                      />
                      
                      {/* Line */}
                      <path 
                        d="M 0 176 Q 28 165 57 154 Q 85 143 114 132 Q 142 137 171 143 Q 199 132 228 121 Q 256 115 285 110 Q 313 99 342 88 Q 371 77 400 66"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                      />
                      
                      {/* Data points */}
                      <circle cx="0" cy="176" r="4" fill="#3b82f6" />
                      <circle cx="57" cy="154" r="4" fill="#3b82f6" />
                      <circle cx="114" cy="132" r="4" fill="#3b82f6" />
                      <circle cx="171" cy="143" r="4" fill="#3b82f6" />
                      <circle cx="228" cy="121" r="4" fill="#3b82f6" />
                      <circle cx="285" cy="110" r="4" fill="#3b82f6" />
                      <circle cx="342" cy="88" r="4" fill="#3b82f6" />
                      <circle cx="400" cy="66" r="4" fill="#3b82f6" />
                    </svg>
                  </div>
                </div>

                {/* Earnings by Category */}
                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 24px 0' }}>Earnings by Category</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>Web Development</span>
                      </div>
                      <div style={{ 
                        width: '120px', 
                        height: '8px', 
                        backgroundColor: '#f3f4f6', 
                        borderRadius: '4px',
                        position: 'relative'
                      }}>
                        <div style={{ 
                          width: '85%', 
                          height: '100%', 
                          backgroundColor: '#3b82f6', 
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>Design</span>
                      </div>
                      <div style={{ 
                        width: '120px', 
                        height: '8px', 
                        backgroundColor: '#f3f4f6', 
                        borderRadius: '4px',
                        position: 'relative'
                      }}>
                        <div style={{ 
                          width: '45%', 
                          height: '100%', 
                          backgroundColor: '#3b82f6', 
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>Consulting</span>
                      </div>
                      <div style={{ 
                        width: '120px', 
                        height: '8px', 
                        backgroundColor: '#f3f4f6', 
                        borderRadius: '4px',
                        position: 'relative'
                      }}>
                        <div style={{ 
                          width: '15%', 
                          height: '100%', 
                          backgroundColor: '#3b82f6', 
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Payments */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 24px 0' }}>Pending Payments</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>E-commerce Website</h4>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>TechCorp Inc. • Backend Development</p>
                      <span style={{ 
                        backgroundColor: '#fef3c7', 
                        color: '#d97706', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: '500',
                        marginTop: '4px',
                        display: 'inline-block'
                      }}>Pending Approval</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>$1,500</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>Due: Oct 25, 2025</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Mobile App Design</h4>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>StartupHub • Prototyping</p>
                      <span style={{ 
                        backgroundColor: '#dbeafe', 
                        color: '#1e40af', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: '500',
                        marginTop: '4px',
                        display: 'inline-block'
                      }}>In Escrow</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>$960</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>Due: Oct 28, 2025</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>Transaction History</h3>
                  <button style={{ 
                    padding: '8px 16px', 
                    backgroundColor: 'white', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>⬇️</span> Export
                  </button>
                </div>
                
                {/* Transaction Tabs */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <button style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#f3f4f6', 
                    border: 'none', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>All Transactions</button>
                  <button style={{ 
                    padding: '8px 16px', 
                    backgroundColor: 'white', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>Income</button>
                  <button style={{ 
                    padding: '8px 16px', 
                    backgroundColor: 'white', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px', 
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}>Expenses</button>
                </div>
                
                {/* Transaction Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Transaction ID</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Type</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Project</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Client</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Amount</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Method</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#111827' }}>TXN-2024-001</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#10b981' }}>↓ Payment Received</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>E-commerce Website</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>TechCorp Inc.</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#10b981', fontWeight: '500' }}>+$1,250</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Bank Transfer</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ 
                            backgroundColor: '#dcfce7', 
                            color: '#166534', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px', 
                            fontWeight: '500'
                          }}>Completed</span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Oct 21, 2025</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#111827' }}>TXN-2024-002</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#10b981' }}>↓ Payment Received</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Mobile App Design</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>StartupHub</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#10b981', fontWeight: '500' }}>+$800</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>PayPal</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ 
                            backgroundColor: '#dcfce7', 
                            color: '#166534', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px', 
                            fontWeight: '500'
                          }}>Completed</span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Oct 18, 2025</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#111827' }}>TXN-2024-003</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#ef4444' }}>↑ Withdrawal</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>-</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>-</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#ef4444', fontWeight: '500' }}>-$2,500</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Bank Transfer</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ 
                            backgroundColor: '#fef3c7', 
                            color: '#d97706', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px', 
                            fontWeight: '500'
                          }}>Processing</span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Oct 15, 2025</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#111827' }}>TXN-2024-004</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#10b981' }}>↓ Payment Received</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>SEO Campaign</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Marketing Pro</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#10b981', fontWeight: '500' }}>+$750</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Stripe</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ 
                            backgroundColor: '#dcfce7', 
                            color: '#166534', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px', 
                            fontWeight: '500'
                          }}>Completed</span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Oct 12, 2025</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#111827' }}>TXN-2024-005</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#10b981' }}>↓ Payment Received</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>WordPress Setup</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Small Biz LLC</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#10b981', fontWeight: '500' }}>+$800</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Bank Transfer</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ 
                            backgroundColor: '#dcfce7', 
                            color: '#166534', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px', 
                            fontWeight: '500'
                          }}>Completed</span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Oct 10, 2025</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#111827' }}>TXN-2024-006</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#ef4444' }}>↑ Platform Fee</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>-</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>-</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#ef4444', fontWeight: '500' }}>-$125</td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Auto-deducted</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ 
                            backgroundColor: '#dcfce7', 
                            color: '#166534', 
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px', 
                            fontWeight: '500'
                          }}>Completed</span>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6b7280' }}>Oct 10, 2025</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
        
        {currentPage === 'payments' && (
          <div style={{ padding: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827' }}>Payments</h1>
            <p style={{ color: '#6b7280' }}>Payments content coming soon...</p>
          </div>
        )}
        
        {currentPage === 'settings' && (
          <div style={{ padding: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827' }}>Settings</h1>
            <p style={{ color: '#6b7280' }}>Settings content coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseTasks;