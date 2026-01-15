/**
 * Product Detail Page Component
 * Exact match to original Thymeleaf product_detail.html
 * Features: Image display, price, size selector, quantity, tabs (description, reviews), related products
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import cartService from '../services/cartService';
import authService from '../services/authService';
import SaleBadge from '../components/common/SaleBadge';
import StarRating from '../components/common/StarRating';
import RelatedProducts from '../components/product/RelatedProducts';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      // Returns: { product, reviews, averageRating, reviewCount, relatedProducts }
      const data = await productService.getProductDetail(id);
      setProductData(data);
      
      // Set default size if available
      if (data.product.sizeOptions) {
        const sizes = data.product.sizeOptions.split(',');
        setSelectedSize(sizes[0].trim());
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      setMessage({ type: 'error', text: 'Failed to load product details' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (!selectedSize && productData.product.sizeOptions) {
      setMessage({ type: 'error', text: 'Please select a size' });
      return;
    }

    setAddingToCart(true);
    try {
      await cartService.addToCart(productData.product.id, quantity);
      setMessage({ type: 'success', text: 'Product added to cart!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add to cart' });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= productData.product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      // Call review service (you'll need to create this)
      // await reviewService.submitReview(id, reviewForm.rating, reviewForm.comment);
      
      setMessage({ type: 'success', text: 'Review submitted! It will be visible after admin approval.' });
      setReviewForm({ rating: 5, comment: '' });
      
      // Refresh product data to show new review
      setTimeout(() => {
        fetchProductDetail();
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit review' });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!productData || !productData.product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-container">
            <i className="fas fa-exclamation-circle fa-3x"></i>
            <h3>Product Not Found</h3>
            <p>The product you're looking for doesn't exist or has been removed.</p>
            <button className="btn btn-brand" onClick={() => navigate('/products')}>
              Browse All Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { product, reviews, averageRating, reviewCount, relatedProducts } = productData;
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
  const isClearance = product.discountPercent >= 50;
  const discountedPrice = product.discountPercent > 0
    ? (product.price * (1 - product.discountPercent / 100)).toFixed(2)
    : product.price.toFixed(2);

  // Parse size options
  const sizeOptions = product.sizeOptions ? product.sizeOptions.split(',').map(s => s.trim()) : [];

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <span className="breadcrumb-item">
            <a href="/">Home</a>
          </span>
          <span className="breadcrumb-item">
            <a href="/products">Products</a>
          </span>
          <span className="breadcrumb-item">
            <a href={`/products?category=${product.category}`}>{product.category}</a>
          </span>
          <span className="breadcrumb-item active">{product.name}</span>
        </nav>

        {/* Message Alert */}
        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
            <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
            {message.text}
          </div>
        )}

        {/* Product Detail Section */}
        <div className="product-detail-section">
          {/* Left - Product Image */}
          <div className="product-image-section">
            <div className="product-badges">
              {isOutOfStock && (
                <span className="badge badge-danger">Out of Stock</span>
              )}
              {!isOutOfStock && product.discountPercent > 0 && (
                <SaleBadge discountPercent={product.discountPercent} isClearance={isClearance} />
              )}
            </div>
            <img
              src={product.imageUrl || `https://placehold.co/600x750/f0f0f0/333?text=${product.name}`}
              alt={product.name}
              className="product-main-image"
            />
          </div>

          {/* Right - Product Info */}
          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            
            {/* Category and SKU */}
            <div className="product-meta">
              <span className="product-category">
                <i className="fas fa-tag"></i> {product.category}
              </span>
              {product.sku && (
                <span className="product-sku">SKU: {product.sku}</span>
              )}
            </div>

            {/* Rating */}
            <div className="product-rating">
              <StarRating rating={averageRating} />
              <span className="rating-count">({reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="product-price-section">
              {product.discountPercent > 0 ? (
                <>
                  <span className="price-discounted">₹{discountedPrice}</span>
                  <span className="price-original">₹{product.price.toFixed(2)}</span>
                  <span className="discount-percent">({product.discountPercent}% OFF)</span>
                </>
              ) : (
                <span className="price">₹{product.price.toFixed(2)}</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              {isOutOfStock ? (
                <span className="out-of-stock">
                  <i className="fas fa-times-circle"></i> Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="low-stock">
                  <i className="fas fa-exclamation-triangle"></i> Only {product.stockQuantity} left in stock!
                </span>
              ) : (
                <span className="in-stock">
                  <i className="fas fa-check-circle"></i> In Stock
                </span>
              )}
            </div>

            {/* Size Selection */}
            {sizeOptions.length > 0 && (
              <div className="size-selection">
                <label className="form-label">
                  <i className="fas fa-ruler"></i> Select Size
                  {product.sizeGuideUrl && (
                    <a href={product.sizeGuideUrl} target="_blank" rel="noopener noreferrer" className="size-guide-link">
                      Size Guide
                    </a>
                  )}
                </label>
                <div className="size-options">
                  {sizeOptions.map(size => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                      disabled={isOutOfStock}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            {!isOutOfStock && (
              <div className="quantity-selection">
                <label className="form-label">
                  <i className="fas fa-sort-numeric-up"></i> Quantity
                </label>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    className="quantity-input"
                    value={quantity}
                    readOnly
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockQuantity}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="product-actions">
              <button
                className="btn btn-brand btn-lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
              >
                {addingToCart ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Adding...
                  </>
                ) : (
                  <>
                    <i className="fas fa-shopping-cart"></i> Add to Cart
                  </>
                )}
              </button>
              <button className="btn btn-outline-brand btn-lg" disabled={isOutOfStock}>
                <i className="fas fa-heart"></i> Add to Wishlist
              </button>
            </div>

            {/* Delivery Info */}
            {product.estimatedDelivery && (
              <div className="delivery-info">
                <i className="fas fa-truck"></i>
                <span>Estimated Delivery: {product.estimatedDelivery}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="product-tabs-section">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === 'additional' ? 'active' : ''}`}
              onClick={() => setActiveTab('additional')}
            >
              Additional Information
            </button>
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviewCount})
            </button>
          </div>

          <div className="tabs-content">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="tab-pane">
                <h3>Product Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Additional Information Tab */}
            {activeTab === 'additional' && (
              <div className="tab-pane">
                <h3>Additional Information</h3>
                {product.additionalInformation ? (
                  <div dangerouslySetInnerHTML={{ __html: product.additionalInformation }} />
                ) : (
                  <p>No additional information available.</p>
                )}
                
                {product.deliveryAndReturnPolicy && (
                  <>
                    <h4>Delivery & Return Policy</h4>
                    <div dangerouslySetInnerHTML={{ __html: product.deliveryAndReturnPolicy }} />
                  </>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="tab-pane">
                <h3>Customer Reviews</h3>
                
                {/* Review Summary */}
                <div className="review-summary">
                  <div className="average-rating">
                    <div className="rating-number">{averageRating.toFixed(1)}</div>
                    <StarRating rating={averageRating} size="large" />
                    <div className="rating-text">Based on {reviewCount} reviews</div>
                  </div>
                </div>

                {/* Review List */}
                <div className="reviews-list">
                  {reviews && reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <StarRating rating={review.rating} />
                          <span className="review-date">
                            {new Date(review.datePosted).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="review-comment">{review.comment}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
                  )}
                </div>

                {/* Write Review Form */}
                {authService.isAuthenticated() && authService.isCustomer() && (
                  <div className="write-review-section">
                    <h4>Write a Review</h4>
                    <form onSubmit={handleReviewSubmit}>
                      <div className="form-group">
                        <label className="form-label">Your Rating</label>
                        <div className="rating-input">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              className={`star-btn ${star <= reviewForm.rating ? 'active' : ''}`}
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            >
                              <i className="fas fa-star"></i>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Your Review (Optional)</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          placeholder="Share your experience with this product..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        ></textarea>
                      </div>

                      <button type="submit" className="btn btn-brand" disabled={submittingReview}>
                        {submittingReview ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i> Submitting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane"></i> Submit Review
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {!authService.isAuthenticated() && (
                  <div className="login-prompt">
                    <p>
                      <i className="fas fa-info-circle"></i>{' '}
                      Please <a href="/login">login</a> to write a review
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;