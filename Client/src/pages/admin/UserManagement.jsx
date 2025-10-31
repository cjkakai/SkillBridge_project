import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import { BASE_URL } from '../../config';
import './UserManagement.css';

const UserManagement = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [clientsResponse, freelancersResponse] = await Promise.all([
        fetch(`${BASE_URL}/api/clients`),
        fetch(`${BASE_URL}/api/freelancers`)
      ]);

      if (clientsResponse.ok && freelancersResponse.ok) {
        const clientsData = await clientsResponse.json();
        const freelancersData = await freelancersResponse.json();
        const combinedUsers = [
          ...clientsData.map(client => ({
            ...client,
            type: 'client',
            created_at: client.created_at || client.createdAt || 'N/A',
            ratings: client.ratings || client.rating || 'N/A'
          })),
          ...freelancersData.map(freelancer => ({
            ...freelancer,
            type: 'freelancer',
            created_at: freelancer.created_at || freelancer.createdAt || 'N/A',
            ratings: freelancer.ratings || freelancer.rating || 'N/A'
          }))
        ];

        setAllUsers(combinedUsers);
        setError(null);
      } else {
        const clientsError = clientsResponse.ok ? null : await clientsResponse.text();
        const freelancersError = freelancersResponse.ok ? null : await freelancersResponse.text();
        setError(`Failed to fetch users: ${clientsError || freelancersError || 'Unknown error'}`);
      }
    } catch (err) {
      setError('Error fetching users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, type) => {
    const endpoint = type === 'client' ? `${BASE_URL}/api/clients/${userId}` : `${BASE_URL}/api/freelancers/${userId}`;
    const confirmMessage = `Are you sure you want to delete this ${type}? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      try {
        const response = await fetch(endpoint, { method: 'DELETE' });
        if (response.ok) {
          setAllUsers(allUsers.filter(user => user.id !== userId));
          alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Failed to delete ${type}: ${errorData.error || 'Unknown error'}`);
        }
      } catch (err) {
        alert(`Error deleting ${type}: ` + err.message);
      }
    }
  };

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || user.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating) => {
    if (!rating || rating === 'N/A') return 'N/A';
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }
    while (stars.length < 5) {
      stars.push('☆');
    }

    return stars.join('');
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="user-management">
      <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}>
        <div className="user-management-content">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-nav">
            <button
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Users
            </button>
            <button
              className={`filter-btn ${filterType === 'freelancer' ? 'active' : ''}`}
              onClick={() => setFilterType('freelancer')}
            >
              Freelancers
            </button>
            <button
              className={`filter-btn ${filterType === 'client' ? 'active' : ''}`}
              onClick={() => setFilterType('client')}
            >
              Clients
            </button>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Join Date</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info-cell">
                          <strong>{user.name}</strong>
                          <br />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td>{user.type.charAt(0).toUpperCase() + user.type.slice(1)}</td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>{user.type === 'freelancer' ? <span className="star-rating">{renderStars(user.ratings)}</span> : '-'}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteUser(user.id, user.type)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-users">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;