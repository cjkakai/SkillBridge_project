import React from "react";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sb">
      <div className="sb-top">
        <div className="sb-logo">SkillBridge</div>
      </div>

      <nav className="sb-nav">
        <ul>
          <li className="active"><span className="icon">🏠</span> Dashboard</li>
          <li><span className="icon">👥</span> Users</li>
          <li><span className="icon">📁</span> Projects</li>
          <li><span className="icon">💳</span> Transactions</li>
          <li><span className="icon">📊</span> Analytics</li>
          <li><span className="icon">⚙️</span> Settings</li>
        </ul>
      </nav>

      <div className="sb-footer">
        <div className="avatar">AU</div>
        <div className="admin-info">
          <div className="admin-name">Admin User</div>
          <div className="admin-role">Admin</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;