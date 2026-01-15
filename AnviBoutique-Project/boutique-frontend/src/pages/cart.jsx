/**
 * Cart Page Component
 * Exact match to original Thymeleaf cart.html
 * Features: Cart items list, quantity updates, remove items, cart summary, proceed to checkout
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cartService from '../services/cartService';
import authService from '../services/authService';
import SaleBadge from '../components/common/SaleBadge';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  
  const [cartData, setCartData] = useState({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCartData(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setMessage({ type: 'error', text: 'Failed to load cart' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating({ ...updating, [itemId]: true });
    try {
      await cartService.updateQuantity(itemId, newQuantity);
      await fetchCart(); // Refresh cart to get updated totals
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setMessage({ type: 'error', text: 'Failed to update quantity' });
    } finally {
      setUpdating({ ...updating, [itemId]: false });
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item from cart?')) {
      return;
    }

    setUpdating({ ...updating, [itemId]: true });
    try {
      await cartService.removeItem(itemId);
      await fetchCart();
      setMessage({ type: 'success', text: 'Item removed from cart' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Failed to remove item:', error);
      setMessage({ type: 'error', text: 'Failed to remove item' });
    } finally {
      setUpdating({ ...updating, [itemId]: false });
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    setLoading(true);
    try {
      await cartService.clearCart();
      await fetchCart();
      setMessage({ type: 'success', text: 'Cart cleared successfully' });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setMessage({ type: 'error', text: 'Failed to clear cart' });
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (cartData.items.length === 0) {
      setMessage({ type: 'error', text: 'Your cart is empty' });
      return;
    }
    navigate('/customer/addresses');
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>
            <i className="fas fa-shopping-cart"></i> Shopping Cart
          </h1>
          {cartData.items.length > 0 && (
            <button className="btn-clear-cart" onClick={handleClearCart}>
              <i className="fas fa-trash"></i> Clear Cart
            </button>
          )}
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
            <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
            {message.text}
          </div>
        )}

        {cartData.items.length === 0 ? (
          /* Empty Cart State */
          <div className="empty-cart">
            <i className="fas fa-shopping-cart fa-4x"></i>
            <h3>Your Cart is Empty</h3>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="btn btn-brand btn-lg">
              <i className="fas fa-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        ) : (
          /* Cart Content */
          <div className="cart-content">
            {/* Cart Items List */}
            <div className="cart-items">
              <div className="cart-items-header">
                <h3>Cart Items ({cartData.itemCount})</h3>
              </div>

              {cartData.items.map((item) => {
                const product = item.product;
                const discountedPrice = product.discountPercent > 0
                  ? (product.price * (1 - product.discountPercent / 100)).toFixed(2)
                  : product.price.toFixed(2);
                const isClearance = product.discountPercent >= 50;
                const itemTotal = item.totalPrice.toFixed(2);

                return (
                  <div key={item.id} className="cart-item">
                    {/* Product Image */}
                    <div className="cart-item-image">
                      <Link to={`/products/${product.id}`}>
                        <img
                          src={product.imageUrl || `https://placehold.co/200x250/f0f0f0/333?text=${product.name}`}
                          alt={product.name}
                        />
                      </Link>
                      {product.discountPercent > 0 && (
                        <div className="item-badge">
                          <SaleBadge discountPercent={product.discountPercent} isClearance={isClearance} />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="cart-item-details">
                      <Link to={`/products/${product.id}`} className="item-name">
                        <h4>{product.name}</h4>
                      </Link>
                      <p className="item-category">{product.category}</p>
                      
                      {/* Price */}
                      <div className="item-price">
                        {product.discountPercent > 0 ? (
                          <>
                            <span className="price-discounted">₹{discountedPrice}</span>
                            <span className="price-original">₹{product.price.toFixed(2)}</span>
                            <span className="discount-percent">({product.discountPercent}% off)</span>
                          </>
                        ) : (
                          <span className="price">₹{product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="cart-item-quantity">
                      <label>Quantity</label>
                      <div className="quantity-controls">
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updating[item.id]}
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <input
                          type="number"
                          className="quantity-input"
                          value={item.quantity}
                          readOnly
                        />
                        <button
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= product.stockQuantity || updating[item.id]}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      {updating[item.id] && (
                        <div className="updating-indicator">
                          <i className="fas fa-spinner fa-spin"></i> Updating...
                        </div>
                      )}
                    </div>

                    {/* Item Total */}
                    <div className="cart-item-total">
                      <label>Total</label>
                      <div className="total-price">₹{itemTotal}</div>
                    </div>

                    {/* Remove Button */}
                    <div className="cart-item-actions">
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updating[item.id]}
                        title="Remove item"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal ({cartData.itemCount} items)</span>
                <span className="summary-value">₹{cartData.total.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span className="summary-value free">FREE</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Total</span>
                <span className="summary-total">₹{cartData.total.toFixed(2)}</span>
              </div>

              <button
                className="btn btn-brand btn-block btn-lg"
                onClick={handleProceedToCheckout}
              >
                <i className="fas fa-arrow-right"></i> Proceed to Delivery
              </button>

              <Link to="/products" className="continue-shopping">
                <i className="fas fa-arrow-left"></i> Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="trust-badges">
                <div className="trust-badge">
                  <i className="fas fa-shield-alt"></i>
                  <span>Secure Payment</span>
                </div>
                <div className="trust-badge">
                  <i className="fas fa-undo"></i>
                  <span>Easy Returns</span>
                </div>
                <div className="trust-badge">
                  <i className="fas fa-shipping-fast"></i>
                  <span>Free Shipping</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;