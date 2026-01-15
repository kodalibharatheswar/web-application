/**
 * Footer Component
 * Exact match to original Thymeleaf footer.html fragment
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await api.post('/newsletter/subscribe', { email });
      setMessage(response.data.message || 'Successfully subscribed!');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Subscription failed');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            {/* About Section */}
            <div className="footer-column">
              <h5>Anvi Studio</h5>
              <p>
                Discover the elegance of traditional ethnic wear with a modern touch. 
                We bring you premium quality sarees, lehengas, and ethnic collections 
                curated with love.
              </p>
              <div className="footer-social">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-pinterest"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-column">
              <h5>Quick Links</h5>
              <ul className="footer-links">
                <li><Link to="/products">Shop All Products</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/custom-request">Custom Requests</Link></li>
              </ul>
            </div>

            {/* Policies */}
            <div className="footer-column">
              <h5>Policies</h5>
              <ul className="footer-links">
                <li><Link to="/policy/return">Return Policy</Link></li>
                <li><Link to="/policy/shipping">Shipping Policy</Link></li>
                <li><Link to="/policy/privacy">Privacy Policy</Link></li>
                <li><Link to="/policy/terms">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="footer-column">
              <h5>Newsletter</h5>
              <p>Subscribe to get special offers and updates!</p>
              
              {message && (
                <div className="alert alert-success">{message}</div>
              )}
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}
              
              <form onSubmit={handleNewsletterSubscribe} className="newsletter-form">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-brand">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; {new Date().getFullYear()} Anvi Studio. All rights reserved.</p>
            <div className="payment-methods">
              <i className="fab fa-cc-visa"></i>
              <i className="fab fa-cc-mastercard"></i>
              <i className="fab fa-cc-amex"></i>
              <i className="fab fa-cc-paypal"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;