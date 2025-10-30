import React from "react";
import Navbar from "../components/Navbar";
import AvailableJobs from "../components/AvailableJobs";
import "./HomePage.css";

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
          <img src="/image.png" alt="Freelancer working" />
        </div>
      </section>

      <AvailableJobs />
    </div>
  );
};

export default HomePage;
