import React from 'react';

export default function LoadingSpinner({ size = 'medium' }) {
  const sizeClass = `spinner spinner-${size}`;
  return (
    <div className="spinner-container">
      <div className={sizeClass}></div>
    </div>
  );
}
