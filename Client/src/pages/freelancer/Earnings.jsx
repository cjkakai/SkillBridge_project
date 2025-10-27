import React, { useState } from 'react';
import FreelancerSidebar from './FreelancerSidebar';

const Earnings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="freelancer-dashboard">
      <FreelancerSidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <div className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="dashboard-header">
          <h1>Earnings</h1>
          <p>Track your earnings and payments.</p>
        </div>
        <div className="earnings-content">
          {/* Earnings content goes here */}
          <p>Earnings page implementation pending.</p>
        </div>
      </div>
    </div>
  );
};

export default Earnings;