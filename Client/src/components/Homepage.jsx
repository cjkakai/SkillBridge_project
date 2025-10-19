import React from "react";
import "./Homepage.css";

function Homepage() {
  const jobCategories = [
    {
      id: 1,
      title: 'Graphic Design',
      icon: '🎨',
      color: '#ec4899'
    },
    {
      id: 2,
      title: 'UI-UX Design',
      icon: '🎯',
      color: '#3b82f6'
    },
    {
      id: 3,
      title: 'Report Writing',
      icon: '📊',
      color: '#8b5cf6'
    },
    {
      id: 4,
      title: 'Data Analytics',
      icon: '📈',
      color: '#06b6d4'
    },
    {
      id: 5,
      title: 'Coding',
      icon: '💻',
      color: '#10b981'
    }
  ];

  return (
    <div className="homepage">
      <nav className="navbar">
        <div className="logo">
          <span className="logo-main">Skill</span>
          <span className="logo-accent">Bridge</span>
        </div>
        <ul className="nav-links">
          <li>Home</li>
          <li>About</li>
          <li>Contact Us</li>
        </ul>
        <button className="join-btn">Join Now</button>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <h1>
            A Platform <span className="accent">Connecting</span> <br />
            <span className="blue">Freelancers</span> And <span className="blue">Clients</span>
          </h1>
          <p>
            As a client, post a task, hire skilled professionals, get it done fast. <br />
            As a freelancer, view tasks, make a bid, get it done and get paid.
          </p>
          <button className="get-started-btn">Get started</button>
        </div>

        <div className="hero-image">
          <img src="/image.png" alt="Freelancer working" />
        </div>
      </section>

      <section className="available-jobs">
        <h2>Available Jobs</h2>
        <div className="job-cards">
          {jobCategories.map((category) => (
            <div key={category.id} className="job-card">
              <div
                className="job-icon"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                <span className="icon-emoji">{category.icon}</span>
              </div>
              <p>{category.title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Homepage;
