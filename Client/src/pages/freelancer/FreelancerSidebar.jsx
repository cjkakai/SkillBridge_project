import React, { useState, useEffect } from 'react';
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
  Folder,
  MessageSquare,
  X,
  AlertTriangle
} from 'lucide-react';
import LogoutButton from '../../components/auth/LogoutButton';
import './FreelancerSidebar.css';

const FreelancerSidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && !isCollapsed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isCollapsed]);

  const menuItems = [
    { path: '/freelancer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/freelancer/browse-tasks', label: 'Browse Tasks', icon: Search },
    { path: '/freelancer/applications', label: 'My Applications', icon: FileText },
    { path: '/freelancer/messages', label: 'Messages', icon: MessageSquare },
    { path: '/freelancer/earnings', label: 'Earnings', icon: DollarSign },
    { path: '/freelancer/my-projects', label: 'My Projects', icon: Folder },
    { path: '/freelancer/profile', label: 'Profile', icon: User },
    { path: '/freelancer/reviews', label: 'Reviews', icon: Star },
    { path: '/freelancer-report', label: 'Report a Client', icon: AlertTriangle },
  ];

  return (
    <>
      {isMobile && !isCollapsed && (
        <div
          className="sidebar-backdrop"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
      <div className={`freelancer-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <Menu size={24} className="logo-icon" />
            {!isCollapsed && <span className="logo-text">SkillBridge</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isMobile ? <X size={18} /> : (isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />)}
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
            <LogoutButton />
          </ul>
        </nav>
      </div>
    </>
 );
};

export default FreelancerSidebar;