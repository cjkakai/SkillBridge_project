import React from 'react';

const ClientMessageCard = ({ freelancer, latestMessage, unreadCount, onClick, isSelected }) => {
  const truncateMessage = (message, wordLimit) => {
    if (!message) return 'No messages yet';
    const words = message.split(' ');
    if (words.length <= wordLimit) return message;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  return (
    <div className="message-card" onClick={onClick} style={{ borderRadius: '8px', padding: '10px', marginBottom: '10px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: isSelected ? 'royalblue' : 'white', color: isSelected ? 'white' : 'black', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseEnter={(e) => !isSelected && (e.target.style.backgroundColor = '#f5f5f5')} onMouseLeave={(e) => !isSelected && (e.target.style.backgroundColor = 'white')}>
      <img
        src={freelancer.image || 'https://www.shutterstock.com/image-vector/user-profile-3d-icon-avatar-600nw-2247726743.jpg'}
        alt={freelancer.name}
        className="freelancer-avatar"
        style={{ width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0, backgroundColor: 'white' }}
      />
      <div className="freelancer-info" style={{ flex: 1, backgroundColor: isSelected ? 'royalblue' : 'white', transition: 'background-color 0.3s' }}>
        <h4 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>{freelancer.name}</h4>
        <p className="latest-message-preview" style={{ margin: '5px 0', fontSize: '14px', color: isSelected ? '#e0e0e0' : '#666'}}>
          {truncateMessage(latestMessage ? latestMessage.content : null, 10)}
        </p>
      </div>
      {unreadCount > 0 && (
        <div className="unread-indicator" style={{ backgroundColor: 'orange', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '12px', flexShrink: 0 }}>
          <span className="unread-count">{unreadCount}</span>
        </div>
      )}
    </div>
  );
};

export default ClientMessageCard;