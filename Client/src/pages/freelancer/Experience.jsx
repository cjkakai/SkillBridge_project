import React, { useState, useEffect } from 'react';
import FreelancerSidebar from './FreelancerSidebar';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Plus, Edit, Trash2, Calendar, Building, Link as LinkIcon } from 'lucide-react';
import './Experience.css';

const Experience = () => {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    role_title: '',
    start_date: '',
    end_date: '',
    description: '',
    project_link: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchExperiences();
    }
  }, [user?.id]);

  const fetchExperiences = async () => {
    try {
      const response = await fetch(`/api/freelancers/${user?.id}/experience`);
      if (response.ok) {
        const data = await response.json();
        setExperiences(data);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingExperience
        ? `/api/freelancers/${user?.id}/experience/${editingExperience.experience_id}`
        : `/api/freelancers/${user?.id}/experience`;

      const method = editingExperience ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchExperiences();
        resetForm();
        alert(editingExperience ? 'Experience updated successfully!' : 'Experience added successfully!');
      } else {
        const error = await response.json();
        alert(`Failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving experience:', error);
      alert('Error saving experience');
    }
  };

  const handleEdit = (experience) => {
    setEditingExperience(experience);
    setFormData({
      company_name: experience.company_name || '',
      role_title: experience.role_title || '',
      start_date: experience.start_date ? experience.start_date.split('T')[0] : '',
      end_date: experience.end_date ? experience.end_date.split('T')[0] : '',
      description: experience.description || '',
      project_link: experience.project_link || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (experienceId) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;

    try {
      const response = await fetch(`/api/freelancers/${user?.id}/experience/${experienceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchExperiences();
        alert('Experience deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Error deleting experience');
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      role_title: '',
      start_date: '',
      end_date: '',
      description: '',
      project_link: ''
    });
    setEditingExperience(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="experience-container">
        <FreelancerSidebar />
        <div className="experience-content">
          <div className="loading">Loading experiences...</div>
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
            <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>My Experience</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>Manage your professional experience</p>
          </div>
        </div>

        <div style={{ padding: '32px' }}>
          <div className="experience-header">
            <button
              onClick={() => setShowForm(true)}
              className="add-experience-btn"
            >
              <Plus size={16} style={{ marginRight: '8px' }} />
              Add Experience
            </button>
          </div>

          {showForm && (
            <div className="experience-form-container">
              <div className="experience-form-card">
                <h2>{editingExperience ? 'Edit Experience' : 'Add New Experience'}</h2>
                <form onSubmit={handleSubmit} className="experience-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Tech Corp"
                      />
                    </div>
                    <div className="form-group">
                      <label>Role Title</label>
                      <input
                        type="text"
                        name="role_title"
                        value={formData.role_title}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Senior Developer"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date (leave empty if current)</label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Describe your responsibilities and achievements..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Project Link (optional)</label>
                    <input
                      type="url"
                      name="project_link"
                      value={formData.project_link}
                      onChange={handleInputChange}
                      placeholder="https://github.com/project"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="save-btn">
                      {editingExperience ? 'Update Experience' : 'Add Experience'}
                    </button>
                    <button type="button" onClick={resetForm} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="experiences-list">
            {experiences.length === 0 ? (
              <div className="no-experiences">
                <Briefcase size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
                <h3>No experiences added yet</h3>
                <p>Start building your professional profile by adding your work experience.</p>
              </div>
            ) : (
              experiences.map((experience) => (
                <div key={experience.experience_id} className="experience-card">
                  <div className="experience-header">
                    <div className="experience-title">
                      <h3>{experience.role_title}</h3>
                      <div className="company-info">
                        <Building size={16} style={{ marginRight: '4px' }} />
                        <span>{experience.company_name}</span>
                      </div>
                    </div>
                    <div className="experience-actions">
                      <button
                        onClick={() => handleEdit(experience)}
                        className="edit-btn"
                        title="Edit experience"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(experience.experience_id)}
                        className="delete-btn"
                        title="Delete experience"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="experience-dates">
                    <Calendar size={14} style={{ marginRight: '4px' }} />
                    <span>
                      {new Date(experience.start_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      })} - {
                        experience.end_date
                          ? new Date(experience.end_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short'
                            })
                          : 'Present'
                      }
                    </span>
                  </div>

                  <div className="experience-description">
                    <p>{experience.description}</p>
                  </div>

                  {experience.project_link && (
                    <div className="experience-link">
                      <LinkIcon size={14} style={{ marginRight: '4px' }} />
                      <a
                        href={experience.project_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Project
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;