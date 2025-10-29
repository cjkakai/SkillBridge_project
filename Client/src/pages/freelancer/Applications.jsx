import React, { useState, useEffect } from 'react';
import FreelancerSidebar from './FreelancerSidebar';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle, XCircle, Eye, Loader2, FileText, Calendar, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import './Applications.css';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const freelancerId = user?.freelancerId || 1017;

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

    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        if (response.ok) {
          const clientsData = await response.json();
          setClients(clientsData);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchApplications();
    fetchClients();
  }, [user]);

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
            applications.map((application) => {
              const client = clients.find(c => c.id === application.task?.client_id);
              return (
                <div key={application.id} className="application-card" style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #f3f4f6',
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.1)';
                }}>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '2px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f9fafb'
                    }}>
                      {client?.image ? (
                        <img
                          src={client.image}
                          alt={client.name || 'Client'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '18px'
                        }}>
                          {(client?.name?.charAt(0) || 'C').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                          Application #{application.id}
                        </span>
                        <span style={{
                          color: application.status === 'accepted' ? '#10b981' : application.status === 'rejected' ? '#ef4444' : '#f59e0b',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          backgroundColor: application.status === 'accepted' ? '#d1fae5' : application.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          {getStatusText(application.status)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <DollarSign size={14} style={{ color: '#6b7280' }} />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            {formatCurrency(application.bid_amount)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} style={{ color: '#6b7280' }} />
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>
                            {application.estimated_days} days
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} style={{ color: '#6b7280' }} />
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          Applied {formatDate(application.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>


                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(application.status)}
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        Application {application.status}
                      </span>
                    </div>
                    <button style={{
                      padding: '8px 16px',
                      backgroundColor: expandedCard === application.id ? '#6b7280' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = expandedCard === application.id ? '#4b5563' : '#2563eb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = expandedCard === application.id ? '#6b7280' : '#3b82f6'}
                    onClick={() => setExpandedCard(expandedCard === application.id ? null : application.id)}>
                      {expandedCard === application.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {expandedCard === application.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {expandedCard === application.id && (
                    <div style={{
                      marginTop: '20px',
                      padding: '20px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                        Application Details
                      </h4>

                      <div style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <FileText size={16} style={{ color: '#6b7280' }} />
                              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Application ID</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>#{application.id}</p>
                          </div>

                          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <Clock size={16} style={{ color: '#6b7280' }} />
                              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {getStatusIcon(application.status)}
                              <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{getStatusText(application.status)}</span>
                            </div>
                          </div>

                          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <DollarSign size={16} style={{ color: '#6b7280' }} />
                              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bid Amount</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>{formatCurrency(application.bid_amount)}</p>
                          </div>

                          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <Calendar size={16} style={{ color: '#6b7280' }} />
                              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>{application.estimated_days} days</p>
                          </div>
                        </div>

                        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <FileText size={16} style={{ color: '#6b7280' }} />
                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cover Letter</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                            {application.cover_letter_file ? (
                              <a
                                href={`/uploads/cover_letters/${application.cover_letter_file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                              >
                                View Cover Letter
                              </a>
                            ) : (
                              'No cover letter attached'
                            )}
                          </p>
                        </div>

                        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Clock size={16} style={{ color: '#6b7280' }} />
                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Application Date</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>{formatDate(application.created_at)}</p>
                        </div>

                        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <FileText size={16} style={{ color: '#6b7280' }} />
                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cover Letter</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                            {application.cover_letter_file ? (
                              <a
                                href={`/uploads/cover_letters/${application.cover_letter_file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                              >
                                View Cover Letter
                              </a>
                            ) : (
                              'No cover letter attached'
                            )}
                          </p>
                        </div>

                        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Clock size={16} style={{ color: '#6b7280' }} />
                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Application Date</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>{formatDate(application.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
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