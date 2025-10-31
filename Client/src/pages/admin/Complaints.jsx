import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import './Complaints.css';

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  useEffect(() => {
    if (user && user.id) {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admins/${user.id}/view-complaints`);
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = (complaintId) => {
    setResolvingComplaint(complaintId);
    setResolutionText('');
  };

  const handleSubmitResolution = async (complaintId) => {
    if (!resolutionText.trim()) {
      alert('Please enter a resolution');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/admin/complaints/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution: resolutionText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resolve complaint');
      }

      const updatedComplaint = await response.json();

      // Update the complaint in the state
      setComplaints(complaints.map(complaint =>
        complaint.id === complaintId
          ? { ...complaint, status: 'resolved', resolution: updatedComplaint.resolution, resolved_at: updatedComplaint.resolved_at }
          : complaint
      ));

      // Close the resolution form
      setResolvingComplaint(null);
      setResolutionText('');
    } catch (error) {
      console.error('Error resolving complaint:', error);
      alert('Failed to resolve complaint. Please try again.');
    }
  };

  const handleCancelResolution = () => {
    setResolvingComplaint(null);
    setResolutionText('');
  };

  const handleDeleteResolution = async (complaintId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this resolution? The complaint status will revert to open.'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/admin/complaints/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution: null,
          status: 'open',
          resolved_at: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete resolution');
      }

      const updatedComplaint = await response.json();

      // Update the complaint in the state
      setComplaints(complaints.map(complaint =>
        complaint.id === complaintId
          ? { ...complaint, status: 'open', resolution: null, resolved_at: null }
          : complaint
      ));
    } catch (error) {
      console.error('Error deleting resolution:', error);
      alert('Failed to delete resolution. Please try again.');
    }
  };

  const handleDelete = async (complaintId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this complaint? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/admins/${user.id}/complaints/${complaintId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete complaint');
      }

      // Remove the deleted complaint from the state
      setComplaints(complaints.filter(complaint => complaint.id !== complaintId));
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('Failed to delete complaint. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return '#dc3545'; // red
      case 'resolved':
        return '#28a745'; // green
      case 'pending':
        return '#ffc107'; // yellow
      default:
        return '#6c757d'; // gray
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="admin-content">
          <div className="loading">Loading complaints...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="admin-content">
          <div className="error">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="admin-content">
        <div className="complaints-container">
          <h1>Complaints Management</h1>
          <div className="complaints-grid">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="complaint-card">
                <div className="complaint-header">
                  <div className="status-badge" style={{ backgroundColor: getStatusColor(complaint.status) }}>
                    {complaint.status}
                  </div>
                  <div className="complaint-date">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="complaint-description">
                  <h3>Description</h3>
                  <p>{complaint.description}</p>
                </div>

                <div className="complaint-parties">
                  <div className="party complainant">
                    <h4>Complainant ({complaint.complainant_type})</h4>
                    {complaint.complainant ? (
                      <div className="party-info">
                        <img src={complaint.complainant.image || '/default-avatar.png'} alt={complaint.complainant.name} className="party-avatar" />
                        <div className="party-details">
                          <p className="party-name">{complaint.complainant.name}</p>
                          <p className="party-email">{complaint.complainant.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p>Complainant details not available</p>
                    )}
                  </div>

                  <div className="party respondent">
                    <h4>Respondent ({complaint.complainant_type === 'client' ? 'freelancer' : 'client'})</h4>
                    {complaint.respondent ? (
                      <div className="party-info">
                        <img src={complaint.respondent.image || '/default-avatar.png'} alt={complaint.respondent.name} className="party-avatar" />
                        <div className="party-details">
                          <p className="party-name">{complaint.respondent.name}</p>
                          <p className="party-email">{complaint.respondent.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p>Respondent details not available</p>
                    )}
                  </div>
                </div>

                <div className="complaint-actions">
                  {resolvingComplaint === complaint.id ? (
                    <div className="resolution-form">
                      <textarea
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        placeholder="Enter resolution details..."
                        rows="3"
                        className="resolution-textarea"
                      />
                      <div className="resolution-buttons">
                        <button
                          className="btn btn-submit"
                          onClick={() => handleSubmitResolution(complaint.id)}
                        >
                          Submit
                        </button>
                        <button
                          className="btn btn-cancel"
                          onClick={handleCancelResolution}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        className="btn btn-resolve"
                        onClick={() => handleResolve(complaint.id)}
                        disabled={complaint.status === 'resolved'}
                      >
                        {complaint.status === 'resolved' ? 'Resolved' : 'Resolve'}
                      </button>
                      <button className="btn btn-delete" onClick={() => handleDelete(complaint.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>

                {complaint.resolution && (
                  <div className="complaint-resolution">
                    <div className="resolution-header">
                      <h4>Resolution</h4>
                      <button
                        className="btn-delete-resolution"
                        onClick={() => handleDeleteResolution(complaint.id)}
                        title="Delete resolution"
                      >
                        ×
                      </button>
                    </div>
                    <p>{complaint.resolution}</p>
                    {complaint.resolved_at && (
                      <small>Resolved on: {new Date(complaint.resolved_at).toLocaleDateString()}</small>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;