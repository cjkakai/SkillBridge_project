import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h2>
          <span className="logo-orange">Skill</span>Bridge
        </h2>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
      </ul>

      <Link to="/login" className="join-btn">Join Now</Link>
    </nav>
  );
};

export default Navbar;
