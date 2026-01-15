/**
 * Products Page Component
 * Exact match to original Thymeleaf products.html
 * Features: Left sidebar filters, sorting, product grid, pagination
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    sortBy: searchParams.get('sortBy') || 'latest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    status: searchParams.get('status') || '',
    color: searchParams.get('color') || '',
    keyword: searchParams.get('keyword') || ''
  });

  // Available categories
  const categories = [
    'Sarees', 'Lehengas', 'Kurtis', 'Long Frocks', 'Mom & Me',
    'Crop Top – Skirts', 'Handlooms', 'Casual Frocks',
    'Ready To Wear', 'Dupattas', 'Kids wear', 'Dress Material',
    'Blouses', 'Fabrics'
  ];

  // Sort options
  const sortOptions = [
    { value: 'latest', label: 'Latest Arrivals' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'priceAsc', label: 'Price: Low to High' },
    { value: 'priceDesc', label: 'Price: High to Low' }
  ];

  // Status filters
  const statusOptions = [
    { value: '', label: 'All Products' },
    { value: 'inStock', label: 'In Stock' },
    { value: 'lowStock', label: 'Low Stock' },
    { value: 'onSale', label: 'On Sale' },
    { value: 'clearance', label: 'Clearance (50%+ off)' }
  ];

  // Color options
  const colorOptions = [
    'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White',
    'Pink', 'Orange', 'Purple', 'Brown', 'Grey', 'Multicolor'
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts(filters);
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value
    };
    
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const updateURLParams = (newFilters) => {
    const params = {};
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        params[key] = newFilters[key];
      }
    });
    setSearchParams(params);
  };

  const handlePriceRangeChange = (min, max) => {
    const newFilters = {
      ...filters,
      minPrice: min,
      maxPrice: max
    };
    setFilters(newFilters);
    updateURLParams(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      category: '',
      sortBy: 'latest',
      minPrice: '',
      maxPrice: '',
      status: '',
      color: '',
      keyword: ''
    };
    setFilters(resetFilters);
    setSearchParams({});
  };

  const handleSortChange = (e) => {
    handleFilterChange('sortBy', e.target.value);
  };

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="products-header">
          <div className="header-left">
            <h1 className="page-title">
              {filters.category ? filters.category : 'All Products'}
            </h1>
            <p className="products-count">
              {loading ? 'Loading...' : `${products.length} products found`}
            </p>
          </div>
          <div className="header-right">
            <div className="sort-controls">
              <label htmlFor="sortBy">
                <i className="fas fa-sort"></i> Sort by:
              </label>
              <select
                id="sortBy"
                className="form-control"
                value={filters.sortBy}
                onChange={handleSortChange}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="products-content">
          {/* Left Sidebar - Filters */}
          <aside className="products-sidebar">
            <div className="sidebar-header">
              <h3>
                <i className="fas fa-filter"></i> Filters
              </h3>
              {(filters.category || filters.status || filters.color || filters.minPrice || filters.maxPrice) && (
                <button className="btn-clear-filters" onClick={clearFilters}>
                  <i className="fas fa-times"></i> Clear All
                </button>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="filter-section">
              <h5 className="filter-title">
                <i className="fas fa-rupee-sign"></i> Price Range
              </h5>
              <div className="price-range-inputs">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="filter-section">
              <h5 className="filter-title">
                <i className="fas fa-check-circle"></i> Availability
              </h5>
              <div className="filter-options">
                {statusOptions.map(option => (
                  <label key={option.value} className="filter-option">
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={filters.status === option.value}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="filter-section">
              <h5 className="filter-title">
                <i className="fas fa-palette"></i> Color
              </h5>
              <div className="color-swatches">
                {colorOptions.map(color => (
                  <label
                    key={color}
                    className={`color-swatch ${filters.color === color ? 'active' : ''}`}
                    title={color}
                  >
                    <input
                      type="radio"
                      name="color"
                      value={color}
                      checked={filters.color === color}
                      onChange={(e) => handleFilterChange('color', e.target.value)}
                    />
                    <span
                      className="color-circle"
                      style={{ backgroundColor: color.toLowerCase() }}
                    ></span>
                    <span className="color-name">{color}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="filter-section">
              <h5 className="filter-title">
                <i className="fas fa-th-large"></i> Categories
              </h5>
              <div className="category-links">
                <button
                  className={`category-link ${!filters.category ? 'active' : ''}`}
                  onClick={() => handleFilterChange('category', '')}
                >
                  All Categories
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    className={`category-link ${filters.category === category ? 'active' : ''}`}
                    onClick={() => handleFilterChange('category', category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Content - Products Grid */}
          <div className="products-main">
            {/* Active Filters Display */}
            {(filters.category || filters.status || filters.color || filters.minPrice || filters.maxPrice) && (
              <div className="active-filters">
                <span className="active-filters-label">Active Filters:</span>
                {filters.category && (
                  <span className="filter-tag">
                    Category: {filters.category}
                    <button onClick={() => handleFilterChange('category', '')}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
                {filters.status && (
                  <span className="filter-tag">
                    Status: {statusOptions.find(o => o.value === filters.status)?.label}
                    <button onClick={() => handleFilterChange('status', '')}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
                {filters.color && (
                  <span className="filter-tag">
                    Color: {filters.color}
                    <button onClick={() => handleFilterChange('color', '')}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="filter-tag">
                    Price: ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                    <button onClick={() => handlePriceRangeChange('', '')}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <i className="fas fa-search fa-3x"></i>
                <h3>No Products Found</h3>
                <p>Try adjusting your filters or search criteria</p>
                <button className="btn btn-brand" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;