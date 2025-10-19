import React from 'react';
import './AvailableJobs.css';

const AvailableJobs = () => {
  const jobCategories = [
    {
      id: 1,
      title: 'Graphic Design',
      icon: '🎨',
      color: '#ec4899'
    },
    {
      id: 2,
      title: 'UI-UX Design',
      icon: '🎯',
      color: '#3b82f6'
    },
    {
      id: 3,
      title: 'Report Writing',
      icon: '📊',
      color: '#8b5cf6'
    },
    {
      id: 4,
      title: 'Data Analytics',
      icon: '📈',
      color: '#06b6d4'
    },
    {
      id: 5,
      title: 'Coding',
      icon: '💻',
      color: '#10b981'
    }
  ];

  return (
    <section className="available-jobs">
      <div className="container">
        <div className="jobs-header">
          <h2 className="jobs-title">Available Jobs</h2>
        </div>
        
        <div className="jobs-grid">
          {jobCategories.map((category) => (
            <div key={category.id} className="job-card">
              <div 
                className="job-icon"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                <span className="icon-emoji">{category.icon}</span>
              </div>
              <h3 className="job-title">{category.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AvailableJobs;