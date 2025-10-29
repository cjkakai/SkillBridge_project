import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import './UserManagement.css';

const Complaints = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/complaints');
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
        setError(null);
      } else {
        const errorData = await response.text();
        setError(`Failed to fetch complaints: ${errorData}`);
      }
    } catch (err) {
      setError('Error fetching complaints: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/complaints/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setComplaints(complaints.map(complaint =>
          complaint.id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        ));
        alert('Complaint status updated successfully');
      } else {
        const errorData = await response.json();
        alert(`Failed to update complaint: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Error updating complaint: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="user-management">
        <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}>
          <div style={{ backgroundColor: 'white', padding: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Complaints Management</h1>
              <p style={{ color: '#6b7280', margin: 0 }}>Loading complaints...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management">
        <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}>
          <div style={{ backgroundColor: 'white', padding: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Complaints Management</h1>
              <p style={{ color: '#6b7280', margin: 0 }}>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}>
        <div style={{ backgroundColor: 'white', padding: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Complaints Management</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>Review and manage user complaints</p>
          </div>
        </div>

        <div style={{ padding: '32px' }}>
          <section className="clients-section">
            <h2>Complaints</h2>
            {complaints.length > 0 ? (
              <div className="users-grid">
                {complaints.map(complaint => (
                  <div key={complaint.id} className="user-card">
                    <div className="user-info">
                      <h3>Complaint #{complaint.id}</h3>
                      <p><strong>Complainant:</strong> {complaint.complainant_id}</p>
                      <p><strong>Respondent:</strong> {complaint.respondent_id}</p>
                      <p><strong>Type:</strong> {complaint.complainant_type}</p>
                      <p><strong>Status:</strong> {complaint.status}</p>
                      <p><strong>Description:</strong> {complaint.description}</p>
                      <p><strong>Created:</strong> {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="user-actions">
                      {complaint.status === 'open' && (
                        <>
                          <button
                            className="delete-btn"
                            onClick={() => handleUpdateStatus(complaint.id, 'resolved')}
                            style={{ backgroundColor: '#28a745', marginBottom: '8px' }}
                          >
                            Mark as Resolved
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleUpdateStatus(complaint.id, 'closed')}
                            style={{ backgroundColor: '#6c757d' }}
                          >
                            Close Complaint
                          </button>
                        </>
                      )}
                      {complaint.status === 'resolved' && (
                        <button
                          className="delete-btn"
                          onClick={() => handleUpdateStatus(complaint.id, 'closed')}
                          style={{ backgroundColor: '#6c757d' }}
                        >
                          Close Complaint
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No complaints found.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Complaints;