import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './UserManagement.css'; // Assuming you have a CSS file for styling

const UserManagement = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [clientsResponse, freelancersResponse] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/freelancers')
      ]);

      if (clientsResponse.ok && freelancersResponse.ok) {
        const clientsData = await clientsResponse.json();
        const freelancersData = await freelancersResponse.json();
        setClients(clientsData);
        setFreelancers(freelancersData);
        setError(null); // Clear any previous errors
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

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setClients(clients.filter(client => client.id !== clientId));
          alert('Client deleted successfully');
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Failed to delete client: ${errorData.error || 'Unknown error'}`);
        }
      } catch (err) {
        alert('Error deleting client: ' + err.message);
      }
    }
  };

  const handleDeleteFreelancer = async (freelancerId) => {
    if (window.confirm('Are you sure you want to delete this freelancer? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/freelancers/${freelancerId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setFreelancers(freelancers.filter(freelancer => freelancer.id !== freelancerId));
          alert('Freelancer deleted successfully');
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Failed to delete freelancer: ${errorData.error || 'Unknown error'}`);
        }
      } catch (err) {
        alert('Error deleting freelancer: ' + err.message);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="user-management">
      <h1>User Management</h1>

      <section className="clients-section">
        <h2>Clients</h2>
        {clients.length > 0 ? (
          <div className="users-grid">
            {clients.map(client => (
              <div key={client.id} className="user-card">
                <div className="user-info">
                  <h3>{client.name}</h3>
                  <p>Email: {client.email}</p>
                  <p>Contact: {client.contact}</p>
                </div>
                <div className="user-actions">
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    Delete Client
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No clients found.</p>
        )}
      </section>

      <section className="freelancers-section">
        <h2>Freelancers</h2>
        {freelancers.length > 0 ? (
          <div className="users-grid">
            {freelancers.map(freelancer => (
              <div key={freelancer.id} className="user-card">
                <div className="user-info">
                  <h3>{freelancer.name}</h3>
                  <p>Email: {freelancer.email}</p>
                  <p>Contact: {freelancer.contact}</p>
                  <p>Bio: {freelancer.bio}</p>
                </div>
                <div className="user-actions">
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteFreelancer(freelancer.id)}
                  >
                    Delete Freelancer
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No freelancers found.</p>
        )}
      </section>
    </div>
  );
};

export default UserManagement;