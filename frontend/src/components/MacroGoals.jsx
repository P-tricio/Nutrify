import React from 'react';

const MacroGoals = ({ proteinPercentage, carbsPercentage, fatPercentage, calories, className = '' }) => {
  // Calcular gramos de cada macronutriente
  const proteinGrams = Math.round((calories * (proteinPercentage / 100)) / 4);
  const carbsGrams = Math.round((calories * (carbsPercentage / 100)) / 4);
  const fatGrams = Math.round((calories * (fatPercentage / 100)) / 9);

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md border-2 border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-center">Distribución de macronutrientes</h3>
      
      {/* Barra de progreso unificada */}
      <div className="w-full bg-gray-100 rounded-full h-4 mb-6 overflow-hidden flex">
        <div 
          className="h-full bg-red-400 transition-all duration-300"
          style={{ width: `${proteinPercentage}%` }}
          title={`Proteínas: ${proteinPercentage}%`}
        ></div>
        <div 
          className="h-full bg-orange-300 transition-all duration-300"
          style={{ width: `${carbsPercentage}%` }}
          title={`Carbohidratos: ${carbsPercentage}%`}
        ></div>
        <div 
          className="h-full bg-yellow-400 transition-all duration-300"
          style={{ width: `${fatPercentage}%` }}
          title={`Grasas: ${fatPercentage}%`}
        ></div>
      </div>

      {/* Leyenda y valores */}
      <div className="space-y-3 max-w-xs mx-auto">
        {/* Proteínas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
            <span className="text-sm">Proteínas</span>
          </div>
          <span className="text-sm font-medium">
            {proteinPercentage}% • {proteinGrams}g
          </span>
        </div>
        
        {/* Carbohidratos */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-300 rounded-full mr-2"></div>
            <span className="text-sm">Carbohidratos</span>
          </div>
          <span className="text-sm font-medium">
            {carbsPercentage}% • {carbsGrams}g
          </span>
        </div>
        
        {/* Grasas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
            <span className="text-sm">Grasas</span>
          </div>
          <span className="text-sm font-medium">
            {fatPercentage}% • {fatGrams}g
          </span>
        </div>
      </div>
    </div>
  );
};

export default MacroGoals;
