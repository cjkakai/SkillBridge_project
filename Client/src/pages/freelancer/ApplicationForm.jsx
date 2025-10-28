import React, { useState } from 'react';
import './ApplicationForm.css';

const ApplicationForm = ({ isOpen, onClose, task, freelancerId }) => {
  const [applicationData, setApplicationData] = useState({
    cover_letter: '',
    bid_amount: '',
    estimated_days: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setApplicationData({
      ...applicationData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/freelancers/${freelancerId}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: task.id,
          freelancer_id: freelancerId,
          cover_letter: applicationData.cover_letter,
          bid_amount: parseFloat(applicationData.bid_amount),
          estimated_days: parseInt(applicationData.estimated_days),
          status: 'pending'
        })
      });
      
      if (response.ok) {
        alert('Application submitted successfully!');
        handleClose();
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setApplicationData({ cover_letter: '', bid_amount: '', estimated_days: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Apply for Job</h2>
        <h3 className="job-title">{task?.title}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Cover Letter *</label>
            <textarea
              name="cover_letter"
              value={applicationData.cover_letter}
              onChange={handleInputChange}
              required
              rows={6}
              placeholder="Explain why you're the best fit for this job..."
              className="form-textarea"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Bid Amount ($) *</label>
            <input
              type="number"
              name="bid_amount"
              value={applicationData.bid_amount}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="Enter your bid amount"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Estimated Days *</label>
            <input
              type="number"
              name="estimated_days"
              value={applicationData.estimated_days}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="How many days to complete?"
              className="form-input"
            />
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-submit"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;