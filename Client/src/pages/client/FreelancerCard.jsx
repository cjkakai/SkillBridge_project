import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';

const FreelancerCard = ({ freelancer, task }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contractId, setContractId] = useState(null);
  const [loading, setLoading] = useState(false);
  const clientId = user?.id;

  useEffect(() => {
    fetchContractId();
  }, [freelancer.id, task?.id]);

  const fetchContractId = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/clients/${clientId}/contracts`);
      if (response.ok) {
        const contracts = await response.json();
        // Find the contract for this freelancer
        // If task is provided, match both freelancer and task, otherwise just find any contract for this freelancer
        const contract = task?.id
          ? contracts.find(c => c.freelancer_id === freelancer.id && c.task_id === task.id)
          : contracts.find(c => c.freelancer_id === freelancer.id);

        if (contract) {
          setContractId(contract.id);
        }
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
    }
  };

  const handleViewContract = () => {
    if (contractId) {
      navigate(`/contract-details/${contractId}`);
    }
  };

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
        src={freelancer.image || 'https://www.shutterstock.com/image-vector/freelancer-avatar-icon-260nw-206186656.jpg'}
        alt={`${freelancer.name} avatar`}
        className="freelancer-image"
      />
      <div className="freelancer-rating">
        Ratings {renderStars(freelancer.ratings)}
        <span className="rating-text">({parseFloat(freelancer.ratings).toFixed(1) || 'N/A'})</span>
      </div>
      <p className="freelancer-contact">Contact: {freelancer.contact || 'N/A'}</p>
      <p className="freelancer-email">Email: {freelancer.email || 'N/A'}</p>
      <button
        className="view-contract-btn"
        onClick={handleViewContract}
        disabled={!contractId}
      >
        {contractId ? 'View Contract' : 'No Contract Found'}
      </button>
    </div>
  );
};

export default FreelancerCard;