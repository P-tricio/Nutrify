import React, { useState, useEffect } from 'react';

const LoadingSpinner = () => {
  const [dots, setDots] = useState('');
  const [currentTip, setCurrentTip] = useState('');
  const [tipIndex, setTipIndex] = useState(0);

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

  // Efecto para cambiar los mensajes cada 7 segundos
  useEffect(() => {
    // Establecer el primer mensaje inmediatamente
    setCurrentTip(tips[0]);
    
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
      setCurrentTip(tips[tipIndex]);
    }, 7000);

    return () => clearInterval(tipInterval);
  }, [tipIndex, tips]);

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="flex flex-col items-center bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 opacity-75"></div>
          <div className="absolute inset-1.5 border-4 border-t-primary-500 border-r-primary-400 border-b-primary-300 border-l-primary-400 rounded-full animate-spin"></div>
          <div className="absolute inset-3 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Preparando tu plan</h3>
        <p className="text-gray-600 text-center text-sm min-h-[20px] mb-4 w-full">
          {currentTip}
        </p>
        
        <div className="w-3/4 bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full"
            style={{
              width: '70%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          ></div>
        </div>
        
        <p className="mt-3 text-xs text-gray-400">Esto puede tomar unos segundos{dots}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
