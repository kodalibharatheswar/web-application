/**
 * Navbar Component
 * Exact match to original Thymeleaf navbar.html fragment
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import cartService from '../../services/cartService';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Categories matching original
  const categories = [
    'Sarees', 'Lehengas', 'Kurtis', 'Long Frocks', 'Mom & Me', 
    'Crop Top – Skirts', 'Handlooms', 'Casual Frocks', 
    'Ready To Wear', 'Dupattas', 'Kids wear', 'Dress Material', 
    'Blouses', 'Fabrics'
  ];

  useEffect(() => {
    // Get user from localStorage
    const currentUser = authService.getUser();
    setUser(currentUser);

    // Fetch cart count if user is logged in
    if (currentUser && currentUser.role === 'CUSTOMER') {
      fetchCartCount();
    }
  }, []);

  const fetchCartCount = async () => {
    try {
      const cartData = await cartService.getCart();
      setCartCount(cartData.itemCount || 0);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/products?keyword=${searchKeyword}`);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="navbar-top">
        <div className="container">
          <div className="navbar-brand">
            <Link to="/">
              <h2>Anvi Studio</h2>
            </Link>
          </div>

          {/* Search Bar */}
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="form-control"
              placeholder="Search for products..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button type="submit" className="btn-search">
              <i className="fas fa-search"></i>
            </button>
          </form>

          {/* Right Side Icons */}
          <div className="navbar-icons">
            {user ? (
              <>
                {/* My Account Dropdown */}
                <div className="dropdown">
                  <button className="btn-icon dropdown-toggle">
                    <i className="fas fa-user"></i>
                    <span>My Account</span>
                  </button>
                  <div className="dropdown-menu">
                    {user.role === 'CUSTOMER' && (
                      <>
                        <Link to="/customer/profile" className="dropdown-item">
                          <i className="fas fa-user-circle"></i> Profile
                        </Link>
                        <Link to="/customer/orders" className="dropdown-item">
                          <i className="fas fa-box"></i> My Orders
                        </Link>
                        <Link to="/customer/addresses" className="dropdown-item">
                          <i className="fas fa-map-marker-alt"></i> Addresses
                        </Link>
                        <Link to="/customer/coupons" className="dropdown-item">
                          <i className="fas fa-ticket-alt"></i> Coupons
                        </Link>
                        <Link to="/customer/gift-cards" className="dropdown-item">
                          <i className="fas fa-gift"></i> Gift Cards
                        </Link>
                        <div className="dropdown-divider"></div>
                      </>
                    )}
                    {user.role === 'ADMIN' && (
                      <>
                        <Link to="/admin/dashboard" className="dropdown-item">
                          <i className="fas fa-tachometer-alt"></i> Dashboard
                        </Link>
                        <Link to="/admin/orders" className="dropdown-item">
                          <i className="fas fa-shopping-bag"></i> Orders
                        </Link>
                        <Link to="/admin/reviews" className="dropdown-item">
                          <i className="fas fa-star"></i> Reviews
                        </Link>
                        <div className="dropdown-divider"></div>
                      </>
                    )}
                    <button onClick={handleLogout} className="dropdown-item">
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                </div>

                {/* Cart & Wishlist for Customers */}
                {user.role === 'CUSTOMER' && (
                  <>
                    <Link to="/wishlist" className="btn-icon">
                      <i className="fas fa-heart"></i>
                      <span>Wishlist</span>
                    </Link>
                    <Link to="/cart" className="btn-icon cart-icon">
                      <i className="fas fa-shopping-cart"></i>
                      <span>Cart</span>
                      {cartCount > 0 && (
                        <span className="badge badge-cart">{cartCount}</span>
                      )}
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="btn-icon">
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Login</span>
                </Link>
                <Link to="/register" className="btn-icon">
                  <i className="fas fa-user-plus"></i>
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </nav>

      {/* Bottom Navbar - Categories */}
      <nav className={`navbar-bottom ${showMobileMenu ? 'show' : ''}`}>
        <div className="container">
          <ul className="navbar-menu">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li className="dropdown">
              <button className="dropdown-toggle">
                Shop <i className="fas fa-chevron-down"></i>
              </button>
              <div className="dropdown-menu mega-menu">
                <div className="mega-menu-grid">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      to={`/products?category=${category}`}
                      className="mega-menu-item"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;