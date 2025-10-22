import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, CheckCircle, DollarSign, Mail } from 'lucide-react';
import TaskCard from './TaskCard';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const[clientName, setClientName]= useState("")
  const clientId = 2; // Hardcoded for now, should come from auth context

  useEffect(() => {
    fetchTasks();
  }, []);
  
  useEffect(()=>{
    fetch(`/api/clients/${clientId}`).
    then((response)=>response.json()).
    then((data)=>{
      setClientName(data.name)
    })
  }, [])
  console.log(clientName)


  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/tasks`);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
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
          <div className="nav-item active">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div className="nav-item">
            <Briefcase size={20} />
            <span>My Contracts</span>
          </div>
          <div className="nav-item">
            <MessageSquare size={20} />
            <span>Messages</span>
          </div>
          <div className="nav-item">
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
            <h1>Welcome back,{clientName}</h1>
            <p>Here's what's happening with your projects today.</p>
          </div>
          <button className="post-job-btn">
            <Plus size={20} />
            Post a Job
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <Briefcase size={24} className="stat-icon blue" />
              <h3>Active Projects</h3>
            </div>
            <div className="stat-number">5</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <CheckCircle size={24} className="stat-icon green" />
              <h3>Completed Tasks</h3>
            </div>
            <div className="stat-number">23</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <DollarSign size={24} className="stat-icon orange" />
              <h3>Total Spent</h3>
            </div>
            <div className="stat-number">$2,450</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <Mail size={24} className="stat-icon blue" />
              <h3>Messages</h3>
            </div>
            <div className="stat-number">12</div>
          </div>
        </div>

        {/* My Tasks */}
        <div className="tasks-section">
          {loading ? (
            <p>Loading tasks...</p>
          ) : tasks.length > 0 ? (
            <div className="tasks-container">
              <h2 className="tasks-header">Your Jobs</h2>
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p>No tasks found. Create your first task!</p>
          )}
        </div>


        {/* Notifications */}
        <div className="notifications-section">
          <h2>Notifications</h2>
          <div className="notifications-list">
            <div className="notification-item">
              <p>New proposal received for your web development project</p>
              <span>2 hours ago</span>
            </div>
            <div className="notification-item">
              <p>Milestone payment released for logo design</p>
              <span>1 day ago</span>
            </div>
            <div className="notification-item">
              <p>Freelancer submitted final deliverables</p>
              <span>3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
