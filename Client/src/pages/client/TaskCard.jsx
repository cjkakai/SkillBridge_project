import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Clock, MapPin, Tag, Users, Edit } from 'lucide-react';

const TaskCard = ({ task }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (task.status === 'in_progress' || task.status === 'completed') {
      fetchProgress();
    }
  }, [task]);

  const fetchProgress = async () => {
    try {
      // Find the contract for this task
      const contractsResponse = await fetch(`/api/contracts`);
      if (contractsResponse.ok) {
        const contracts = await contractsResponse.json();
        const contract = contracts.find(c => c.task_id === task.id);
        if (contract) {
          // Fetch milestones for this contract
          const milestonesResponse = await fetch(`/api/contracts/${contract.id}/milestones`);
          if (milestonesResponse.ok) {
            const milestones = await milestonesResponse.json();
            if (milestones.length > 0) {
              const completedWeight = milestones
                .filter(m => m.completed)
                .reduce((sum, m) => sum + parseFloat(m.weight || 0), 0);
              setProgress(Math.round(completedWeight * 100));
            } else {
              setProgress(0);
            }
          } else {
            console.error('Failed to fetch milestones:', milestonesResponse.status);
          }
        } else {
          console.log('No contract found for task:', task.id);
        }
      } else {
        console.error('Failed to fetch contracts:', contractsResponse.status);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

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
          <span>Budget: ksh {task.budget_min}- ksh {task.budget_max}</span>
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

      {(task.status === 'in_progress' || task.status === 'completed') && (
        <div className="task-progress">
          <div className="progress-label">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="task-actions">
        <button
          className="action-btn view-applications-btn"
          title="View Applications"
          onClick={() => navigate('/task-applications', { state: { taskId: task.id } })}
        >
          <Users size={16} />
        </button>
        <button className="action-btn edit-task-btn" title="Edit Task">
          <Edit size={16} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;