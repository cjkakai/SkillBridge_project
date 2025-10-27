import React, { useState } from 'react';
import FreelancerSidebar from './FreelancerSidebar';

const Myprojects = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="freelancer-dashboard">
      <FreelancerSidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <div className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="dashboard-header">
          <h1>My Projects</h1>
          <p>View and manage your projects.</p>
        </div>
        <div className="my-projects-content">
          {/* My projects content goes here */}
          <p>My projects page implementation pending.</p>
        </div>
      </div>
    </div>
  );
};

export default Myprojects;