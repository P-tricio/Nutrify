import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <span className="ml-4 text-gray-600">Generando tu dieta...</span>
    </div>
  );
};

export default LoadingSpinner;
