import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, CheckCircle, DollarSign, Mail, User, FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ClientSidebar from './ClientSidebar';
import ContractCard from './ContractCard';
import { BASE_URL } from '../../config';
import './ClientDashboard.css';
import './ClientContracts.css';

const ClientContracts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const clientId = user?.id;

  const handleEditContract = (contractId) => {
    navigate(`/edit-contract/${contractId}`);
  };

  const handleDeleteContract = async (contractId) => {
    if (window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      try {
        const response = await fetch(`${BASE_URL}/api/clients/${clientId}/contracts/${contractId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchContracts();
        } else {
          console.error('Failed to delete contract');
        }
      } catch (error) {
        console.error('Error deleting contract:', error);
      }
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchContracts();
      fetchClientData();
    }
  }, [user?.id]);

  useEffect(() => {
    const filtered = contracts.filter(contract =>
      contract.freelancer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contract_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContracts(filtered);
  }, [contracts, searchTerm]);

  const fetchClientData = () => {
    fetch(`${BASE_URL}/api/clients/${clientId}`)
      .then((response) => response.json())
      .then((data) => {
        setClientName(data.name);
        setClientImage(data.image);
      });
  };

  const fetchContracts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/clients/${clientId}/contracts`);
      if (response.ok) {
        const data = await response.json();
        setContracts(data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <ClientSidebar />

      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <div className="welcome-section">
            <img
              src={clientImage ? `${clientImage}` : 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg'}
              alt="Client profile"
              className="welcome-profile-image"
              onError={(e) => {
                e.target.src = 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg';
              }}
            />
            <div className="welcome-content">
              <h1>My Contracts</h1>
              <p>Manage and track all your active contracts</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Search by freelancer name or contract code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Contracts Grid */}
        <div className="contracts-section">
          {loading ? (
            <p>Loading contracts...</p>
          ) : filteredContracts.length > 0 ? (
            <div className="contracts-grid">
              {filteredContracts.map((contract) => (
                <ContractCard key={contract.id} contract={contract} onEdit={handleEditContract} onDelete={handleDeleteContract} />
              ))}
            </div>
          ) : (
            <p>No contracts found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientContracts;