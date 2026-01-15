/**
 * Related Products Component
 * Displays carousel of related products
 */

import React from 'react';
import ProductCard from './ProductCard';
import './RelatedProducts.css';

const RelatedProducts = ({ products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="related-products-section">
      <h2 className="section-title">You May Also Like</h2>
      <div className="related-products-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;