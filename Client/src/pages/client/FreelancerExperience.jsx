import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, Plus, CreditCard, ArrowLeft, User } from 'lucide-react';
import FreelancerExperienceCard from './FreelancerExperienceCard';
import './FreelancerExperience.css';

const FreelancerExperience = () => {
  const navigate = useNavigate();
  const { freelancerId } = useParams();
  const [experiences, setExperiences] = useState([]);
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (freelancerId) {
      fetchFreelancer();
      fetchExperiences();
    }
  }, [freelancerId]);

  const fetchFreelancer = async () => {
    try {
      const response = await fetch(`/api/freelancers/${freelancerId}`);
      if (response.ok) {
        const data = await response.json();
        setFreelancer(data);
      }
    } catch (error) {
      console.error('Error fetching freelancer:', error);
    }
  };

  const fetchExperiences = async () => {
    try {
      const response = await fetch(`/api/freelancers/${freelancerId}/experience`);
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
          <div className="nav-item" onClick={() => navigate('/client-messages')}>
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
          <div className="nav-item">
            <CreditCard size={20} />
            <span>Payments</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="experience-header">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="freelancer-info">
            <User size={24} className="freelancer-icon" />
            <div>
              <h1>{freelancer?.name || 'Freelancer'}'s Experience</h1>
              <p>Professional background and project history</p>
            </div>
          </div>
        </div>

        <div className="experience-content">
          {loading ? (
            <p>Loading experiences...</p>
          ) : experiences.length > 0 ? (
            <div className="experiences-grid">
              {experiences.map((experience) => (
                <FreelancerExperienceCard
                  key={experience.id}
                  experience={experience}
                />
              ))}
            </div>
          ) : (
            <div className="no-experiences">
              <p>No experience records found for this freelancer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerExperience;