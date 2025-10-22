import React from 'react';
import { Calendar, DollarSign, Clock, MapPin, Tag } from 'lucide-react';

const TaskCard = ({ task }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return '#4CAF50';
      case 'in_progress':
        return '#FF9800';
      case 'completed':
        return '#2F80ED';
      default:
        return '#6B7A99';
    }
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span
          className="task-status"
          style={{ backgroundColor: getStatusColor(task.status) }}
        >
          {task.status || 'Open'}
        </span>
      </div>

      <p className="task-description">
        {task.description ? task.description.split(' ').slice(0, 15).join(' ') + (task.description.split(' ').length > 15 ? '...' : '') : 'No description available'}
      </p>

      <div className="task-details">
        <div className="detail-item">
          <DollarSign size={16} className="detail-icon" />
          <span>ksh {task.budget_min}- ksh {task.budget_max}</span>
        </div>

        <div className="detail-item">
          <Calendar size={16} className="detail-icon" />
          <span>Due: {formatDate(task.deadline)}</span>
        </div>

        <div className="detail-item">
          <Clock size={16} className="detail-icon" />
          <span>Posted: {formatDate(task.created_at)}</span>
        </div>
      </div>

      {task.skills && task.skills.length > 0 && (
        <div className="task-skills">
          <Tag size={16} className="skills-icon" />
          <div className="skills-list">
            {task.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;