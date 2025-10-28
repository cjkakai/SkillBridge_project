import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './LogoutButton.css';

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="nav-item logout-btn" onClick={handleLogout}>
      <LogOut size={20} />
      <span>Logout</span>
    </div>
  );
};

export default LogoutButton;