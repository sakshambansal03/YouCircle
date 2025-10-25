import React from 'react';
import './YouCircleLogo.css';

const YouCircleLogo = ({ size = 60, showText = true, className = '' }) => {
  return (
    <div className={`logo-container ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        className="logo-symbol"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Central circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="8" 
          fill="none" 
          stroke="#667eea" 
          strokeWidth="3"
        />
        
        {/* Outer nodes and connections */}
        {/* Top node */}
        <circle cx="50" cy="20" r="4" fill="#667eea" />
        <path d="M 50 28 L 50 42" stroke="#667eea" strokeWidth="2" fill="none" />
        
        {/* Top-right node */}
        <circle cx="70" cy="30" r="4" fill="#667eea" />
        <path d="M 58 36 L 66 34" stroke="#667eea" strokeWidth="2" fill="none" />
        
        {/* Right node */}
        <circle cx="80" cy="50" r="4" fill="#667eea" />
        <path d="M 72 50 L 58 50" stroke="#667eea" strokeWidth="2" fill="none" />
        
        {/* Bottom-right node */}
        <circle cx="70" cy="70" r="4" fill="#667eea" />
        <path d="M 66 66 L 58 64" stroke="#667eea" strokeWidth="2" fill="none" />
        
        {/* Bottom node */}
        <circle cx="50" cy="80" r="4" fill="#667eea" />
        <path d="M 50 72 L 50 58" stroke="#667eea" strokeWidth="2" fill="none" />
        
        {/* Bottom-left node */}
        <circle cx="30" cy="70" r="4" fill="#667eea" />
        <path d="M 34 66 L 42 64" stroke="#667eea" strokeWidth="2" fill="none" />
        
        {/* Left node */}
        <circle cx="20" cy="50" r="4" fill="#667eea" />
        <path d="M 28 50 L 42 50" stroke="#667eea" strokeWidth="2" fill="none" />
        
        {/* Top-left node */}
        <circle cx="30" cy="30" r="4" fill="#667eea" />
        <path d="M 34 34 L 42 36" stroke="#667eea" strokeWidth="2" fill="none" />
      </svg>
      
      {showText && (
        <span className="logo-text">youcircle</span>
      )}
    </div>
  );
};

export default YouCircleLogo;
