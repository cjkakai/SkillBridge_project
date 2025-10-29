import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password || !formData.userType) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password, formData.userType);
      if (result.success) {
        // Redirect based on user type
        if (formData.userType === 'client') {
          navigate('/client/dashboard');
        } else if (formData.userType === 'freelancer') {
          navigate('/freelancer/dashboard');
        } else if (formData.userType === 'admin') {
          navigate('/admin/dashboard');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login here</h2>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Choose a role</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select role</option>
              <option value="admin">Admin</option>
              <option value="freelancer">Freelancer</option>
              <option value="client">Client</option>
            </select>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-links">
          <div className="link-text">
            <Link to="/forgot-password" className="login-link">
              Forgot password?
            </Link>
            <span style={{ margin: '0 20px' }}>|</span>
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
