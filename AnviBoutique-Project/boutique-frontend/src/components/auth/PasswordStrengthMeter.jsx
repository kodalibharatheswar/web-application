/**
 * Password Strength Meter Component
 * Shows visual strength indicator with 4 levels
 * Matching original Thymeleaf design
 */

import React from 'react';

const PasswordStrengthMeter = ({ strength }) => {
  const getStrengthLabel = () => {
    if (strength === 0) return { text: '', class: '' };
    if (strength <= 2) return { text: 'Weak', class: 'weak' };
    if (strength <= 4) return { text: 'Medium', class: 'medium' };
    return { text: 'Strong', class: 'strong' };
  };

  const strengthInfo = getStrengthLabel();

  if (strength === 0) return null;

  return (
    <div className="password-strength-meter">
      <div className="password-strength-bar">
        <div className={`password-strength-fill ${strengthInfo.class}`}></div>
      </div>
      <div className={`password-strength-text ${strengthInfo.class}`}>
        Password Strength: {strengthInfo.text}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;