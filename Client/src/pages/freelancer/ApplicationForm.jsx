import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ApplicationForm.css';
import { BASE_URL } from '../../config';


const ApplicationForm = ({ isOpen, onClose, task, freelancerId }) => {

   const [applicationData, setApplicationData] = useState({
     cover_letter_file: null,
     bid_amount: '',
     estimated_days: ''
   });
   const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setApplicationData({
      ...applicationData,
      [name]: type === 'file' ? files[0] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('task_id', task.id);
      formData.append('freelancer_id', freelancerId);
      formData.append('bid_amount', applicationData.bid_amount);
      formData.append('estimated_days', applicationData.estimated_days);
      if (applicationData.cover_letter_file) {
        formData.append('cover_letter_file', applicationData.cover_letter_file);
      }

      const response = await fetch(`${BASE_URL}/api/freelancers/${freelancerId}/applications/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
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
    setApplicationData({ cover_letter_file: null, bid_amount: '', estimated_days: '' });
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
             <label className="form-label">Cover Letter (PDF, DOCX) *</label>
             <input
               type="file"
               name="cover_letter_file"
               onChange={handleInputChange}
               accept=".pdf,.docx,.png,.jpg,.jpeg"
               required
               className="form-file-input"
             />
             <small className="form-hint">Upload your cover letter as a PDF or DOCX file</small>
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