import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="sb">
      <div className="sb-top">
        <div className="sb-logo">SkillBridge</div>
      </div>

      <nav className="sb-nav">
        <ul>
          <li className={isActive("/admin") ? "active" : ""} onClick={() => navigate("/admin")}>
            <span className="icon">🏠</span> Dashboard
          </li>
          <li className={isActive("/admin/users") ? "active" : ""} onClick={() => navigate("/admin/users")}>
            <span className="icon">👥</span> Users
          </li>
          <li className={isActive("/admin/projects") ? "active" : ""} onClick={() => navigate("/admin/projects")}>
            <span className="icon">📁</span> Projects
          </li>
          <li className={isActive("/admin/transactions") ? "active" : ""} onClick={() => navigate("/admin/transactions")}>
            <span className="icon">💳</span> Transactions
          </li>
          <li className={isActive("/admin/analytics") ? "active" : ""} onClick={() => navigate("/admin/analytics")}>
            <span className="icon">📊</span> Analytics
          </li>
          <li className={isActive("/admin/settings") ? "active" : ""} onClick={() => navigate("/admin/settings")}>
            <span className="icon">⚙️</span> Settings
          </li>
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