import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, User, FileText, Clock, Star, Edit, Trash2, MessageCircle } from 'lucide-react';

const ContractCard = ({ contract, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const numStars = Math.round(parseFloat(rating)) || 0;
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          fill={i < numStars ? '#FFD700' : 'none'}
          color={i < numStars ? '#FFD700' : '#E0E0E0'}
        />
      );
    }
    return stars;
  };

  return (
    <div className="contract-card">
      <div className="contract-header">
        <div className="contract-code">
          <FileText size={20} />
          <span>Code: {contract.contract_code}</span>
        </div>
        <div className="contract-status">
          <span className={`status-badge ${contract.status?.toLowerCase() || 'active'}`}>
            {contract.status || 'Active'}
          </span>
        </div>
      </div>

      <div className="contract-task">
        <h4>Task Details</h4>
        <div className="task-info">
          <h5>{contract.task?.title}</h5>
          <p>{contract.task?.description}</p>
          <div className="task-deadline">
            <Clock size={16} />
            <span>Deadline: {contract.task?.deadline ? formatDate(contract.task.deadline) : 'Not set'}</span>
          </div>
        </div>
      </div>

      <div className="contract-freelancer">
        <div className="freelancer-avatar">
          <img
            src={contract.freelancer?.image || '/default-avatar.png'}
            alt={`${contract.freelancer?.name} avatar`}
          />
        </div>
        <div className="freelancer-info">
          <h3>{contract.freelancer?.name}</h3>
        </div>
      </div>

      <div className="contract-details">
        <div className="detail-item">
          <DollarSign size={16} />
          <span>Agreed Amount: ${parseFloat(contract.agreed_amount).toFixed(2)}</span>
        </div>
        <div className="detail-item">
          <Calendar size={16} />
          <span>Created: {formatDate(contract.started_at)}</span>
        </div>
      </div>

      <div className="contract-contact">
        <div className="contact-item">
          <span className="contact-label">📧 Email:</span>
          <span>{contract.freelancer?.email}</span>
        </div>
        <div className="contact-item">
          <span className="contact-label">📞 Contact:</span>
          <span>{contract.freelancer?.contact}</span>
        </div>
      </div>

      <div className="contract-actions">
        <button
          className="action-btn view-btn"
          onClick={() => navigate(`/contract-details/${contract.id}`)}
          title="View Details"
        >
          <FileText size={16} color="white" />
        </button>
        <button
          className="action-btn message-btn"
          onClick={() => navigate(`/client-messages`)}
          title="Message Freelancer"
        >
          <User size={16} />
        </button>
        <button
          className="action-btn review-btn"
          onClick={() => navigate(`/freelancer-review/${contract.id}`)}
          title="Review this freelancer"
        >
          <MessageCircle size={16} />
        </button>
        <button
          className="action-btn edit-btn"
          onClick={() => onEdit(contract.id)}
          title="Edit Contract"
        >
          <Edit size={16} />
        </button>
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete(contract.id)}
          title="Delete Contract"
        >
          <Trash2 size={16} color="white" />
        </button>
      </div>
    </div>
  );
};

export default ContractCard;