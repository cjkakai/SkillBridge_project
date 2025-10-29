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
  const [tasksLoading, setTasksLoading] = useState(false);
  const { showApplicationModal, selectedTask, handleApplyClick, handleCloseModal } = useApplyJob();

  const freelancerId = user?.freelancerId || 1001;

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };



  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id]);

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
                  ))
                )}
              </div>
            </div>

        <ApplicationForm
          isOpen={showApplicationModal}
          onClose={handleCloseModal}
          task={selectedTask}
          freelancerId={user?.freelancerId || freelancerId}
        />
      </div>
    </div>
  );
};

export default BrowseTasks;