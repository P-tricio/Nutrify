import React from 'react';
import MealCard from './MealCard';
import DietSummary from './DietSummary';

const DietResults = ({ formData, goalOptions, preferenceOptions, diet, onNewDiet }) => {
  return (
    <div className="w-full">
      <div className="bg-white rounded-lg">
        <div className="w-full">
          <DietSummary 
            formData={formData} 
            goalOptions={goalOptions} 
            preferenceOptions={preferenceOptions} 
          />
          
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-6 text-center">Comidas</h2>
            <div className="grid grid-cols-1 gap-4">
              {diet.meals.map((meal, index) => (
                <div key={index} className="border border-neutral-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  <MealCard meal={meal} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onNewDiet}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              Generar nueva dieta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietResults;
