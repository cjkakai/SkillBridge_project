import React from "react";
import "./HomePage.css";
import Navbar from "../components/Navbar";

import heroImg from "../assets/hero-illustration.png";
import dataIcon from "../assets/data-analytics-icon.png";
import graphicIcon from "../assets/graphic-design.png";
import uiuxIcon from "../assets/uiux-design.png";
import reportIcon from "../assets/report-writing.png";
import codeIcon from "../assets/code-icon.png";

const HomePage = () => {
  return (
    <div className="homepage">
      <Navbar />

      <section className="hero-section">
        <div className="hero-content">
          <h1>
            A Platform <span className="highlight-orange">Connecting</span>{" "}
            <span className="highlight-blue">Freelancers</span> And{" "}
            <span className="highlight-blue">Clients</span>
          </h1>
          <p>
            As a client, post a task, hire skilled professionals, get it done
            fast. <br />
            As a freelancer, view tasks, make a bid, get it done and get paid.
          </p>
          <button className="get-started-btn">Get started</button>
        </div>

        <div className="hero-image">
          <img src={heroImg} alt="Freelancer working" />
          <div className="floating-box">
            <img src={dataIcon} alt="Data Analytics" />
            <p>Data Analytics</p>
          </div>
        </div>

        <svg
          className="wave"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#E6F0FF"
            d="M0,224L48,197.3C96,171,192,117,288,117.3C384,117,480,171,576,186.7C672,203,768,181,864,165.3C960,149,1056,139,1152,149.3C1248,160,1344,192,1392,208L1440,224L1440,320L0,320Z"
          ></path>
        </svg>
      </section>

      <section className="jobs-section">
        <h2>Available Jobs</h2>
        <div className="job-grid">
          <div className="job-card">
            <img src={graphicIcon} alt="Graphic Design" />
            <p>Graphic Design</p>
          </div>
          <div className="job-card">
            <img src={uiuxIcon} alt="UI-UX Design" />
            <p>UI-UX Design</p>
          </div>
          <div className="job-card">
            <img src={reportIcon} alt="Report Writing" />
            <p>Report Writing</p>
          </div>
          <div className="job-card">
            <img src={codeIcon} alt="Many more" />
            <p>Many more</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
