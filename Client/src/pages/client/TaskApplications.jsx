import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, CheckCircle, DollarSign, Mail, Users, FileText } from 'lucide-react';
import TaskApplicationCard from './TaskApplicationCard';
import './TaskApplications.css';

const TaskApplications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskTitle, setTaskTitle] = useState('');
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState("");
  const clientId = 3; // Hardcoded for now, should come from auth context

  // Get task ID from location state
  const taskId = location.state?.taskId;

  useEffect(() => {
    if (taskId) {
      fetchApplications();
      fetchTaskDetails();
    }
  }, [taskId]);

  useEffect(() => {
    fetch(`/api/clients/${clientId}`).
    then((response)=>response.json()).
    then((data)=>{
      console.log(data)
      setClientName(data.name)
      setClientImage(data.image)
    })
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/applications`);
      if (response.ok) {
        const data = await response.json();
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
      const response = await fetch(`/api/tasks/${taskId}`);
      if (response.ok) {
        const task = await response.json();
        setTaskTitle(task.title);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>SkillBridge</h2>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/client-dashboard')}>
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
              <h1>Applications for: {taskTitle}</h1>
              <p>Review freelancer applications for this task</p>
            </div>
          </div>
          <button onClick={() => navigate('/client-dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>

        {/* Applications List */}
        <div className="applications-section">
          {loading ? (
            <p>Loading applications...</p>
          ) : applications.length > 0 ? (
            <div className="applications-container">
              <h2 className="applications-header">Applications ({applications.length})</h2>
              <div className="applications-grid">
                {applications.map((application) => (
                  <TaskApplicationCard key={application.id} application={application} />
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