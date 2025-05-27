import React, { useState, useEffect, useCallback } from 'react';

const LoadingSpinner = () => {
  const [dots, setDots] = useState('');
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const tips = [
    "Calculando las proporciones ideales de macronutrientes...",
    "Seleccionando los ingredientes más frescos...",
    "Diseñando un menú equilibrado y delicioso...",
    "Ajustando las cantidades según tus necesidades...",
    "Preparando sugerencias de preparación paso a paso..."
  ];

  // Efecto para los puntos animados
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  // Efecto para cambiar los mensajes cada 3 segundos
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % tips.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, [tips.length]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-5">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 opacity-75"></div>
              <div className="absolute inset-1.5 border-4 border-t-primary-500 border-r-primary-400 border-b-primary-300 border-l-primary-400 rounded-full animate-spin"></div>
              <div className="absolute inset-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Preparando tu plan</h3>
            <div className="min-h-[60px] w-full flex items-center justify-center mb-4 px-4">
              <p className="text-gray-600 text-center text-base transition-opacity duration-500">
                {tips[currentTipIndex]}
              </p>
            </div>
            
            <div className="w-full max-w-xs bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
              <div 
                className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full"
                style={{
                  width: '70%',
                  animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos{dots}</p>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
