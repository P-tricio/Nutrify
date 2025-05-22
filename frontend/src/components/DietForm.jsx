import React from 'react';
import FormInput from './FormInput';
import MacroGoals from './MacroGoals';
import MacroSummary from './MacroSummary';

const DietForm = ({
  formData,
  errors,
  isLoading,
  apiError,
  goalOptions,
  preferenceOptions,
  diet,
  handleChange,
  handleSubmit,
  isValid
}) => {
  return (
    <div className="divide-y divide-gray-200">
      <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
        <h1 className="text-3xl font-bold text-center mb-8">Generador de dietas</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {apiError && (
            <div className="mt-4 p-4 bg-accent-50 border border-accent-200 text-accent-800 rounded">
              {apiError}
            </div>
          )}
          
          <div className="space-y-4">
            <FormInput
              label="Calorías diarias"
              name="calories"
              type="number"
              min="1000"
              max="5000"
              step="100"
              value={formData.calories || ''}
              onChange={(e) => handleChange(e)}
              error={errors.calories}
              required
            />
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <MacroGoals 
                proteinPercentage={formData.proteinPercentage}
                carbsPercentage={formData.carbsPercentage}
                fatPercentage={formData.fatsPercentage}
                calories={parseInt(formData.calories) || 0}
              />
              
              {diet?.summary && (
                <MacroSummary 
                  totalCalories={parseInt(formData.calories) || 0}
                  totalProteins={diet.summary.totalProteins}
                  totalCarbs={diet.summary.totalCarbs}
                  totalFats={diet.summary.totalFats}
                  targetProtein={parseInt(formData.proteinPercentage) || 0}
                  targetCarbs={parseInt(formData.carbsPercentage) || 0}
                  targetFats={parseInt(formData.fatsPercentage) || 0}
                />
              )}
            </div>

            <FormInput
              label="Comidas por día"
              name="mealsPerDay"
              type="number"
              min="1"
              max="6"
              value={formData.mealsPerDay || ''}
              onChange={(e) => handleChange(e)}
              error={errors.mealsPerDay}
              required
            />
            
            <FormInput
              label="Tiempo máximo por comida (minutos)"
              name="timePerMeal"
              type="number"
              min="5"
              max="120"
              value={formData.timePerMeal || ''}
              onChange={(e) => handleChange(e)}
              error={errors.timePerMeal}
              required
            />
            
            <div className="space-y-2">
              <FormInput
                label="Objetivo"
                name="goal"
                type="select"
                options={goalOptions}
                value={formData.goal || ''}
                onChange={(e) => handleChange(e)}
                error={errors.goal}
                required
              />
              {formData.goal && (
                <p className="text-xs text-neutral-500 -mt-1">
                  {formData.goal === 'perdida' && 
                    'Dieta alta en proteínas para preservar masa muscular durante el déficit calórico.'}
                  {formData.goal === 'definicion' && 
                    'Máxima definición muscular con alto contenido proteico y bajo en grasas para reducir el porcentaje de grasa corporal.'}
                  {formData.goal === 'mantenimiento' && 
                    'Dieta equilibrada para mantener tu peso actual.'}
                  {formData.goal === 'aumento' && 
                    'Dieta alta en carbohidratos para apoyar el crecimiento muscular.'}
                </p>
              )}
            </div>
            
            <FormInput
              label="Preferencias alimentarias"
              name="preferences"
              type="select"
              options={preferenceOptions}
              value={formData.preferences || ''}
              onChange={(e) => handleChange(e)}
              error={errors.preferences}
              required
            />
            
            <FormInput
              label="Alergias"
              name="allergies"
              type="text"
              placeholder="p.ej: marisco, frutos secos, etc."
              value={formData.allergies || ''}
              onChange={(e) => handleChange(e)}
              error={errors.allergies}
            />
            
            <FormInput
              label="Alimentos no deseados"
              name="forbiddenFoods"
              type="text"
              placeholder="p.ej: legumbres, pescado, etc."
              value={formData.forbiddenFoods || ''}
              onChange={(e) => handleChange(e)}
              error={errors.forbiddenFoods}
            />
            
            <FormInput
              label="Alimentos favoritos"
              name="favoriteFoods"
              type="text"
              placeholder="p.ej: carne, pasta, etc."
              value={formData.favoriteFoods || ''}
              onChange={(e) => handleChange(e)}
              error={errors.favoriteFoods}
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Generando...' : 'Generar Dieta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DietForm;
