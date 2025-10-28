import React from 'react';
import { Building, Briefcase, Calendar, ExternalLink } from 'lucide-react';

const FreelancerExperienceCard = ({ experience }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="experience-card">
      <div className="experience-header">
        <div className="experience-company">
          <Building size={20} className="company-icon" />
          <h3 className="company-name">{experience.company_name}</h3>
        </div>
        <div className="experience-role">
          <Briefcase size={18} className="role-icon" />
          <h4 className="role-title">{experience.role_title}</h4>
        </div>
      </div>

      <div className="experience-dates">
        <Calendar size={16} className="date-icon" />
        <span className="date-range">
          {formatDate(experience.start_date)} - {formatDate(experience.end_date)}
        </span>
      </div>

      {experience.description && (
        <div className="experience-description">
          <p>{experience.description}</p>
        </div>
      )}

      {experience.project_link && (
        <div className="experience-project-link">
          <ExternalLink size={16} className="link-icon" />
          <a
            href={experience.project_link}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
          >
            View Project
          </a>
        </div>
      )}
    </div>
  );
};

export default FreelancerExperienceCard;