import React, { useState, useEffect } from 'react';
import FreelancerSidebar from './FreelancerSidebar';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Star } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const freelancerId = 1017;
        const response = await fetch(`/api/freelancers/${freelancerId}`);
        if (response.ok) {
          const data = await response.json();
          setFreelancer(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-container">
        <FreelancerSidebar />
        <div className="profile-content">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="freelancer-dashboard">
      <FreelancerSidebar />
      <div className="dashboard-content">
        <div style={{ backgroundColor: 'white', padding: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>My Profile</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>Manage your professional information</p>
          </div>
        </div>

        <div style={{ padding: '32px' }}>
          <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <User size={48} />
            </div>
            <button className="edit-avatar-btn">Change Photo</button>
          </div>

          <div className="profile-info">
            <div className="info-section">
              <h2>Personal Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <User className="info-icon" size={20} />
                  <div>
                    <label>Full Name</label>
                    <p>{freelancer?.name || 'Not provided'}</p>
                  </div>
                </div>
                <div className="info-item">
                  <Mail className="info-icon" size={20} />
                  <div>
                    <label>Email</label>
                    <p>{freelancer?.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="info-item">
                  <Phone className="info-icon" size={20} />
                  <div>
                    <label>Contact</label>
                    <p>{freelancer?.contact || 'Not provided'}</p>
                  </div>
                </div>
                <div className="info-item">
                  <User className="info-icon" size={20} />
                  <div>
                    <label>Profile Image</label>
                    <p>{freelancer?.image ? 'Uploaded' : 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h2>Professional Details</h2>
              <div className="info-grid">
                <div className="info-item">
                  <Star className="info-icon" size={20} />
                  <div>
                    <label>Ratings</label>
                    <p>{freelancer?.ratings ? `${freelancer.ratings}/5.0` : 'No ratings yet'}</p>
                  </div>
                </div>
                <div className="info-item">
                  <Calendar className="info-icon" size={20} />
                  <div>
                    <label>Member Since</label>
                    <p>{freelancer?.created_at ? new Date(freelancer.created_at).getFullYear() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h2>Bio</h2>
              <p className="bio-text">
                {freelancer?.bio || 'No bio provided yet. Add a professional summary to attract more clients.'}
              </p>
            </div>

            <div className="profile-actions">
              <button className="edit-btn">Edit Profile</button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;