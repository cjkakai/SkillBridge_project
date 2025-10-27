import React, { useState } from 'react';
import FreelancerSidebar from './FreelancerSidebar';

const ApplicationForm = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="freelancer-dashboard">
      <FreelancerSidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <div className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="dashboard-header">
          <h1>Application Form</h1>
          <p>Apply for projects here.</p>
        </div>
        <div className="application-form-content">
          {/* Application form content goes here */}
          <p>Application form implementation pending.</p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;