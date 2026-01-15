/**
 * Customer Profile Page Component
 * Exact match to original Thymeleaf customer_profile.html
 * Features: Personal details update, password change, email change, newsletter toggle
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';
import './CustomerProfile.css';

const CustomerProfile = () => {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    username: '', // email
    phoneNumber: '',
    preferredSize: '',
    gender: '',
    dateOfBirth: '',
    newsletterOptIn: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    otp: ''
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const genderOptions = ['Female', 'Male', 'Unisex', 'Prefer not to say'];

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/customer/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({
      ...profile,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:8080/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUpdating(false);
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('http://localhost:8080/api/customer/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordForm)
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: data.message || 'Password changed successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const error = await response.json();
        throw new Error(error || 'Failed to change password');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleEmailChangeRequest = async () => {
    if (!emailForm.newEmail) {
      setMessage({ type: 'error', text: 'Please enter new email address' });
      return;
    }

    setUpdating(true);
    try {
      // Call API to send OTP to new email
      const response = await fetch('http://localhost:8080/api/customer/request-email-change', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newEmail: emailForm.newEmail })
      });

      if (response.ok) {
        setEmailOtpSent(true);
        setMessage({ type: 'success', text: 'OTP sent to new email address. Please check your inbox.' });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send OTP');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleEmailChangeConfirm = async () => {
    if (!emailForm.otp) {
      setMessage({ type: 'error', text: 'Please enter OTP' });
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('http://localhost:8080/api/customer/confirm-email-change', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          otp: emailForm.otp
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Email changed successfully! Please login again.' });
        setShowEmailModal(false);
        setEmailForm({ newEmail: '', otp: '' });
        setEmailOtpSent(false);
        
        // Logout and redirect to login
        setTimeout(() => {
          authService.logout();
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify OTP');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="customer-profile-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-profile-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>
            <i className="fas fa-user-circle"></i> My Profile
          </h1>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
            <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
            {message.text}
          </div>
        )}

        <div className="profile-content">
          {/* Personal Details Form */}
          <div className="profile-card">
            <h3 className="card-title">
              <i className="fas fa-user"></i> Personal Information
            </h3>

            <form onSubmit={handleProfileSubmit}>
              {/* Name Fields */}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-control"
                      value={profile.firstName}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-control"
                      value={profile.lastName}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email (Read-only with change button) */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-button">
                  <input
                    type="email"
                    className="form-control"
                    value={profile.username}
                    readOnly
                  />
                  <button
                    type="button"
                    className="btn btn-outline-brand"
                    onClick={() => setShowEmailModal(true)}
                  >
                    <i className="fas fa-edit"></i> Change Email
                  </button>
                </div>
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="form-control"
                  value={profile.phoneNumber}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              {/* Optional Fields */}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">Preferred Size</label>
                    <select
                      name="preferredSize"
                      className="form-control"
                      value={profile.preferredSize || ''}
                      onChange={handleProfileChange}
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
                    <label className="form-label">Gender</label>
                    <select
                      name="gender"
                      className="form-control"
                      value={profile.gender || ''}
                      onChange={handleProfileChange}
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
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="form-control"
                  value={profile.dateOfBirth || ''}
                  onChange={handleProfileChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Newsletter Opt-in */}
              <div className="form-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="newsletterOptIn"
                    name="newsletterOptIn"
                    checked={profile.newsletterOptIn}
                    onChange={handleProfileChange}
                  />
                  <label htmlFor="newsletterOptIn">
                    <i className="fas fa-envelope-open-text"></i> Subscribe to newsletter for exclusive offers
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn btn-brand btn-lg" disabled={updating}>
                {updating ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Password Change Section */}
          <div className="profile-card">
            <h3 className="card-title">
              <i className="fas fa-lock"></i> Security Settings
            </h3>

            {!showPasswordForm ? (
              <button
                className="btn btn-outline-brand"
                onClick={() => setShowPasswordForm(true)}
              >
                <i className="fas fa-key"></i> Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordChange}>
                {/* Current Password */}
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-control"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <i className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-control"
                      value={passwordForm.newPassword}
                      onChange={(e) => {
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                        calculatePasswordStrength(e.target.value);
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <PasswordStrengthMeter strength={passwordStrength} />
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="form-actions">
                  <button type="submit" className="btn btn-brand" disabled={updating}>
                    {updating ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Changing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i> Change Password
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Email Change Modal */}
        {showEmailModal && (
          <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <i className="fas fa-envelope"></i> Change Email Address
                </h3>
                <button className="modal-close" onClick={() => setShowEmailModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                {!emailOtpSent ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">New Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={emailForm.newEmail}
                        onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                        placeholder="Enter new email address"
                      />
                    </div>
                    <button
                      className="btn btn-brand btn-block"
                      onClick={handleEmailChangeRequest}
                      disabled={updating}
                    >
                      {updating ? 'Sending OTP...' : 'Send Verification Code'}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="alert alert-info">
                      We've sent a verification code to <strong>{emailForm.newEmail}</strong>
                    </p>
                    <div className="form-group">
                      <label className="form-label">Enter OTP</label>
                      <input
                        type="text"
                        className="form-control"
                        value={emailForm.otp}
                        onChange={(e) => setEmailForm({ ...emailForm, otp: e.target.value })}
                        placeholder="Enter 6-digit code"
                        maxLength="6"
                      />
                    </div>
                    <button
                      className="btn btn-brand btn-block"
                      onClick={handleEmailChangeConfirm}
                      disabled={updating}
                    >
                      {updating ? 'Verifying...' : 'Verify & Change Email'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;