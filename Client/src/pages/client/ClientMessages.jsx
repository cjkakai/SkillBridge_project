import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, CheckCircle, DollarSign, Mail, User, FileText, Search, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/auth/LogoutButton';
import ClientMessageCard from './ClientMessageCard';
import { BASE_URL } from '../../config';
import './ClientDashboard.css';
import io from 'socket.io-client';

const ClientMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clientName, setClientName] = useState("");
  const [clientImage, setClientImage] = useState("");
  const [freelancersWithMessages, setFreelancersWithMessages] = useState([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const clientId = user?.id;

  useEffect(() => {
    if (user?.id) {
      fetch(`${BASE_URL}/api/clients/${clientId}`)
        .then((response) => response.json())
        .then((data) => {
          setClientName(data.name);
          setClientImage(data.image);
        });

      fetchFreelancersWithMessages();

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
    const filtered = freelancersWithMessages.filter(freelancer =>
      freelancer.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFreelancers(filtered);
  }, [freelancersWithMessages, searchTerm]);

  useEffect(() => {
    if (socket && selectedFreelancer) {
      // Join the chat room
      socket.emit('join_room', { client_id: clientId, freelancer_id: selectedFreelancer.id });

      // Listen for new messages
      socket.on('receive_message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [socket, selectedFreelancer, clientId]);

  const fetchFreelancersWithMessages = async () => {
    try {
      // Get all freelancers the client has contracts with
      const freelancersResponse = await fetch(`${BASE_URL}/api/clients/${clientId}/freelancers`);
      if (freelancersResponse.ok) {
        const freelancers = await freelancersResponse.json();

        const freelancersData = [];

        // For each freelancer, get their messages
        for (const freelancer of freelancers) {
          const freelancerId = freelancer.id;

          // Get messages for this freelancer
          const messagesResponse = await fetch(`${BASE_URL}/api/clients/${clientId}/freelancers/${freelancerId}/messages`);
          let latestMessage = null;
          let unreadCount = 0;

          if (messagesResponse.ok) {
            const messages = await messagesResponse.json();
            if (messages.length > 0) {
              // Sort messages by created_at descending to get latest
              let freelancermessages= messages.filter(message => message.sender_id === freelancerId)
              freelancermessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
              latestMessage = freelancermessages[0];

              // Count unread messages (received by client and not read)
              unreadCount = messages.filter(message =>
                message.receiver_id === clientId && message.is_read === false
              ).length;
            }
          }

          freelancersData.push({
            ...freelancer,
            latestMessage,
            unreadCount
          });
        }

        setFreelancersWithMessages(freelancersData);

        // Set first freelancer as default selected
        if (freelancersData.length > 0) {
          setSelectedFreelancer(freelancersData[0]);
          fetchMessages(freelancersData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching freelancers with messages:', error);
    }
  };

  const fetchMessages = async (freelancerId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/clients/${clientId}/freelancers/${freelancerId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleFreelancerClick = (freelancer) => {
    setSelectedFreelancer(freelancer);
    fetchMessages(freelancer.id);
    markMessagesAsRead(freelancer.id);
  };

  const markMessagesAsRead = async (freelancerId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/clients/${clientId}/freelancers/${freelancerId}/messages/mark-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update the freelancer's unread count in the local state
        setFreelancersWithMessages(prev => prev.map(freelancer =>
          freelancer.id === freelancerId
            ? { ...freelancer, unreadCount: 0 }
            : freelancer
        ));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFreelancer) return;

    try {
      const response = await fetch(`${BASE_URL}/api/clients/${clientId}/freelancers/${selectedFreelancer.id}/messages`, {
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

        // Update the freelancer's latest message in the local state
        setFreelancersWithMessages(prev => prev.map(freelancer =>
          freelancer.id === selectedFreelancer.id
            ? { ...freelancer, latestMessage: message }
            : freelancer
        ));

        // Emit message via socket
        if (socket) {
          socket.emit('send_message', {
            client_id: clientId,
            freelancer_id: selectedFreelancer.id,
            content: newMessage
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>SkillBridge</h2>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/client/dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-contracts')}>
            <Briefcase size={20} />
            <span>My Contracts</span>
          </div>
          <div className="nav-item active">
            <MessageSquare size={20} />
            <span>Messages</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/post-task')}>
            <Plus size={20} />
            <span>Post a Job</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-profile')}>
            <User size={20} />
            <span>Your Profile</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/client-payment')}>
            <CreditCard size={20} />
            <span>Payments</span>
          </div>
          <LogoutButton />
        </nav>
      </div>

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
              <h1>Messages</h1>
              <p>Communicate with your freelancers</p>
            </div>
          </div>
        </div>

        {/* Messages Content */}
        <div className="messages-section">
          <div className="messages-container" style={{ display: 'flex', gap: '0', height: '100%' }}>
            {/* Left Sidebar - Freelancers List */}
            <div className="freelancers-list" style={{ backgroundColor: 'white', width: '550px', display: 'flex', flexDirection: 'column' }}>
              <div className="search-section" style={{ padding: '10px', position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  type="text"
                  placeholder="Search freelancers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  style={{ backgroundColor: '#f0f0f0', width: '350px', padding: '10px 10px 10px 40px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
              <div className="freelancers-cards" style={{ backgroundColor: 'white', padding: '10px', flex: 1, overflowY: 'auto' }}>
                {filteredFreelancers.map((freelancer) => (
                  <ClientMessageCard
                    key={freelancer.id}
                    freelancer={freelancer}
                    latestMessage={freelancer.latestMessage}
                    unreadCount={freelancer.unreadCount}
                    onClick={() => handleFreelancerClick(freelancer)}
                    isSelected={selectedFreelancer && selectedFreelancer.id === freelancer.id}
                  />
                ))}
              </div>
            </div>

            {/* Right Content Area - Messages */}
            <div className="messages-content" style={{ backgroundColor: 'white', flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid #e0e0e0' }}>
              {selectedFreelancer && (
                <>
                  <div className="messages-header" style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '10px', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Chat with {selectedFreelancer.name}</h3>
                  </div>
                  <div className="messages-list" style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className="message-item"
                          style={{
                            backgroundColor: message.sender_id === clientId ? 'royalblue' : '#f0f0f0',
                            color: message.sender_id === clientId ? 'white' : 'black',
                            padding: '10px',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            maxWidth: '70%',
                            alignSelf: message.sender_id === clientId ? 'flex-end' : 'flex-start',
                            marginLeft: message.sender_id === clientId ? 'auto' : '0',
                            marginRight: message.sender_id === clientId ? '0' : 'auto'
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
              {!selectedFreelancer && (
                <p>No messages</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMessages;