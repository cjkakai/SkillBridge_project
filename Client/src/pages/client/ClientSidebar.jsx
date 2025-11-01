import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, User, AlertTriangle } from 'lucide-react';
import LogoutButton from '../../components/auth/LogoutButton';
import './ClientDashboard.css';

const ClientSidebar = () => {
  const navigate = useNavigate();

  return (
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
        <div className="nav-item" onClick={() => navigate('/post-task')}>
          <Plus size={20} />
          <span>Post a Job</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/client-profile')}>
          <User size={20} />
          <span>Your Profile</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/client-report')}>
          <AlertTriangle size={20} />
          <span>Report a Freelancer</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/client-payment')}>
          <CreditCard size={20} />
          <span>Payments</span>
        </div>
        <LogoutButton />
      </nav>
    </div>
  );
};

export default ClientSidebar;