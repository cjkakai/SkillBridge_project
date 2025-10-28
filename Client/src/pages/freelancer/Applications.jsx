import React, { useState, useEffect } from 'react';
import FreelancerSidebar from './FreelancerSidebar';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import './Applications.css';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const freelancerId = user?.freelancerId || 1001;

      if (!freelancerId) {
        setError("No freelancer ID found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:5555/api/freelancers/${freelancerId}/applications`);
        if (!response.ok) {
          throw new Error("Failed to fetch applications.");
        }
        const data = await response.json();
        setApplications(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="status-icon pending" size={16} />;
      case 'accepted':
        return <CheckCircle className="status-icon accepted" size={16} />;
      case 'rejected':
        return <XCircle className="status-icon rejected" size={16} />;
      default:
        return <Clock className="status-icon pending" size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Under Review';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="applications-container">
        <FreelancerSidebar />
        <div className="applications-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Loader2 className="animate-spin" size={48} style={{ color: '#2F80ED' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications-container">
        <FreelancerSidebar />
        <div className="applications-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <p style={{ color: '#dc3545', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#2F80ED',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-container">
      <FreelancerSidebar />
      <div className="applications-content">
        <div className="applications-header">
          <h1>My Applications</h1>
          <p>Track the status of your job applications</p>
        </div>

        <div className="applications-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#FFF4E6' }}>
              <Clock style={{ color: '#FF9800' }} size={20} />
            </div>
            <div className="stat-content">
              <h3>Pending</h3>
              <div className="stat-value">{applications.filter(app => app.status === 'pending').length}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#E8F5E8' }}>
              <CheckCircle style={{ color: '#4CAF50' }} size={20} />
            </div>
            <div className="stat-content">
              <h3>Accepted</h3>
              <div className="stat-value">{applications.filter(app => app.status === 'accepted').length}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#FFEBEE' }}>
              <XCircle style={{ color: '#F44336' }} size={20} />
            </div>
            <div className="stat-content">
              <h3>Rejected</h3>
              <div className="stat-value">{applications.filter(app => app.status === 'rejected').length}</div>
            </div>
          </div>
        </div>

        <div className="applications-list">
          {applications.length > 0 ? (
            applications.map((application) => (
              <div key={application.id} className="application-card">
                <div className="application-header">
                  <div className="application-info">
                    <h3>{application.task?.title || 'Unknown Task'}</h3>
                    <p className="client-name">
                      Client: {application.task?.client?.name || 'Unknown Client'}
                    </p>
                  </div>
                  <div className="application-status">
                    {getStatusIcon(application.status)}
                    <span className={`status-text ${application.status}`}>
                      {getStatusText(application.status)}
                    </span>
                  </div>
                </div>

                <div className="application-details">
                  <div className="detail-row">
                    <span className="label">Bid Amount:</span>
                    <span className="value">{formatCurrency(application.bid_amount)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Estimated Days:</span>
                    <span className="value">{application.estimated_days} days</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Applied:</span>
                    <span className="value">{formatDate(application.created_at)}</span>
                  </div>
                </div>

                <div className="application-actions">
                  <button className="view-btn">
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-applications">
              <p>You haven't applied to any jobs yet.</p>
              <p>Start browsing available tasks to submit your first application!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;