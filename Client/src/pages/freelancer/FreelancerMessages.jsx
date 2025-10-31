import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, CheckCircle, DollarSign, Mail, User, FileText, Search, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../config';
import FreelancerSidebar from './FreelancerSidebar';
import './FreelancerDashboard.css';
import io from 'socket.io-client';

const FreelancerMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [freelancerName, setFreelancerName] = useState("");
  const [freelancerImage, setFreelancerImage] = useState("");
  const [clientsWithMessages, setClientsWithMessages] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchFreelancerData();
      fetchClientsWithMessages();

      // Initialize socket connection
      const newSocket = io(BASE_URL);
      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, [user?.id]);

  useEffect(() => {
    const filtered = clientsWithMessages.filter(client =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [clientsWithMessages, searchTerm]);

  useEffect(() => {
    if (socket && selectedClient) {
      // Join the chat room
      socket.emit('join_room', { client_id: selectedClient.id, freelancer_id: user?.id });

      // Listen for new messages
      socket.on('receive_message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, selectedClient]);

  const fetchFreelancerData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/freelancers/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setFreelancerName(data.name);
        setFreelancerImage(data.image);
      }
    } catch (error) {
      console.error('Error fetching freelancer data:', error);
    }
  };

  const fetchClientsWithMessages = async () => {
    try {
      // Get all clients the freelancer has contracts with
      const clientsResponse = await fetch(`${BASE_URL}/api/freelancers/${user?.id}/contracts`);
      if (clientsResponse.ok) {
        const contracts = await clientsResponse.json();

        const clientsData = [];

        // For each contract, get the client and their messages
        for (const contract of contracts) {
          const client = contract.client;

          // Get messages for this client
          const messagesResponse = await fetch(`${BASE_URL}/api/freelancers/${user?.id}/clients/${client.id}/messages`);
          let latestMessage = null;
          let unreadCount = 0;

          if (messagesResponse.ok) {
            const messages = await messagesResponse.json();
            if (messages.length > 0) {
              // Sort messages by created_at descending to get latest
              let clientMessages = messages.filter(message => message.sender_id === client.id);
              clientMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
              latestMessage = clientMessages[0];

              // Count unread messages (received by freelancer and not read)
              unreadCount = messages.filter(message =>
                message.receiver_id === user?.id && message.is_read === false
              ).length;
            }
          }

          clientsData.push({
            ...client,
            latestMessage,
            unreadCount
          });
        }

        setClientsWithMessages(clientsData);

        // Set first client as default selected
        if (clientsData.length > 0) {
          setSelectedClient(clientsData[0]);
          fetchMessages(clientsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching clients with messages:', error);
    }
  };

  const fetchMessages = async (clientId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/freelancers/${user?.id}/clients/${clientId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleClientClick = (client) => {
    setSelectedClient(client);
    fetchMessages(client.id);
    markMessagesAsRead(client.id);
  };

  const markMessagesAsRead = async (clientId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/freelancers/${user?.id}/clients/${clientId}/messages/mark-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update the client's unread count in the local state
        setClientsWithMessages(prev => prev.map(client =>
          client.id === clientId
            ? { ...client, unreadCount: 0 }
            : client
        ));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedClient) return;

    try {
      const response = await fetch(`${BASE_URL}/api/freelancers/${user?.id}/clients/${selectedClient.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');

        // Update the client's latest message in the local state
        setClientsWithMessages(prev => prev.map(client =>
          client.id === selectedClient.id
            ? { ...client, latestMessage: message }
            : client
        ));

        // Emit message via socket
        if (socket) {
          socket.emit('send_message', {
            client_id: selectedClient.id,
            freelancer_id: user?.id,
            content: newMessage
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="freelancer-dashboard">
      <FreelancerSidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <div className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="dashboard-header">
          <div className="welcome-section">
            <img
              src={freelancerImage ? `${freelancerImage}` : 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg'}
              alt="Freelancer profile"
              className="welcome-profile-image"
              onError={(e) => {
                e.target.src = 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg';
              }}
            />
            <div className="welcome-content">
              <h1>Messages</h1>
              <p>Communicate with your clients</p>
            </div>
          </div>
        </div>

        {/* Messages Content */}
        <div className="messages-section">
          <div className="messages-container" style={{ display: 'flex', gap: '0', height: '100%' }}>
            {/* Left Sidebar - Clients List */}
            <div className="freelancers-list" style={{ backgroundColor: 'white', width: '550px', display: 'flex', flexDirection: 'column' }}>
              <div className="search-section" style={{ padding: '10px', position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  style={{ backgroundColor: '#f0f0f0', width: '350px', padding: '10px 10px 10px 40px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
              <div className="freelancers-cards" style={{ backgroundColor: 'white', padding: '10px', flex: 1, overflowY: 'auto' }}>
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className={`client-message-card ${selectedClient && selectedClient.id === client.id ? 'selected' : ''}`}
                    onClick={() => handleClientClick(client)}
                    style={{
                      padding: '15px',
                      marginBottom: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedClient && selectedClient.id === client.id ? '#f8f9fa' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={client.image || 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg'}
                        alt={`${client.name} avatar`}
                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                      />
                      <div style={{ flex: 1, width: '400px'}}>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{client.name}</h4>
                        {client.latestMessage && (
                          <p style={{ margin: '0', fontSize: '14px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {client.latestMessage.content}
                          </p>
                        )}
                      </div>
                      {client.unreadCount > 0 && (
                        <span style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          borderRadius: '50%',
                          padding: '2px 6px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {client.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content Area - Messages */}
            <div className="messages-content" style={{ backgroundColor: 'white', flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid #e0e0e0' }}>
              {selectedClient && (
                <>
                  <div className="messages-header" style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '10px', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Chat with {selectedClient.name}</h3>
                  </div>
                  <div className="messages-list" style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className="message-item"
                          style={{
                            backgroundColor: message.sender_id === user?.id ? 'royalblue' : 'lightblue',
                            color: message.sender_id === user?.id ? 'white' : 'black',
                            padding: '10px',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            maxWidth: '70%',
                            alignSelf: message.sender_id === user?.id ? 'flex-end' : 'flex-start',
                            marginLeft: message.sender_id === user?.id ? 'auto' : '0',
                            marginRight: message.sender_id === user?.id ? '0' : 'auto'
                          }}
                        >
                          <p style={{ margin: 0 }}>{message.content}</p>
                          <small style={{ opacity: 0.7 }}>
                            {new Date(message.created_at).toLocaleString('en-KE', {
                              timeZone: 'Africa/Nairobi',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                      ))
                    ) : (
                      <p style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>No messages</p>
                    )}
                  </div>
                  <div className="message-input" style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      style={{ padding: '10px 15px', backgroundColor: 'royalblue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </>
              )}
              {!selectedClient && (
                <p>No messages</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerMessages;