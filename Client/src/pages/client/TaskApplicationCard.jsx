import React from 'react';
import { Star, Calendar, DollarSign, Clock, Download } from 'lucide-react';

const TaskApplicationCard = ({ application }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'rejected':
        return '#F44336';
      default:
        return '#6B7A99';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} fill="#FFD700" color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} fill="#FFD700" color="#FFD700" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} color="#E0E0E0" />);
    }

    return stars;
  };

  return (
    <div className="application-card">
      <div className="application-header">
        <div className="freelancer-info">
          <img
            src={application.freelancer.image || 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg'}
            alt="Freelancer profile"
            className="freelancer-image"
          />
          <div className="freelancer-details">
            <h3 className="freelancer-name">{application.freelancer.name}</h3>
            <div className="freelancer-rating">
              {renderStars(application.freelancer.ratings)}
              <span className="rating-text">({application.freelancer.ratings})</span>
            </div>
          </div>
        </div>
        <span
          className="application-status"
          style={{ backgroundColor: getStatusColor(application.status) }}
        >
          {application.status}
        </span>
      </div>

      <div className="freelancer-bio">
        <p>{application.freelancer.bio ? application.freelancer.bio.split(' ').slice(0, 20).join(' ') + (application.freelancer.bio.split(' ').length > 20 ? '...' : '') : 'No bio available'}</p>
      </div>

      <div className="freelancer-contact">
        <div className="contact-item">
          <span className="contact-label">Contact:</span>
          <span>{application.freelancer.contact}</span>
        </div>
        <div className="contact-item">
          <span className="contact-label">Email:</span>
          <span>{application.freelancer.email}</span>
        </div>
      </div>

      <div className="application-details">
        <div className="detail-item">
          <DollarSign size={16} className="detail-icon" />
          <span>Bid Amount: ksh {parseFloat(application.bid_amount).toFixed(2)}</span>
        </div>

        <div className="detail-item">
          <Clock size={16} className="detail-icon" />
          <span>Estimated Days: {application.estimated_days}</span>
        </div>

        <div className="detail-item">
          <Calendar size={16} className="detail-icon" />
          <span>Submitted: {formatDate(application.created_at)}</span>
        </div>
      </div>

      <div className="application-cover-letter">
        <div className="cover-letter-header">
          <h4>Cover Letter</h4>
          {application.cover_letter_file && (
            <button
              className="download-btn"
              onClick={() => window.open(`/api/applications/${application.id}/download`, '_blank')}
              title="Download Cover Letter PDF"
            >
              <Download size={16} />
              Download PDF
            </button>
          )}
        </div>
        {!application.cover_letter_file && (
          <p>No cover letter provided</p>
        )}
      </div>
    </div>
  );
};

export default TaskApplicationCard;