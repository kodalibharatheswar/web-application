/**
 * Star Rating Component
 * Displays star ratings (filled and half-filled)
 */

import React from 'react';
import './StarRating.css';

const StarRating = ({ rating = 0, size = 'medium' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`star-rating ${size}`}>
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, index) => (
        <i key={`full-${index}`} className="fas fa-star"></i>
      ))}
      
      {/* Half Star */}
      {hasHalfStar && <i className="fas fa-star-half-alt"></i>}
      
      {/* Empty Stars */}
      {[...Array(emptyStars)].map((_, index) => (
        <i key={`empty-${index}`} className="far fa-star"></i>
      ))}
    </div>
  );
};

export default StarRating;