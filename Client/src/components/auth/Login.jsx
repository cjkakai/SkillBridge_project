import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_type: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login data:', formData);
  };


  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login here</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Value"
            />
          </div>

          <div className="form-group">
            <label className="form-label">password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Value"
            />
          </div>

          <div className="form-group">
            <label className="form-label">choose a role</label>
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select role</option>
              <option name="admin" value="admin">Admin</option>
              <option name="freelancer" value="freelancer">Freelancer</option>
              <option name="client" value="client">Client</option>
            </select>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <div className="login-links">
          <div className="link-text">
            <Link to="/forgot-password" className="login-link">
              Forgot password?
            </Link>
            <span style={{margin: '0 20px'}}>|</span>
            <span>No account? </span>
            <Link to="/role-selection" className="login-link">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;