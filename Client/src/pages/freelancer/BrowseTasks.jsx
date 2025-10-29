import React, { useState, useEffect } from 'react';
import FreelancerSidebar from './FreelancerSidebar';
import ApplicationForm from './ApplicationForm';
import useApplyJob from '../../hooks/useApplyJob';
import { useAuth } from '../../context/AuthContext';

const BrowseTasks = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [jobTab, setJobTab] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [clients, setClients] = useState([]);
  const { showApplicationModal, selectedTask, handleApplyClick, handleCloseModal } = useApplyJob();

  const freelancerId = user?.id;

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };



  useEffect(() => {
    fetchTasks();
    fetchClients();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, budgetFilter]);

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const tasksData = await response.json();
        console.log('Tasks data:', tasksData);
        setTasks(tasksData);
        setFilteredTasks(tasksData);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const clientsData = await response.json();
        setClients(clientsData);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Filter by search term (title)
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by budget range
    if (budgetFilter) {
      filtered = filtered.filter(task => {
        const minBudget = task.budget_min || 0;
        const maxBudget = task.budget_max || 0;
        const avgBudget = (minBudget + maxBudget) / 2;

        switch (budgetFilter) {
          case 'under-500':
            return avgBudget < 500;
          case '500-1000':
            return avgBudget >= 500 && avgBudget <= 1000;
          case '1000-5000':
            return avgBudget >= 1000 && avgBudget <= 5000;
          case 'over-5000':
            return avgBudget > 5000;
          default:
            return true;
        }
      });
    }

    setFilteredTasks(filtered);
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };




  return (
    <div className="freelancer-dashboard">
      <FreelancerSidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <div className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
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
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', minWidth: '300px', flex: '1' }}>
                    <input
                      type="text"
                      placeholder="Search jobs by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 40px',
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                    />
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '16px' }}>🔍</span>
                  </div>
                  <select
                    value={budgetFilter}
                    onChange={(e) => setBudgetFilter(e.target.value)}
                    style={{ 
                      padding: '12px 16px', 
                      border: '2px solid #d1d5db', 
                      borderRadius: '8px', 
                      fontSize: '14px', 
                      minWidth: '150px', 
                      backgroundColor: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    <option value="">All Budgets</option>
                    <option value="under-500">Under $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-5000">$1,000 - $5,000</option>
                    <option value="over-5000">Over $5,000</option>
                  </select>
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
                  All Jobs ({filteredTasks.length})
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
                ) : filteredTasks.length === 0 ? (
                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <p style={{ color: '#6b7280' }}>No jobs available.</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const client = clients.find(c => c.id === task.client_id);
                    return (
                      <div key={task.id} style={{
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
                              {client?.image ? (
                                <img
                                  src={client.image}
                                  alt={client.name || 'Client'}
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
                                  {(client.image)}
                                </div>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                                {task.title || 'Untitled Task'}
                              </h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                                  {client?.name}
                                </span>
                                <span style={{
                                  color: task.status === 'open' ? '#10b981' : task.status === 'closed' ? '#ef4444' : '#6b7280',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  backgroundColor: task.status === 'open' ? '#d1fae5' : task.status === 'closed' ? '#fee2e2' : '#f3f4f6',
                                  padding: '2px 8px',
                                  borderRadius: '12px'
                                }}>
                                  {task.status}
                                </span>
                              </div>
                              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {task.description || 'No description available'}
                              </p>
                            </div>
                          </div>
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
                          </div>
                          {task.deadline && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: '#6b7280' }}>📅</span>
                              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                                {formatDate(task.deadline)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ color: '#6b7280', fontSize: '14px' }}>
                            Posted {formatDate(task.created_at)}
                          </span>
                          <button 
                            onClick={() => handleApplyClick(task)}
                            style={{ 
                              padding: '8px 24px', 
                              backgroundColor: '#3b82f6', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}>
                            Apply Now
                          </button>
                        </div>
                      </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

        <ApplicationForm
          isOpen={showApplicationModal}
          onClose={handleCloseModal}
          task={selectedTask}
          freelancerId={user?.id}
        />
      </div>
    </div>
  );
};

export default BrowseTasks;