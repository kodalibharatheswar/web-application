/**
 * Login Page Component
 * Exact match to original Thymeleaf login.html
 * Supports dual identifier login (email OR phone)
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', // Can be email or phone
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData.username, formData.password);
      
      // Check if email is verified
      if (!response.user.verified && response.user.role === 'CUSTOMER') {
        setError('Please verify your email before logging in. Check your inbox for the OTP.');
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (response.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.error || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Login to your Anvi Studio account</p>

          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username (Email or Phone) */}
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-user"></i> Email or Phone Number
              </label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Enter email or phone number"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <small className="form-text">
                You can log in with either your email address or phone number
              </small>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-lock"></i> Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="form-group text-right">
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-brand btn-block" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Logging in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Login
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;