import React from 'react';
import { Star } from 'lucide-react';

const FreelancerCard = ({ freelancer }) => {

  const renderStars = (ratings) => {
    const stars = [];
    const numStars = Math.round(parseFloat(ratings)) || 0;
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i < numStars ? '#FFD700' : 'none'}
          color={i < numStars ? '#FFD700' : '#E0E0E0'}
        />
      );
    }
    return stars;
  };

  return (
    <div className="freelancer-card">
      <h3 className="freelancer-name">{freelancer.name}</h3>
      <img
        src={freelancer.image || '/default-avatar.png'}
        alt={`${freelancer.name} avatar`}
        className="freelancer-image"
      />
      <div className="freelancer-rating">
        Ratings {renderStars(freelancer.ratings)}
        <span className="rating-text">({freelancer.ratings || 'N/A'})</span>
      </div>
      <p className="freelancer-contact">Contact: {freelancer.contact || 'N/A'}</p>
      <p className="freelancer-email">Email: {freelancer.email || 'N/A'}</p>
      <p className="freelancer-skills">{freelancer.skills ? freelancer.skills.join(', ') : 'No skills listed'}</p>
      <button className="view-contract-btn">View Contract</button>
    </div>
  );
};

export default FreelancerCard;