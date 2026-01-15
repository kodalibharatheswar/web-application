/**
 * Sale Badge Component
 * Displays blue badge for regular sales, red badge for clearance (50%+)
 */

import React from 'react';
import './SaleBadge.css';

const SaleBadge = ({ discountPercent, isClearance }) => {
  if (!discountPercent || discountPercent <= 0) {
    return null;
  }

  return (
    <span className={`sale-badge ${isClearance ? 'clearance' : 'sale'}`}>
      {isClearance ? (
        <>
          <i className="fas fa-fire"></i> CLEARANCE {discountPercent}%
        </>
      ) : (
        <>
          <i className="fas fa-tag"></i> SALE {discountPercent}%
        </>
      )}
    </span>
  );
};

export default SaleBadge;