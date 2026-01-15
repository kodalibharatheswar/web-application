/**
 * Cart Service
 * Handles shopping cart operations
 */

import api from './api';

const cartService = {
  /**
   * Get current user's cart
   * Returns: { items, total, itemCount }
   */
  getCart: async () => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch cart' };
    }
  },

  /**
   * Add product to cart
   */
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await api.post(`/cart/add/${productId}`, null, {
        params: { quantity }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to add to cart' };
    }
  },

  /**
   * Update cart item quantity
   */
  updateQuantity: async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/update/${itemId}`, null, {
        params: { quantity }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update quantity' };
    }
  },

  /**
   * Remove item from cart
   */
  removeItem: async (itemId) => {
    try {
      const response = await api.delete(`/cart/remove/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to remove item' };
    }
  },

  /**
   * Clear entire cart
   */
  clearCart: async () => {
    try {
      const response = await api.delete('/cart/clear');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to clear cart' };
    }
  }
};

export default cartService;