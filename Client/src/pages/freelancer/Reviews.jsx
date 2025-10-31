import React, { useState, useEffect } from 'react';
import FreelancerSidebar from './FreelancerSidebar';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import { Star, User, Calendar } from 'lucide-react';
import './Reviews.css';

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const freelancerId = user?.id;
        const response = await fetch(`${BASE_URL}/api/freelancers/${freelancerId}/reviews`);
        if (response.ok) {
          const data = await response.json();
          console.log(data)
          setReviews(data);
          calculateStats(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const calculateStats = (reviewsData) => {
    if (reviewsData.length === 0) return;

    const total = reviewsData.length;
    const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach(review => {
      breakdown[review.rating]++;
    });

    setStats({
      averageRating: average,
      totalReviews: total,
      ratingBreakdown: breakdown
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="reviews-container">
        <FreelancerSidebar />
        <div className="reviews-content">
          <div className="loading">Loading reviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <FreelancerSidebar />
      <div className="reviews-content" style={{ marginLeft: '280px' }}>
        <div className="reviews-header">
          <h1>My Reviews</h1>
          <p>See what clients are saying about your work</p>
        </div>

        <div className="reviews-stats">
          <div className="stats-card">
            <div className="rating-overview">
              <div className="average-rating">
                <span className="rating-number">{stats.averageRating.toFixed(1)}</span>
                <div className="rating-stars">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
                <p>{stats.totalReviews} reviews</p>
              </div>
            </div>

            <div className="rating-breakdown">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="breakdown-row">
                  <span>{rating}</span>
                  <Star size={14} className="star-filled" />
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: stats.totalReviews > 0 
                          ? `${(stats.ratingBreakdown[rating] / stats.totalReviews) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                  <span>{stats.ratingBreakdown[rating]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="client-info">
                    <div className="client-avatar">
                      {review.client?.image ? (
                        <img
                          src={review.client.image}
                          alt={review.client.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    <div>
                      <h3>{review.client?.name || 'Anonymous Client'}</h3>
                      <div className="review-rating">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="review-date">
                    <Calendar size={16} />
                    <span>{formatDate(review.created_at)}</span>
                  </div>
                </div>

                <div className="review-content">
                  <p>{review.comment}</p>
                </div>

                {review.task && (
                  <div className="review-task">
                    <span>Project: {review.task.title}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-reviews">
              <p>No reviews yet</p>
              <p>Complete your first project to start receiving reviews from clients!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;