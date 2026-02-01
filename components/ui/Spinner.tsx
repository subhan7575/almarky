import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={`border-slate-100 border-t-blue-600 rounded-full animate-spin ${sizeClasses[size]}`}
      role="status"
      aria-label="Loading..."
    ></div>
  );
};

export default Spinner;
