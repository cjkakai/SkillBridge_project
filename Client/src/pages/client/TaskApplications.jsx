import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, CheckCircle, DollarSign, Mail, Users, FileText, Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/auth/LogoutButton';
import TaskApplicationCard from './TaskApplicationCard';
import { BASE_URL } from '../../config';
import './TaskApplications.css';

const TaskApplications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskTitle, setTaskTitle] = useState('');
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState("");
  const [maxBudget, setMaxBudget] = useState('');
  const clientId = user?.id;
  const taskId = location.state?.taskId;


  useEffect(() => {
    if (taskId) {
      fetchApplications();
      fetchTaskDetails();
    }
  }, [taskId]);

  useEffect(() => {
    // Filter applications based on max budget
    if (maxBudget === '' || maxBudget === '0') {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter(app =>
        parseFloat(app.bid_amount) <= parseFloat(maxBudget)
      );
      setFilteredApplications(filtered);
    }
  }, [applications, maxBudget]);

  useEffect(() => {
    if (user?.id) {
      fetch(`${BASE_URL}/api/clients/${clientId}`).
      then((response)=>response.json()).
      then((data)=>{
        console.log(data)
        setClientName(data.name)
        setClientImage(data.image)
      })
    }
  }, [user?.id])

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/tasks/${taskId}/applications`);
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskDetails = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/tasks/${taskId}`);
      if (response.ok) {
        const task = await response.json();
        setTaskTitle(task.title);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
    }
  };

  const handleViewExperience = (freelancerId) => {
    // Navigate to freelancer experience page
    navigate(`/freelancer-experience/${freelancerId}`);
  };

  const handleRejectBid = async (applicationId) => {
    // Find the current application to check its status
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    const newStatus = application.status === 'rejected' ? 'pending' : 'rejected';

    try {
      const response = await fetch(`${BASE_URL}/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Refresh applications list
        fetchApplications();
      } else {
        console.error('Failed to update bid status');
      }
    } catch (error) {
      console.error('Error updating bid status:', error);
    }
  };

  const handleAwardContract = (freelancerId) => {
    // Navigate to award contract form with taskId and freelancerId
      navigate(`/award-contract/${taskId}/${freelancerId}`);
  };

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
          <div className="nav-item" onClick={() => navigate('/client-contracts')}>
            <Briefcase size={20} />
            <span>My Contracts</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-messages')}>
            <MessageSquare size={20} />
            <span>Messages</span>
          </div>
          <div className="nav-item" onClick={()=> navigate('/post-task')}>
            <Plus size={20} />
            <span>Post a Job</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-profile')}>
            <User size={20} />
            <span>Your Profile</span>
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
              src={clientImage ? `${clientImage}` : 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg'}
              alt="Client profile"
              className="welcome-profile-image"
              onError={(e) => {
                e.target.src = 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg';
              }}
            />
            <div className="welcome-content">
              <h1>Applications for: {taskTitle}</h1>
              <p>Review freelancer applications for this task</p>
            </div>
          </div>
          <button onClick={() => navigate('/client/dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>

        {/* Applications List */}
        <div className="applications-section">
          {loading ? (
            <p>Loading applications...</p>
          ) : applications.length > 0 ? (
            <div className="applications-container">
              <h2 className="applications-header">Applications ({filteredApplications.length})</h2>

              {/* Search Bar */}
              <div className="search-container">
                <div className="search-input-wrapper">
                  <Search size={20} className="search-icon" />
                  <input
                    type="number"
                    placeholder="Filter by max budget (ksh)"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="budget-search-input"
                    min="0"
                    step="0.01"
                  />
                  {maxBudget && (
                    <button
                      onClick={() => setMaxBudget('')}
                      className="clear-search-btn"
                      title="Clear filter"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <div className="applications-grid">
                {filteredApplications.map((application) => (
                  <TaskApplicationCard
                    key={application.id}
                    application={application}
                    onViewExperience={handleViewExperience}
                    onRejectBid={handleRejectBid}
                    onAwardContract={handleAwardContract}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p>No applications found for this task.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskApplications;