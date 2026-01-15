/**
 * Register Page Component
 * Exact match to original Thymeleaf register.html
 * Features: Progressive profiling, password strength meter, validation
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  
  // Form state - matching RegistrationDTO fields
  const [formData, setFormData] = useState({
    // Required fields
    firstName: '',
    lastName: '',
    username: '', // Email
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    termsAccepted: false,
    
    // Optional fields (Progressive profiling)
    preferredSize: '',
    gender: '',
    dateOfBirth: '',
    newsletterOptIn: false
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Size options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  // Gender options
  const genderOptions = ['Female', 'Male', 'Unisex', 'Prefer not to say'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

    // Update password strength when password changes
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2 || formData.firstName.length > 50) {
      newErrors.firstName = 'First name must be between 2 and 50 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2 || formData.lastName.length > 50) {
      newErrors.lastName = 'Last name must be between 2 and 50 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.username.trim()) {
      newErrors.username = 'Email is required';
    } else if (!emailRegex.test(formData.username)) {
      newErrors.username = 'Please enter a valid email address';
    }

    // Phone validation (10-15 digits)
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number (10-15 digits)';
    }

    // Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the Terms and Privacy Policy to register';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(formData);
      
      // Success - redirect to OTP verification or login
      alert(response.message || 'Registration successful! Please check your email for the OTP.');
      navigate('/login');
    } catch (err) {
      setServerError(err.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '700px' }}>
        <div className="auth-card">
          <h2 className="auth-title">Create Your Account</h2>
          <p className="auth-subtitle">Join Anvi Studio for exclusive ethnic wear</p>

          {serverError && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle"></i> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Required Section */}
            <div className="form-section">
              <h5 className="form-section-title">
                <i className="fas fa-star-of-life" style={{ fontSize: '0.5rem' }}></i> Required Information
              </h5>

              {/* Name Fields */}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-user"></i> First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && (
                      <div className="invalid-feedback">{errors.firstName}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-user"></i> Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && (
                      <div className="invalid-feedback">{errors.lastName}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-envelope"></i> Email Address
                </label>
                <input
                  type="email"
                  name="username"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  placeholder="Enter email address"
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && (
                  <div className="invalid-feedback">{errors.username}</div>
                )}
                <small className="form-text">This will be your login username</small>
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-phone"></i> Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                {errors.phoneNumber && (
                  <div className="invalid-feedback">{errors.phoneNumber}</div>
                )}
                <small className="form-text">10-15 digits, can include country code</small>
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
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
                <PasswordStrengthMeter strength={passwordStrength} />
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-lock"></i> Confirm Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
              </div>
            </div>

            {/* Optional Section - Progressive Profiling */}
            <div className="form-section">
              <h5 className="form-section-title">
                <i className="fas fa-info-circle"></i> Optional Information
                <small style={{ fontWeight: 'normal', marginLeft: '0.5rem' }}>
                  (Helps us personalize your experience)
                </small>
              </h5>

              {/* Size and Gender */}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-ruler"></i> Preferred Size
                    </label>
                    <select
                      name="preferredSize"
                      className="form-control"
                      value={formData.preferredSize}
                      onChange={handleChange}
                    >
                      <option value="">Select size (optional)</option>
                      {sizeOptions.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-venus-mars"></i> Gender
                    </label>
                    <select
                      name="gender"
                      className="form-control"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select gender (optional)</option>
                      {genderOptions.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-birthday-cake"></i> Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="form-control"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
                <small className="form-text">We'll send you birthday offers!</small>
              </div>
            </div>

            {/* Newsletter Opt-in */}
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="newsletterOptIn"
                name="newsletterOptIn"
                checked={formData.newsletterOptIn}
                onChange={handleChange}
              />
              <label htmlFor="newsletterOptIn">
                <i className="fas fa-envelope-open-text"></i> Subscribe to our newsletter for exclusive offers and updates
              </label>
            </div>

            {/* Terms and Conditions */}
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="termsAccepted"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className={errors.termsAccepted ? 'is-invalid' : ''}
              />
              <label htmlFor="termsAccepted">
                I agree to the{' '}
                <Link to="/policy/terms" target="_blank">Terms & Conditions</Link>
                {' '}and{' '}
                <Link to="/policy/privacy" target="_blank">Privacy Policy</Link>
              </label>
            </div>
            {errors.termsAccepted && (
              <div className="invalid-feedback" style={{ display: 'block' }}>
                {errors.termsAccepted}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="btn btn-brand btn-block" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i> Create Account
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;