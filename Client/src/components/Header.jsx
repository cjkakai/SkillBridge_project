import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">SkillBridge</span>
          </div>
          
          {/* Navigation */}
          <nav className="nav">
            <ul className="nav-list">
              <li><a href="#home" className="nav-link active">Home</a></li>
              <li><a href="#about" className="nav-link">About</a></li>
              <li><a href="#contact" className="nav-link">Contact Us</a></li>
            </ul>
          </nav>
          
          {/* Join Now Button */}
          <button className="btn-primary join-btn">Join Now</button>
        </div>
      </div>
    </header>
  );
};

export default Header;