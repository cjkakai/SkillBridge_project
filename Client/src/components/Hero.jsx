import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          {/* Left Content */}
          <div className="hero-text">
            <h1 className="hero-title">
              A Platform <span className="highlight-orange">Connecting</span>
              <br />
              <span className="highlight-orange">Freelancers</span> And <span className="highlight-blue">Clients</span>
            </h1>
            
            <div className="hero-description">
              <p>As a client, post a task hire skilled professionals, get it done fast.</p>
              <p>As a freelancer, view tasks, make a bid, get it done and get paid.</p>
            </div>
            
            <button className="btn-primary get-started-btn">Get started</button>
          </div>
          
          {/* Right Content - Illustration */}
          <div className="hero-illustration">
            <div className="illustration-container">
              {/* Person working on laptop */}
              <div className="person-illustration">
                <div className="person">
                  <div className="person-head"></div>
                  <div className="person-body"></div>
                  <div className="person-arms"></div>
                </div>
                <div className="laptop">
                  <div className="laptop-screen"></div>
                  <div className="laptop-base"></div>
                </div>
                <div className="desk"></div>
              </div>
              
              {/* WiFi/Connection Icon */}
              <div className="wifi-icon">
                <div className="wifi-circle">
                  <div className="wifi-waves">
                    <div className="wave wave-1"></div>
                    <div className="wave wave-2"></div>
                    <div className="wave wave-3"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Rectangle with background image */}
            <div className="hero-rectangle"></div>
          </div>
        </div>
      </div>
      
      {/* Curved Bottom */}
      <div className="hero-curve">
        <svg viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L50 110C100 100 200 80 300 70C400 60 500 60 600 65C700 70 800 80 900 85C1000 90 1100 90 1150 90L1200 90V120H1150C1100 120 1000 120 900 120C800 120 700 120 600 120C500 120 400 120 300 120C200 120 100 120 50 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
