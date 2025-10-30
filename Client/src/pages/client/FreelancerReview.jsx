import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, ArrowLeft, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/auth/LogoutButton';
import './ClientDashboard.css';
import './ClientContracts.css';

const FreelancerReview = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState("");
  const clientId = user?.id;

  useEffect(() => {
    if (user?.id) {
      fetchContract();
      fetchExistingReview();
      fetchClientData();
    }
  }, [contractId, user?.id]);

  const fetchClientData = () => {
    fetch(`/api/clients/${clientId}`)
      .then((response) => response.json())
      .then((data) => {
        setClientName(data.name);
        setClientImage(data.image);
      });
  };

  const fetchContract = async () => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`);
      if (response.ok) {
        const data = await response.json();
        setContract(data);
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
    }
  };

  const fetchExistingReview = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}/contracts/${contractId}/review`);
      if (response.ok) {
        const review = await response.json();
        setExistingReview(review);
      }
    } catch (error) {
      console.error('Error fetching review:', error);
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    rating: Yup.number()
      .min(0, 'Rating must be at least 0')
      .max(5, 'Rating must be at most 5')
      .required('Rating is required'),
    comment: Yup.string()
      .max(500, 'Comment must be 500 characters or less')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const method = existingReview ? 'PUT' : 'POST';
      const response = await fetch(`/api/clients/${clientId}/contracts/${contractId}/review`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        alert(`Review ${existingReview ? 'updated' : 'submitted'} successfully!`);
        navigate('/client-contracts');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to ${existingReview ? 'update' : 'submit'} review: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error ${existingReview ? 'updating' : 'submitting'} review: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={interactive ? 24 : 20}
          fill={i <= rating ? '#FFD700' : 'none'}
          color={i <= rating ? '#FFD700' : '#E0E0E0'}
          style={interactive ? { cursor: 'pointer' } : {}}
          onClick={interactive ? () => onRatingChange && onRatingChange(i) : undefined}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>SkillBridge</h2>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/client/dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div className="nav-item active">
            <Briefcase size={20} />
            <span>My Contracts</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-messages')}>
            <MessageSquare size={20} />
            <span>Messages</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/post-task')}>
            <Plus size={20} />
            <span>Post a Job</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-payment')}>
            <CreditCard size={20} />
            <span>Payments</span>
          </div>
          <LogoutButton />
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <div className="welcome-section">
            <img
              src={clientImage || 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg'}
              alt="Client profile"
              className="welcome-profile-image"
            />
            <div className="welcome-content">
              <h1>Review Freelancer</h1>
              <p>Share your experience with {contract?.freelancer?.name}</p>
            </div>
          </div>
          <button className="back-btn" onClick={() => navigate('/client-contracts')}>
            <ArrowLeft size={20} />
            Back to Contracts
          </button>
        </div>

        {contract && (
          <div className="review-form-container">
            {/* Contract Summary */}
            <div className="contract-card">
              <h3>Contract Summary</h3>
              <div className="contract-summary">
                <p><strong>Contract Code:</strong> {contract.contract_code}</p>
                <p><strong>Task:</strong> {contract.task?.title}</p>
                <p><strong>Freelancer:</strong> {contract.freelancer?.name}</p>
                <p><strong>Status:</strong> {contract.status}</p>
              </div>
            </div>

            {/* Existing Review Display */}
            {existingReview && (
              <div className="contract-card">
                <h3>Your Current Review</h3>
                <div className="existing-review">
                  <div className="rating-display">
                    <span>Rating: </span>
                    {renderStars(existingReview.rating)}
                    <span>({existingReview.rating}/5)</span>
                  </div>
                  {existingReview.comment && (
                    <div className="review-comment">
                      <strong>Comment:</strong>
                      <p>{existingReview.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Review Form */}
            <div className="contract-card">
              <h3>{existingReview ? 'Update Your Review' : 'Write a Review'}</h3>
              <Formik
                initialValues={{
                  rating: existingReview?.rating || 0,
                  comment: existingReview?.comment || ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, setFieldValue, isSubmitting }) => (
                  <Form className="review-form">
                    <div className="form-group">
                      <label htmlFor="rating">Rating (0-5)</label>
                      <div className="rating-input">
                        <div className="stars-interactive">
                          {renderStars(values.rating, true, (rating) => setFieldValue('rating', rating))}
                        </div>
                        <Field
                          type="number"
                          id="rating"
                          name="rating"
                          min="0"
                          max="5"
                          step="1"
                          className="rating-number-input"
                        />
                      </div>
                      <ErrorMessage name="rating" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="comment">Comment (Optional)</label>
                      <Field
                        as="textarea"
                        id="comment"
                        name="comment"
                        rows="4"
                        placeholder="Share your experience working with this freelancer..."
                      />
                      <ErrorMessage name="comment" component="div" className="error-message" />
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="save-btn"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerReview;