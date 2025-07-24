import React from 'react';

const DietSummary = ({ formData, goalOptions, preferenceOptions }) => {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Resumen de tu dieta</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-600 mb-1">Objetivo</h3>
          <p className="text-base font-medium text-neutral-800">
            {formData.goal ? goalOptions.find(opt => opt.value === formData.goal)?.label || formData.goal : 'No especificado'}
          </p>
        </div>
        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-600 mb-1">Calorías totales</h3>
          <p className="text-xl font-bold text-primary-600">{formData.calories} kcal</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
          <h3 className="text-xs font-semibold text-neutral-500 mb-1">Comidas/día</h3>
          <p className="text-sm text-neutral-800">{formData.mealsPerDay}</p>
        </div>
        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
          <h3 className="text-xs font-semibold text-neutral-500 mb-1">Preferencias</h3>
          <p className="text-sm text-neutral-800">
            {formData.preferences ? preferenceOptions.find(opt => opt.value === formData.preferences)?.label || formData.preferences : 'No especificadas'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DietSummary;
