import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, CheckCircle, DollarSign, Mail, Users, FileText, User } from 'lucide-react';
import TaskCard from './TaskCard';
import FreelancerCard from './FreelancerCard';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [freelancers, setFreelancers]= useState([])
  const [loading, setLoading] = useState(true);
  const[freelancerLoading, setFreelancerLoading]= useState(false)
  const[clientName, setClientName]= useState("")
  const [clientImage, setClientImage] = useState("");
  const [totalSpent, setTotalSpent] = useState(0);
  const[contractNumber, setContractNumber]= useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0);
  const clientId = 5; // Hardcoded for now, should come from auth context

  useEffect(() => {
    fetchTasks();
    fetchFreelancers();
    fetchTotalSpent();
    fetchActiveContracts();
    fetchUnreadMessages();

  }, []);
  
  useEffect(()=>{
    fetch(`/api/clients/${clientId}`).
    then((response)=>response.json()).
    then((data)=>{
      setClientName(data.name)
      setClientImage(data.image)
    })
  }, [])



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
      setFreelancers(data);
    }
    } catch(error) {
     console.error('Error Fetching your freelancers', error);
    } finally{
      setFreelancerLoading(false)
    }
  }
  
  const fetchActiveContracts = async () =>{
   try{
    const response= await fetch(`/api/clients/${clientId}/contracts`);
    if(response.ok){
      const contracts= await response.json();
      setContractNumber(contracts.length)
    }
   }catch(error){
    console.error('Error Fetching your freelancers', error);
   }
  }

  const fetchTotalSpent = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/payments`);
      if (response.ok) {
        const payments = await response.json();
        const total = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
        setTotalSpent(total);
      }
    } catch (error) {
      console.error('Error fetching total spent:', error);
    }
  }

  const fetchUnreadMessages = async () => {
    try {
      // First get all contracts for this client
      const contractsResponse = await fetch(`/api/clients/${clientId}/contracts`);
      if (contractsResponse.ok) {
        const contracts = await contractsResponse.json();

        let unreadCount = 0;

        // For each contract, get messages and filter
        for (const contract of contracts) {
          const freelancerId = contract.freelancer.id;
          const messagesResponse = await fetch(`/api/clients/${clientId}/freelancers/${freelancerId}/messages`);
          if (messagesResponse.ok) {
            const messages = await messagesResponse.json();
            // Filter messages where client is receiver (not sender) and is_read is false
            const unreadReceivedMessages = messages.filter(message =>
              message.receiver_id === clientId && message.is_read === false
            );
            unreadCount += unreadReceivedMessages.length;
          }
        }

        setUnreadMessages(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
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
              src={clientImage ? `${clientImage}` : 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg'}
              alt="Client profile"
              className="welcome-profile-image"
            />
            <div className="welcome-content">
              <h1>Welcome back,{clientName}</h1>
              <p>Here is what is going on today</p>
            </div>
          </div>
          <button onClick={() => navigate('/post-task')} className="post-job-btn">
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
            <div className="stat-number">ksh {totalSpent.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <Mail size={24} className="stat-icon orange" />
              <h3>New Messages</h3>
            </div>
            <div className="stat-number">{unreadMessages}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <Briefcase size={24} className="stat-icon blue" />
              <h3>Active Contracts</h3>
            </div>
            <div className="stat-number">{contractNumber}</div>
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
                    <FreelancerCard key={freelancer.id} freelancer={freelancer} task={null} />
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
