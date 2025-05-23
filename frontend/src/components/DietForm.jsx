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
              <div className="space-y-2 text-center">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Calorías diarias</h3>
                <div className="flex justify-center">
                  <div className="max-w-xs w-full">
                    <FormInput
                      name="calories"
                      type="number"
                      min="1000"
                      max="5000"
                      step="100"
                      value={formData.calories || ''}
                      onChange={(e) => handleChange(e)}
                      error={errors.calories}
                      required
                      containerClass="mb-0"
                      placeholder="Ej: 2000"
                      className="text-center w-full"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Meta calórica diaria recomendada
                </p>
                {errors.calories && (
                  <p className="mt-1 text-xs text-red-600">{errors.calories}</p>
                )}
              </div>
              
              {/* Comidas por día */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Comidas por día</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[3, 4, 5].map((count) => (
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
                      <span className="text-xs text-gray-500">Comidas</span>
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
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      ),
                      description: 'Incluye todo tipo de alimentos: carnes, pescados, lácteos, huevos, frutas, verduras, cereales y legumbres.'
                    },
                    {
                      id: 'vegetariano',
                      title: 'Vegetariano',
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      ),
                      description: 'Incluye lácteos, huevos, frutas, verduras, cereales y legumbres, sin carnes ni pescados.'
                    },
                    {
                      id: 'vegano',
                      title: 'Vegano',
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 9a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ),
                      description: 'Solo alimentos de origen vegetal: frutas, verduras, cereales, legumbres, frutos secos y semillas.'
                    },
                    {
                      id: 'sin_gluten',
                      title: 'Sin gluten',
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ),
                      description: 'Elimina el trigo, cebada, centeno y sus derivados. Incluye alternativas sin gluten.'
                    },
                    {
                      id: 'sin_lactosa',
                      title: 'Sin lactosa',
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
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
                      <div className="flex items-center mb-2 flex-grow">
                        <div className={`p-1.5 rounded-lg mr-3 flex-shrink-0 ${
                          formData.preferences === diet.id 
                            ? 'bg-primary-100 text-primary-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {diet.icon}
                        </div>
                        <span className="font-medium text-gray-900">{diet.title}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{diet.description}</p>
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
