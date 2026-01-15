/**
 * Wishlist Page Component
 * Exact match to original Thymeleaf wishlist.html
 * Features: Wishlist items grid, remove items, add to cart
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import ProductCard from '../components/product/ProductCard';
import './Wishlist.css';

const Wishlist = () => {
  const navigate = useNavigate();
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchWishlist();
  }, [navigate]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      // Assuming you'll create a wishlistService
      const response = await fetch('http://localhost:8080/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
      } else {
        throw new Error('Failed to fetch wishlist');
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setMessage({ type: 'error', text: 'Failed to load wishlist' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    if (!window.confirm('Remove this item from your wishlist?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });

      if (response.ok) {
        await fetchWishlist();
        setMessage({ type: 'success', text: 'Item removed from wishlist' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      setMessage({ type: 'error', text: 'Failed to remove item' });
    }
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>
            <i className="fas fa-heart"></i> My Wishlist
          </h1>
          <p className="wishlist-count">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
            <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
            {message.text}
          </div>
        )}

        {wishlistItems.length === 0 ? (
          /* Empty Wishlist State */
          <div className="empty-wishlist">
            <i className="fas fa-heart fa-4x"></i>
            <h3>Your Wishlist is Empty</h3>
            <p>Save your favorite items here to view them later.</p>
            <Link to="/products" className="btn btn-brand btn-lg">
              <i className="fas fa-shopping-bag"></i> Browse Products
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="wishlist-grid">
            {wishlistItems.map((item) => {
              const product = item.product;
              
              return (
                <div key={item.id} className="wishlist-item">
                  {/* Remove Button */}
                  <button
                    className="btn-remove-wishlist"
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    title="Remove from wishlist"
                  >
                    <i className="fas fa-times"></i>
                  </button>

                  {/* Product Card */}
                  <ProductCard product={product} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;