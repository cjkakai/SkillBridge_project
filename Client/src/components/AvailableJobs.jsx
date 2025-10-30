import React from "react";
import "./AvailableJobs.css";

const jobs = [
  { icon: "🎨", title: "Graphic Design" },
  { icon: "🧠", title: "UI-UX Design" },
  { icon: "📝", title: "Report Writing" },
  { icon: "📝", title: "Report Writing" },
  { icon: "💻", title: "Many more" },
];

const AvailableJobs = () => {
  return (
    <section className="available-jobs">
      <h2>Available Jobs</h2>
      <div className="jobs-container">
        {jobs.map((job, index) => (
          <div className="job-card" key={index}>
            <div className="job-icon">{job.icon}</div>
            <p>{job.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AvailableJobs;
