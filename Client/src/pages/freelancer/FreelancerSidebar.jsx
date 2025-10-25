import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './FreelancerSidebar.css';

const FreelancerSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/freelancer/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/freelancer/browse-tasks', label: 'Browse Tasks', icon: '🔍' },
    { path: '/freelancer/applications', label: 'My Applications', icon: '📋' },
    { path: '/freelancer/profile', label: 'Profile', icon: '👤' },
    { path: '/freelancer/payments', label: 'Payments', icon: '💳' },
    { path: '/freelancer/reviews', label: 'Reviews', icon: '⭐' },
  ];

  return (
    <div className="freelancer-sidebar">
      <div className="sidebar-header">
        <h2>SkillBridge</h2>
        <p>Freelancer Panel</p>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">A</div>
          <div className="user-details">
            <p className="user-name">Alex Johnson</p>
            <p className="user-role">Freelancer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerSidebar;