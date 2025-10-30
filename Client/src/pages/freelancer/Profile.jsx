import React, { useState, useEffect } from 'react';
import FreelancerSidebar from './FreelancerSidebar';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Star, Edit, Camera } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    contact: '',
    bio: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const freelancerId = user?.id;
        const response = await fetch(`/api/freelancers/${freelancerId}`);
        if (response.ok) {
          const data = await response.json();
          setFreelancer(data);
          setEditForm({
            name: data.name || '',
            email: data.email || '',
            contact: data.contact || '',
            bio: data.bio || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: freelancer?.name || '',
      email: freelancer?.email || '',
      contact: freelancer?.contact || '',
      bio: freelancer?.bio || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`/api/freelancers/${freelancer.id}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFreelancer(prev => ({
          ...prev,
          image: data.image_url
        }));
        setImageFile(null);
        alert('Image uploaded successfully!');
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`/api/freelancers/${freelancer.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedFreelancer = await response.json();
        setFreelancer(updatedFreelancer);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Update failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

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
               {freelancer?.image ? (
                 <img src={freelancer.image} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
               ) : (
                 <User size={48} />
               )}
             </div>
             <div style={{ position: 'relative' }}>
               <input
                 type="file"
                 accept="image/*"
                 onChange={handleImageChange}
                 style={{ display: 'none' }}
                 id="image-upload"
               />
               <label htmlFor="image-upload" className="edit-avatar-btn" style={{ cursor: 'pointer' }}>
                 <Camera size={16} style={{ marginRight: '4px' }} />
                 Change Photo
               </label>
               {imageFile && (
                 <button
                   onClick={handleImageUpload}
                   disabled={uploading}
                   style={{
                     marginTop: '8px',
                     padding: '4px 8px',
                     backgroundColor: '#007bff',
                     color: 'white',
                     border: 'none',
                     borderRadius: '4px',
                     cursor: uploading ? 'not-allowed' : 'pointer'
                   }}
                 >
                   {uploading ? 'Uploading...' : 'Upload'}
                 </button>
               )}
             </div>
           </div>

          <div className="profile-info">
            <div className="info-section">
              <h2>Personal Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <User className="info-icon" size={20} />
                  <div>
                    <label>Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    ) : (
                      <p>{freelancer?.name || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <Mail className="info-icon" size={20} />
                  <div>
                    <label>Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    ) : (
                      <p>{freelancer?.email || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <Phone className="info-icon" size={20} />
                  <div>
                    <label>Contact</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="contact"
                        value={editForm.contact}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    ) : (
                      <p>{freelancer?.contact || 'Not provided'}</p>
                    )}
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
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                  placeholder="Add a professional summary to attract more clients."
                />
              ) : (
                <p className="bio-text">
                  {freelancer?.bio || 'No bio provided yet. Add a professional summary to attract more clients.'}
                </p>
              )}
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleSaveProfile}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="edit-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;