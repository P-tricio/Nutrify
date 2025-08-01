import React, { useState } from 'react';
import FormInput from './FormInput';
import MacroGoals from './MacroGoals';
import MacroSummary from './MacroSummary';
import CalorieCalculator from './CalorieCalculator';

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
  const [showCalorieCalculator, setShowCalorieCalculator] = useState(false);

  // Función para manejar el cálculo de calorías
  const handleCaloriesCalculated = (calories) => {
    console.log('handleCaloriesCalculated llamado con:', calories);
    
    // Asegurarnos de que tenemos un número válido
    const caloriesNumber = Number(calories);
    if (isNaN(caloriesNumber)) {
      console.error('Valor de calorías inválido recibido:', calories);
      return;
    }
    
    // Redondear el valor
    const roundedCalories = Math.round(caloriesNumber);
    console.log('Actualizando calorías a:', roundedCalories);
    
    // Actualizar el estado local primero para feedback inmediato
    const inputElement = document.querySelector('input[name="calories"]');
    if (inputElement) {
      inputElement.value = roundedCalories;
      // Disparar evento de cambio manualmente
      const event = new Event('input', { bubbles: true });
      inputElement.dispatchEvent(event);
    }
    
    // También actualizar a través del manejador de cambios del formulario
    handleChange({
      target: {
        name: 'calories',
        value: roundedCalories.toString()
      }
    });
    
    // Cerrar la calculadora
    setShowCalorieCalculator(false);
  };
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Generador de dietas personalizadas</h1>
          <p className="mt-3 text-xl text-gray-500">
            Crea un plan de alimentación adaptado a tus necesidades específicas
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {apiError && (
            <div className="mt-4 p-4 bg-accent-50 border border-accent-200 text-accent-800 rounded">
              {apiError}
            </div>
          )}
          
          {/* Primera fila: Objetivo y distribución de macros */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-6">¿Cuál es tu objetivo principal?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'perdida',
                    title: 'Pérdida de peso',
                    icon: (
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                      </svg>
                    ),
                    description: 'Dieta alta en proteínas para preservar masa muscular durante el déficit calórico.'
                  },
                  {
                    id: 'mantenimiento',
                    title: 'Mantenimiento',
                    icon: (
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                      </svg>
                    ),
                    description: 'Dieta equilibrada para mantener tu peso actual y tu rendimiento.'
                  },
                  {
                    id: 'aumento',
                    title: 'Aumento muscular',
                    icon: (
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.518l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" />
                      </svg>
                    ),
                    description: 'Dieta alta en carbohidratos para crecimiento muscular.'
                  }
                ].map((goal) => (
                  <div 
                    key={goal.id}
                    onClick={() => handleChange({ target: { name: 'goal', value: goal.id } })}
                    className={`h-full flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.goal === goal.id
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg self-start mb-3 ${
                      formData.goal === goal.id 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {goal.icon}
                    </div>
                    <h3 className={`text-lg font-medium ${
                      formData.goal === goal.id ? 'text-primary-800' : 'text-gray-900'
                    }`}>
                      {goal.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {goal.description}
                    </p>
                  </div>
                ))}
              </div>
              <input
                type="hidden"
                name="goal"
                value={formData.goal || ''}
                required
              />
              {errors.goal && (
                <p className="mt-2 text-sm text-red-600">{errors.goal}</p>
              )}
            </div>

            {/* Distribución de macronutrientes */}
            {formData.goal && (
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <div className="space-y-6">
                  <div className="w-full">
                    <div className="max-w-3xl mx-auto">
                      <MacroGoals 
                        proteinPercentage={formData.proteinPercentage}
                        carbsPercentage={formData.carbsPercentage}
                        fatPercentage={formData.fatsPercentage}
                        calories={parseInt(formData.calories) || 0}
                      />
                    </div>
                  </div>
                  
                  {diet?.summary && (
                    <div className="w-full">
                      <div className="max-w-3xl mx-auto">
                        <MacroSummary 
                          totalCalories={parseInt(formData.calories) || 0}
                          totalProteins={diet.summary.totalProteins}
                          totalCarbs={diet.summary.totalCarbs}
                          totalFats={diet.summary.totalFats}
                          targetProtein={parseInt(formData.proteinPercentage) || 0}
                          targetCarbs={parseInt(formData.carbsPercentage) || 0}
                          targetFats={parseInt(formData.fatsPercentage) || 0}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Segunda fila: Requisitos básicos */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Requerimientos básicos</h2>
            <div className="space-y-6">
              {/* Calorías diarias */}
                <div className="space-y-4">
                <div className="space-y-2 text-center">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Calorías diarias</h3>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="number"
                        name="calories"
                        value={formData.calories || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const input = e.target;
                          if (value === '' || (Number(value) >= 1000 && Number(value) <= 5000)) {
                            handleChange({
                              target: {
                                name: 'calories',
                                value: value === '' ? '' : Math.round(Number(value)).toString()
                              }
                            });
                          } else {
                            input.value = formData.calories || '';
                          }
                        }}
                        onBlur={(e) => {
                          let value = Number(e.target.value);
                          if (isNaN(value) || value < 1000) value = 2000;
                          value = Math.max(1000, Math.min(5000, value));
                          e.target.value = value;
                          handleChange({
                            target: {
                              name: 'calories',
                              value: value.toString()
                            }
                          });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="2000"
                        min="1000"
                        max="5000"
                        step="50"
                        required
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">kcal</span>
                    </div>
                    <input
                      type="range"
                      name="calories"
                      value={formData.calories || 2500}
                    <div className="text-xl font-semibold text-gray-900">{formData.calories} kcal</div>
                    <input
                      type="range"
                      name="calories"
                      value={formData.calories || 2000}
                      onChange={(e) => handleChange({ target: { name: 'calories', value: e.target.value } })}
                      className="w-full accent-primary-600"
                      min="1000"
                      max="5000"
                      step="50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    <button
                      type="button"
                      onClick={() => setShowCalorieCalculator(!showCalorieCalculator)}
                      className="text-primary-600 hover:text-primary-800 font-medium focus:outline-none"
                    >
                      {showCalorieCalculator ? 'Ocultar calculadora' : 'Calcular automáticamente'}
                    </button>
                  </p>
                </div>
                
                {/* Calculadora de calorías */}
                {showCalorieCalculator && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <CalorieCalculator 
                      onCalculate={handleCaloriesCalculated} 
                      selectedGoal={formData.goal}
                      goalOptions={goalOptions}
                    />
                  </div>
                )}
              </div>
              
              {/* Comidas por día */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Comidas por día</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[3, 4, 5, 6].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleChange({ target: { name: 'mealsPerDay', value: count.toString() } })}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                        parseInt(formData.mealsPerDay) === count
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-base font-medium">{count}</span>
                      <span className="text-xs text-gray-500">Comida{count > 1 ? 's' : ''}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="hidden"
                  name="mealsPerDay"
                  value={formData.mealsPerDay || ''}
                  required
                />
                {errors.mealsPerDay && (
                  <p className="mt-1 text-xs text-red-600">{errors.mealsPerDay}</p>
                )}
              </div>
              
              {/* Tipo de dieta */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de dieta <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                  {[
                    {
                      id: 'omnivoro',
                      title: 'Omnívoro',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils-icon lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>

                      ),
                      description: 'Incluye todo tipo de alimentos: carnes, pescados, lácteos, huevos, frutas, verduras, cereales y legumbres.'
                    },
                    {
                      id: 'vegetariano',
                      title: 'Vegetariano',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-carrot-icon lucide-carrot"><path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46"/><path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z"/><path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z"/></svg>

                      ),
                      description: 'Incluye lácteos, huevos, frutas, verduras, cereales y legumbres, sin carnes ni pescados.'
                    },
                    {
                      id: 'vegano',
                      title: 'Vegano',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-leaf-icon lucide-leaf"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>


                      ),
                      description: 'Solo alimentos de origen vegetal: frutas, verduras, cereales, legumbres, frutos secos y semillas.'
                    },
                    {
                      id: 'sin_gluten',
                      title: 'Sin gluten',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wheat-off-icon lucide-wheat-off"><path d="m2 22 10-10"/><path d="m16 8-1.17 1.17"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97"/><path d="M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98"/><path d="M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28"/><line x1="2" x2="22" y1="2" y2="22"/></svg>

                      ),
                      description: 'Elimina el trigo, cebada, centeno y sus derivados. Incluye alternativas sin gluten.'
                    },
                    {
                      id: 'sin_lactosa',
                      title: 'Sin lactosa',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-milk-off-icon lucide-milk-off"><path d="M8 2h8"/><path d="M9 2v1.343M15 2v2.789a4 4 0 0 0 .672 2.219l.656.984a4 4 0 0 1 .672 2.22v1.131M7.8 7.8l-.128.192A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3"/><path d="M7 15a6.47 6.47 0 0 1 5 0 6.472 6.472 0 0 0 3.435.435"/><line x1="2" x2="22" y1="2" y2="22"/></svg>

                      ),
                      description: 'Excluye la leche y derivados lácteos que contengan lactosa, incluyendo alternativas vegetales.'
                    }
                  ].map((diet) => (
                    <div 
                      key={diet.id}
                      onClick={() => handleChange({ target: { name: 'preferences', value: diet.id } })}
                      className={`h-full flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.preferences === diet.id
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start mb-2">
                        <div className={`p-1.5 rounded-lg mr-3 flex-shrink-0 w-8 h-8 flex items-center justify-center ${
                          formData.preferences === diet.id 
                            ? 'bg-primary-100 text-primary-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <div className="w-5 h-5 flex items-center justify-center">
                            {diet.icon}
                          </div>
                        </div>
                        <span className="font-medium text-gray-900 leading-tight">{diet.title}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{diet.description}</p>
                    </div>
                  ))}
                </div>
                <input
                  type="hidden"
                  name="preferences"
                  value={formData.preferences || ''}
                  required
                />
                {errors.preferences && (
                  <p className="mt-2 text-sm text-red-600">{errors.preferences}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* La sección de distribución de macronutrientes se ha movido justo después del objetivo */}

          {/* Cuarta fila: Alergias e intolerancias */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Alergias e intolerancias</h2>
            <div className="grid grid-cols-1 gap-6">
              <FormInput
                label="Alergias o intolerancias alimentarias (opcional)"
                name="allergies"
                type="text"
                value={formData.allergies || ''}
                onChange={(e) => handleChange(e)}
                error={errors.allergies}
                placeholder="Ej: Cacahuetes, mariscos, lactosa, gluten..."
                helpText="Especifica cualquier alergia o intolerancia que tengas para que podamos adaptar tu plan."
              />
            </div>
          </div>

          {/* Quinta fila: Preferencias alimentarias */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Preferencias alimentarias</h2>
            <div className="grid grid-cols-1 gap-6">
              <FormInput
                label="Alimentos que no te gustan (opcional)"
                name="forbiddenFoods"
                type="text"
                value={formData.forbiddenFoods || ''}
                onChange={(e) => handleChange(e)}
                error={errors.forbiddenFoods}
                placeholder="Ej: Brócoli, pescado azul, champiñones..."
                helpText="Evitaremos incluir estos alimentos en tu plan."
              />
              
              <FormInput
                label="Tus comidas favoritas (opcional)"
                name="favoriteFoods"
                type="text"
                value={formData.favoriteFoods || ''}
                onChange={(e) => handleChange(e)}
                error={errors.favoriteFoods}
                placeholder="Ej: Pasta, pollo a la plancha, ensalada César..."
                helpText="Incluiremos estos alimentos en tu plan cuando sea posible."
              />
            </div>
          </div>

          {/* Botón de envío */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className={`w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-base font-medium text-white ${
                isLoading || !isValid
                  ? 'bg-primary-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando tu dieta...
                </>
              ) : (
                'Generar mi plan de dieta personalizado'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DietForm;
