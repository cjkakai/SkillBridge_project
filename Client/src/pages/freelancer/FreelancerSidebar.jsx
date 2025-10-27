import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Search,
  FileText,
  User,
  CreditCard,
  Star,
  Menu,
  ClipboardList,
  DollarSign,
  Folder
} from 'lucide-react';
import './FreelancerSidebar.css';

const FreelancerSidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/freelancer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/freelancer/browse-tasks', label: 'Browse Tasks', icon: Search },
    { path: '/freelancer/applications', label: 'My Applications', icon: FileText },
    { path: '/freelancer/earnings', label: 'Earnings', icon: DollarSign },
    { path: '/freelancer/my-projects', label: 'My Projects', icon: Folder },
    { path: '/freelancer/profile', label: 'Profile', icon: User },
    { path: '/freelancer/reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <div className={`freelancer-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-section">
          <Menu size={24} className="logo-icon" />
          {!isCollapsed && <span className="logo-text">SkillBridge</span>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <IconComponent size={20} className="nav-icon" />
                  {!isCollapsed && <span className="nav-label">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-avatar">A</div>
            <div className="user-details">
              <p className="user-name">Alex Johnson</p>
              <p className="user-role">Freelancer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerSidebar;