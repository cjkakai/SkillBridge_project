import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, CheckCircle, DollarSign, Mail, Users, FileText } from 'lucide-react';
import TaskCard from './TaskCard';
import FreelancerCard from './FreelancerCard';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [freelancers, setFreelancers]= useState([])
  const [loading, setLoading] = useState(true);
  const[freelancerLoading, setFreelancerLoading]= useState(false)
  const[clientName, setClientName]= useState("")
  const clientId = 1; // Hardcoded for now, should come from auth context

  useEffect(() => {
    fetchTasks();
    fetchFreelancers();
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
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFreelancers= async () =>{
   try{
    const response= await fetch(`/api/clients/${clientId}/freelancers`);
    if(response.ok) {
      const data= await response.json();
      console.log(data);
      setFreelancers(data);
    }
    } catch(error) {
     console.error('Error Fetching your freelancers', error);
    } finally{
      setFreelancerLoading(false)
    }
  }

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
              <Users size={24} className="stat-icon blue" />
              <h3>Freelancers Hired</h3>
            </div>
            <div className="stat-number">{freelancers.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <DollarSign size={24} className="stat-icon green" />
              <h3>Total Spent</h3>
            </div>
            <div className="stat-number">$12,450</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <Mail size={24} className="stat-icon orange" />
              <h3>Messages</h3>
            </div>
            <div className="stat-number">24</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <Briefcase size={24} className="stat-icon blue" />
              <h3>Active Contracts</h3>
            </div>
            <div className="stat-number">3</div>
          </div>
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

        {/* Tasks and Freelancers Side by Side */}
        <div className="content-grid">
          {/* My Tasks */}
          <div className="tasks-section">
            {loading ? (
              <p>Loading tasks...</p>
            ) : tasks.length > 0 ? (
              <div className="tasks-container">
                <h2 className="tasks-header">Your Tasks</h2>
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <p>No tasks found. Create your first task!</p>
            )}
          </div>

          {/* Your Freelancers */}
          <div className="freelancers-section">
            {freelancerLoading ? (
              <p>Loading freelancers...</p>
            ) : freelancers.length > 0 ? (
              <div className="freelancers-container">
                <h2 className="freelancers-header">Your Freelancers</h2>
                <div className="freelancers-grid">
                  {freelancers.map((freelancer) => (
                    <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                  ))}
                </div>
              </div>
            ) : (
              <p>No freelancers found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
