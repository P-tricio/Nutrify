import React from 'react';

const MacroSummary = ({ totalCalories, totalProteins, totalCarbs, totalFats, targetProtein, targetCarbs, targetFats }) => {
  if (!totalProteins && !totalCarbs && !totalFats) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-2 border-green-200">
      <h3 className="text-lg font-semibold mb-2 text-center">Macronutrientes Generados</h3>
      <div className="space-y-2">
        <MacroItem 
          label="Proteínas" 
          value={totalProteins} 
          target={targetProtein} 
          color="red-400" 
          calories={totalCalories} 
          kcalPerGram={4} 
        />
        <MacroItem 
          label="Carbohidratos" 
          value={totalCarbs} 
          target={targetCarbs} 
          color="orange-300" 
          calories={totalCalories} 
          kcalPerGram={4} 
        />
        <MacroItem 
          label="Grasas" 
          value={totalFats} 
          target={targetFats} 
          color="yellow-400" 
          calories={totalCalories} 
          kcalPerGram={9} 
        />
      </div>
    </div>
  );
};

const MacroItem = ({ label, value, target, color, calories, kcalPerGram }) => {
  const difference = value - target;
  const differenceClass = Math.abs(difference) > 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
  
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-3 h-3 bg-${color} rounded-full mr-2`}></div>
          <span>{label}:</span>
        </div>
        <span className="font-medium">
          {value}% ({Math.round((calories * (value / 100)) / kcalPerGram)}g)
        </span>
      </div>
      <div className="flex justify-end mt-1">
        <span className={`text-xs px-2 py-1 rounded ${differenceClass}`}>
          {difference > 0 ? '+' : ''}{difference}% vs objetivo
        </span>
      </div>
    </div>
  );
};

export default MacroSummary;
