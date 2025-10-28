import React, { useState, useEffect } from 'react';
import FreelancerSidebar from './FreelancerSidebar';
import ApplicationForm from './ApplicationForm';
import useApplyJob from '../../hooks/useApplyJob';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, TrendingUp, Clock, CheckCircle, ExternalLink, Star, Loader2 } from 'lucide-react';
import './FreelancerDashboard.css';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { showApplicationModal, selectedTask, handleApplyClick, handleCloseModal } = useApplyJob();

  useEffect(() => {
    const fetchDashboardData = async () => {


      const freelancerId = user?.freelancerId 


      if (!freelancerId) {
        setError("No freelancer ID found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:5555/api/freelancers/${freelancerId}/dashboard`);
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data.");
        }
        const data = await response.json();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="freelancer-dashboard">
        <FreelancerSidebar />
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Loader2 className="animate-spin" size={48} style={{ color: '#2F80ED' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="freelancer-dashboard">
        <FreelancerSidebar />
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <p style={{ color: '#dc3545', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#2F80ED',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="freelancer-dashboard">
        <FreelancerSidebar />
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p>No data available</p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="freelancer-dashboard">
      <FreelancerSidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <div className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="dashboard-header">
          <h1>Welcome back, {dashboardData.freelancer?.name || 'Freelancer'}!</h1>
          <p>Here's what's happening with your projects today.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#E6F0FF' }}>
              <DollarSign style={{ color: '#2F80ED' }} />
            </div>
            <div className="stat-content">
              <h3>Total Earnings</h3>
              <div className="stat-value">{formatCurrency(dashboardData.earnings)}</div>
              <div className="stat-trend">
                {dashboardData.earnings_trend?.length > 1 ?
                  `+${(((dashboardData.earnings_trend[dashboardData.earnings_trend.length - 1]?.amount || 0) /
                        (dashboardData.earnings_trend[dashboardData.earnings_trend.length - 2]?.amount || 1) - 1) * 100).toFixed(1)}% from last month` :
                  'New this month'
                }
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#FFF4E6' }}>
              <Clock style={{ color: '#FF9800' }} />
            </div>
            <div className="stat-content">
              <h3>Active Projects</h3>
              <div className="stat-value">{dashboardData.active_contracts}</div>
              <div className="stat-trend">
                {dashboardData.active_projects?.filter(p => new Date(p.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length || 0} due this week
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#E8F5E8' }}>
              <CheckCircle style={{ color: '#4CAF50' }} />
            </div>
            <div className="stat-content">
              <h3>Completed</h3>
              <div className="stat-value">{dashboardData.completed_tasks}</div>
              <div className="stat-trend">Total completed projects</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#FFF9E6' }}>
              <Star style={{ color: '#FFC107' }} />
            </div>
            <div className="stat-content">
              <h3>Rating</h3>
              <div className="stat-value">{dashboardData.freelancer?.ratings?.toFixed(1) || 'N/A'}</div>
              <div className="stat-trend">Based on {dashboardData.reviews} reviews</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="active-projects-section">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Active Projects</h2>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="card-content">
                {dashboardData.active_projects?.length > 0 ? (
                  <div className="projects-list">
                    {dashboardData.active_projects.map((project) => (
                      <div key={project.id} className="project-item">
                        <div className="project-header">
                          <div className="project-info">
                            <div className="avatar">{getInitials(project.client)}</div>
                            <div>
                              <h4>{project.title}</h4>
                              <p>{project.client} • Active Project</p>
                            </div>
                          </div>
                          <span className="status-badge progress">In Progress</span>
                        </div>
                        <div className="progress-section">
                          <div className="progress-label">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                          </div>
                        </div>
                        <div className="project-footer">
                          <span>Due: {project.due_date}</span>
                          <span>{formatCurrency(project.amount)}</span>
                          <button className="external-link">
                            <ExternalLink />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No active projects at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="earnings-section">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Earnings</h2>
              </div>
              <div className="card-content">
                <div className="earnings-amount">
                  <h2>{formatCurrency(dashboardData.earnings)}</h2>
                  <div className="trend-positive">
                    <TrendingUp size={16} />
                    {dashboardData.earnings_trend?.length > 1 ?
                      `${((dashboardData.earnings_trend[dashboardData.earnings_trend.length - 1]?.amount || 0) /
                           (dashboardData.earnings_trend[dashboardData.earnings_trend.length - 2]?.amount || 1) - 1) * 100 > 0 ? '+' : ''}${
                        (((dashboardData.earnings_trend[dashboardData.earnings_trend.length - 1]?.amount || 0) /
                          (dashboardData.earnings_trend[dashboardData.earnings_trend.length - 2]?.amount || 1) - 1) * 100).toFixed(1)}%` :
                      '0%'
                    }
                  </div>
                </div>
                <p>Available for withdrawal</p>
                <div className="earnings-breakdown">
                  {dashboardData.earnings_trend?.slice(-2).map((trend, index) => (
                    <div key={trend.month} className="breakdown-item">
                      <span>{index === 0 ? 'Last month' : 'This month'}</span>
                      <span>{formatCurrency(trend.amount)}</span>
                    </div>
                  ))}
                  <div className="breakdown-item">
                    <span>Pending</span>
                    <span>{formatCurrency(dashboardData.earnings * 0.1)}</span>
                  </div>
                </div>
                <button className="withdraw-btn">Withdraw Funds</button>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Profile Completion</h2>
              </div>
              <div className="card-content">
                <div className="profile-progress">
                  <div className="progress-label">
                    <span>85% Complete</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="profile-tips">
                  <p>Complete your profile to get more opportunities:</p>
                  <ul>
                    <li className={dashboardData.freelancer?.image ? "completed" : ""}>
                      {dashboardData.freelancer?.image ? "✓" : "○"} Add profile picture
                    </li>
                    <li className={dashboardData.freelancer?.bio ? "completed" : ""}>
                      {dashboardData.freelancer?.bio ? "✓" : "○"} Write bio
                    </li>
                    <li className="completed">✓ Add skills</li>
                    <li>○ Add portfolio samples</li>
                    <li>○ Verify identity</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="jobs-section">
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Recommended Jobs</h2>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="card-content">
                {dashboardData.recommended_jobs?.length > 0 ? (
                  <div className="jobs-list">
                    {dashboardData.recommended_jobs.map((job) => (
                      <div key={job.id} className="job-item">
                        <div className="job-header">
                          <h4>{job.title}</h4>
                          <button className="apply-btn" onClick={() => handleApplyClick(job)}>Apply Now</button>
                        </div>
                        <div className="job-skills">
                          <span className="skill-badge">View Details</span>
                        </div>
                        <div className="job-footer">
                          <span>{job.budget}</span>
                          <span>Posted {job.posted_date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No recommended jobs available at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="recommended-jobs card">
          <div className="card-header">
            <h2>Recommended Jobs</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="card-content">
            {dashboardData.recommended_jobs?.length > 0 ? (
              dashboardData.recommended_jobs.map((job) => (
                <div key={job.id} className="job-item">
                  <div className="job-header">
                    <h4>{job.title}</h4>
                    <button className="apply-btn" onClick={() => handleApplyClick(job)}>Apply Now</button>
                  </div>
                  <div className="job-skills">
                    {/* Skills would need to be fetched separately or included in API response */}
                    <span className="skill-badge">View Details</span>
                  </div>
                  <div className="job-footer">
                    <span>{job.budget}</span>
                    <span>Posted {job.posted_date}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#6B7A99', padding: '24px' }}>
                No recommended jobs available at the moment.
              </p>
            )}
          </div>
        </div>
      </div>

      <ApplicationForm
        isOpen={showApplicationModal}
        onClose={handleCloseModal}
        task={selectedTask}
        freelancerId={user?.freelancerId || 1001}
      />
    </div>
  );
};

export default FreelancerDashboard;
