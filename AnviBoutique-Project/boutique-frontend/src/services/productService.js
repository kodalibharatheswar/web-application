/**
 * Product Service
 * Handles all product-related API calls
 */

import api from './api';

const productService = {
  /**
   * Get filtered and sorted products
   * @param {Object} filters - { category, sortBy, minPrice, maxPrice, status, color, keyword }
   */
  getProducts: async (filters = {}) => {
    try {
      const params = {};
      
      if (filters.category) params.category = filters.category;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.status) params.status = filters.status;
      if (filters.color) params.color = filters.color;
      if (filters.keyword) params.keyword = filters.keyword;
      
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch products' };
    }
  },

  /**
   * Get featured products for homepage (top 8 latest)
   */
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products/featured');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch featured products' };
    }
  },

  /**
   * Get single product detail with reviews
   * Returns: { product, reviews, averageRating, reviewCount, relatedProducts }
   */
  getProductDetail: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch product details' };
    }
  },

  /**
   * Get available product categories
   */
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch categories' };
    }
  },

  /**
   * Admin: Get all products (including unavailable)
   */
  getAllProductsAdmin: async () => {
    try {
      const response = await api.get('/admin/products');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch products' };
    }
  },

  /**
   * Admin: Add new product
   */
  addProduct: async (productData) => {
    try {
      const response = await api.post('/admin/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to add product' };
    }
  },

  /**
   * Admin: Update existing product
   */
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/admin/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update product' };
    }
  },

  /**
   * Admin: Delete product
   */
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete product' };
    }
  }
};

export default productService;