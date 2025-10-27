import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="back-btn">← Back to Selection</button>
      </div>
      <div className="header-right">
        <input className="search" placeholder="Search..." />
        <div className="profile">AU</div>
      </div>
    </header>
  );
};

export default Header;