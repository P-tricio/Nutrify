//NO FUNCIONAL

import { useState } from "react";
import FormInput from "./components/FormInput";
import MealCard from "./components/MealCard";
import LoadingSpinner from "./components/LoadingSpinner";

// Opciones para los selects
const goalOptions = [
  { value: 'perdida', label: 'Pérdida de peso' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'aumento', label: 'Aumento de masa muscular' },
  { value: 'definicion', label: 'Definición muscular' },
];

// Mapeo entre opciones de objetivo y distribución de macros
const goalToMacroDistribution = {
  'perdida': 'perdida',
  'definicion': 'definicion',  // Ahora usa su propia distribución
  'mantenimiento': 'mantenimiento',
  'aumento': 'aumento'
};

const preferenceOptions = [
  { value: 'omnivoro', label: 'Omnívoro' },
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'vegano', label: 'Vegano' },
  { value: 'sin_gluten', label: 'Sin gluten' },
  { value: 'sin_lactosa', label: 'Sin lactosa' },
];

function App() {
  const [formData, setFormData] = useState({
    calories: '',
    mealsPerDay: '3',
    allergies: '',
    preferences: '',
    forbiddenFoods: '',
    timePerMeal: '30',
    goal: '',
    favoriteFoods: '',
    proteinPercentage: 30,  // 30% de proteínas por defecto
    carbsPercentage: 40,    // 40% de carbohidratos por defecto
    fatsPercentage: 30      // 30% de grasas por defecto
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [diet, setDiet] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [isValid, setIsValid] = useState(true);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.calories || isNaN(formData.calories) || formData.calories < 1000 || formData.calories > 5000) {
      newErrors.calories = 'Por favor, introduce un número válido entre 1000 y 5000 kcal';
    }
    
    if (!formData.mealsPerDay || isNaN(formData.mealsPerDay) || formData.mealsPerDay < 1 || formData.mealsPerDay > 6) {
      newErrors.mealsPerDay = 'Por favor, introduce un número entre 1 y 6';
    }
    
    if (!formData.timePerMeal || isNaN(formData.timePerMeal) || formData.timePerMeal < 5 || formData.timePerMeal > 120) {
      newErrors.timePerMeal = 'Por favor, introduce un número entre 5 y 120 minutos';
    }
    
    if (!formData.goal) {
      newErrors.goal = 'Por favor, selecciona un objetivo';
    }
    
    if (!formData.preferences) {
      newErrors.preferences = 'Por favor, selecciona tus preferencias alimentarias';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidation = () => {
    const isValid = validateForm();
    setIsValid(isValid);
    return isValid;
  };

  // Distribuciones de macronutrientes según el objetivo
  const goalMacroDistributions = {
    'perdida': { protein: 40, carbs: 35, fats: 25 },
    'definicion': { protein: 45, carbs: 35, fats: 20 }, // Más proteína, menos grasa que pérdida
    'mantenimiento': { protein: 30, carbs: 40, fats: 30 },
    'aumento': { protein: 25, carbs: 50, fats: 25 }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia el objetivo, actualizar la distribución de macros
    if (name === 'goal' && value) {
      const distributionKey = goalToMacroDistribution[value] || 'mantenimiento';
      const distribution = goalMacroDistributions[distributionKey];
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        proteinPercentage: distribution.protein.toString(),
        carbsPercentage: distribution.carbs.toString(),
        fatsPercentage: distribution.fats.toString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    
    if (!isValid) {
      console.log('Validación del formulario fallida');
      return;
    }
    
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Calcular gramos de cada macronutriente basado en las calorías totales
      const totalCalories = parseInt(formData.calories, 10) || 0;
      const proteinPercentage = parseInt(formData.proteinPercentage, 10) || 30;
      const carbsPercentage = parseInt(formData.carbsPercentage, 10) || 40;
      const fatsPercentage = parseInt(formData.fatsPercentage, 10) || 30;
      
      // Asegurarse de que la suma de porcentajes sea 100%
      const totalPercentage = proteinPercentage + carbsPercentage + fatsPercentage;
      const normalizedProtein = Math.round((proteinPercentage / totalPercentage) * 100);
      const normalizedCarbs = Math.round((carbsPercentage / totalPercentage) * 100);
      const normalizedFats = 100 - normalizedProtein - normalizedCarbs; // Asegurar que sumen 100%
      
      // Calcular gramos para cada macronutriente
      const proteinGrams = Math.round((totalCalories * (normalizedProtein / 100)) / 4); // 4 kcal/g
      const carbsGrams = Math.round((totalCalories * (normalizedCarbs / 100)) / 4);     // 4 kcal/g
      const fatsGrams = Math.round((totalCalories * (normalizedFats / 100)) / 9);       // 9 kcal/g
      
      const requestBody = {
        ...formData,
        calories: totalCalories,
        mealsPerDay: parseInt(formData.mealsPerDay, 10) || 3,
        timePerMeal: parseInt(formData.timePerMeal, 10) || 30,
        macros: {
          protein: proteinGrams,
          carbs: carbsGrams,
          fats: fatsGrams,
          proteinPercentage: normalizedProtein,
          carbsPercentage: normalizedCarbs,
          fatsPercentage: normalizedFats
        }
      };
      
      console.log('Distribución de macronutrientes:', {
        protein: `${normalizedProtein}% (${proteinGrams}g)`,
        carbs: `${normalizedCarbs}% (${carbsGrams}g)`,
        fats: `${normalizedFats}% (${fatsGrams}g)`
      });
      
      console.log('Enviando solicitud a /api/ con datos:', JSON.stringify(requestBody, null, 2));
      
      const res = await fetch("/api/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });
      
      console.log('Respuesta recibida. Status:', res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al generar la dieta. Inténtalo de nuevo más tarde.');
      }

      const data = await res.json();
      console.log('Datos recibidos del backend:', JSON.stringify(data, null, 2));
      
      if (data.success && data.plan && data.plan.meals) {
        console.log('Primera comida recibida:', data.plan.meals[0]);
        
        // Primero, actualizar cada comida con los macronutrientes calculados
        const updatedMeals = data.plan.meals.map(meal => {
          const calculatedMacros = calculateMacros(meal.calories || 0);
          return {
            ...meal,
            proteins: meal.proteins || Math.round(calculatedMacros.proteins),
            carbs: meal.carbs || Math.round(calculatedMacros.carbs),
            fats: meal.fats || Math.round(calculatedMacros.fats)
          };
        });
        
        // Calcular totales sumando los valores de cada comida
        const totalMacros = updatedMeals.reduce((acc, meal) => ({
          proteins: acc.proteins + (meal.proteins || 0),
          carbs: acc.carbs + (meal.carbs || 0),
          fats: acc.fats + (meal.fats || 0)
        }), { proteins: 0, carbs: 0, fats: 0 });
        
        console.log('Comidas actualizadas con macros:', updatedMeals);
        console.log('Macronutrientes totales calculados:', totalMacros);
        
        // Actualizar el plan con las comidas modificadas y los totales
        data.plan.meals = updatedMeals;
        data.plan.total_macros = {
          proteins: Math.round(totalMacros.proteins),
          carbs: Math.round(totalMacros.carbs),
          fats: Math.round(totalMacros.fats)
        };
      }
      
      setDiet(data.success ? data.plan : null);
      setShowForm(false);
      
      // Función para calcular macronutrientes basados en calorías
      function calculateMacros(calories) {
        // Distribución estándar: 30% proteínas, 40% carbohidratos, 30% grasas
        const proteinsGrams = (calories * 0.3) / 4; // 4 kcal por gramo de proteína
        const fatsGrams = (calories * 0.3) / 9;     // 9 kcal por gramo de grasa
        const carbsGrams = (calories * 0.4) / 4;    // 4 kcal por gramo de carbohidrato
        
        return {
          proteins: proteinsGrams,
          carbs: carbsGrams,
          fats: fatsGrams
        };
      }
    } catch (err) {
      setApiError(err.message);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-neutral-50 flex items-center justify-center p-3 sm:p-4 ${!showForm ? 'py-8' : ''}`}>
      <div className={`w-full ${showForm ? 'max-w-md' : 'max-w-2xl'}`}>
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 shadow-lg transform ${showForm ? '-skew-y-2 sm:skew-y-0 sm:-rotate-2 sm:rounded-xl' : '-skew-y-3 sm:skew-y-0 sm:-rotate-3 sm:rounded-2xl'}`}></div>
          <div className={`relative bg-white ${!showForm ? 'shadow-lg rounded-xl' : 'shadow-md rounded-lg'} p-4 ${!showForm ? 'sm:p-5' : ''}`}>
            <div className="w-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner />
                </div>
              ) : showForm ? (
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
                          value={formData.calories}
                          onChange={handleChange}
                          error={errors.calories}
                          required
                        />
                        
                        <div className="space-y-3 py-2 border-t border-neutral-100 pt-4 mt-2">
                          <div className="space-y-3 bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4 text-center">Distribución de Macronutrientes</h3>
                            
                            {/* Barra de proteínas */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                  </div>
                                  <span className="font-medium">Proteínas</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-red-600">{formData.proteinPercentage}%</div>
                                  <div className="text-xs text-neutral-500">
                                    {Math.round((formData.calories * (formData.proteinPercentage / 100)) / 4)}g
                                  </div>
                                </div>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div 
                                  className="bg-red-500 h-2.5 rounded-full" 
                                  style={{ width: `${formData.proteinPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Barra de carbohidratos */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                  </div>
                                  <span className="font-medium">Carbohidratos</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-orange-600">{formData.carbsPercentage}%</div>
                                  <div className="text-xs text-neutral-500">
                                    {Math.round((formData.calories * (formData.carbsPercentage / 100)) / 4)}g
                                  </div>
                                </div>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div 
                                  className="bg-orange-500 h-2.5 rounded-full" 
                                  style={{ width: `${formData.carbsPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Barra de grasas */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 12c0-1.248-1.415-3.19-2.057-4.19-.773-1.2-2.318-1.81-4.443-1.81-2.125 0-3.67.61-4.443 1.81-.642 1-2.057 2.942-2.057 4.19 0 3.5 2.8 6 6 6s6-2.5 6-6z" />
                                    </svg>
                                  </div>
                                  <span className="font-medium">Grasas</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-yellow-600">{formData.fatsPercentage}%</div>
                                  <div className="text-xs text-neutral-500">
                                    {Math.round((formData.calories * (formData.fatsPercentage / 100)) / 9)}g
                                  </div>
                                </div>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div 
                                  className="bg-yellow-500 h-2.5 rounded-full" 
                                  style={{ width: `${formData.fatsPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Resumen de macronutrientes generados */}
                          {diet?.summary && (
                            <div className="mt-4 p-4 bg-white rounded-lg shadow">
                              <h3 className="text-lg font-semibold mb-4 text-center">Macronutrientes Generados</h3>
                                  
                                  {/* Barra de proteínas */}
                                  <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="flex items-center">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                        Proteínas: {diet.summary.totalProteins}%
                                      </span>
                                      <span className="font-medium">
                                        {Math.round((diet.summary.totalCalories * (diet.summary.totalProteins / 100)) / 4)}g
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div 
                                        className="bg-red-500 h-2.5 rounded-full" 
                                        style={{ width: `${diet.summary.totalProteins}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  {/* Barra de carbohidratos */}
                                  <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="flex items-center">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                        Carbohidratos: {diet.summary.totalCarbs}%
                                      </span>
                                      <span className="font-medium">
                                        {Math.round((diet.summary.totalCalories * (diet.summary.totalCarbs / 100)) / 4)}g
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div 
                                        className="bg-orange-500 h-2.5 rounded-full" 
                                        style={{ width: `${diet.summary.totalCarbs}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  {/* Barra de grasas */}
                                  <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span className="flex items-center">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                        Grasas: {diet.summary.totalFats}%
                                      </span>
                                      <span className="font-medium">
                                        {Math.round((diet.summary.totalCalories * (diet.summary.totalFats / 100)) / 9)}g
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div 
                                        className="bg-yellow-500 h-2.5 rounded-full" 
                                        style={{ width: `${diet.summary.totalFats}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  {/* Indicador de diferencia */}
                                  <div className="mt-4 pt-3 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">Diferencia con objetivo:</p>
                                    <div className="grid grid-cols-3 gap-2">
                                      <span className={`text-xs px-2 py-1 rounded text-center ${
                                        Math.abs(diet.summary.totalProteins - formData.proteinPercentage) > 5 
                                          ? 'bg-red-100 text-red-700' 
                                          : 'bg-green-100 text-green-700'
                                      }`}>
                                        {diet.summary.totalProteins - formData.proteinPercentage > 0 ? '+' : ''}
                                        {diet.summary.totalProteins - formData.proteinPercentage}%
                                        <div className="text-xs">proteína</div>
                                      </span>
                                      <span className={`text-xs px-2 py-1 rounded text-center ${
                                        Math.abs(diet.summary.totalCarbs - formData.carbsPercentage) > 5 
                                          ? 'bg-red-100 text-red-700' 
                                          : 'bg-green-100 text-green-700'
                                      }`}>
                                        {diet.summary.totalCarbs - formData.carbsPercentage > 0 ? '+' : ''}
                                        {diet.summary.totalCarbs - formData.carbsPercentage}%
                                        <div className="text-xs">carbs</div>
                                      </span>
                                      <span className={`text-xs px-2 py-1 rounded text-center ${
                                        Math.abs(diet.summary.totalFats - formData.fatsPercentage) > 5 
                                          ? 'bg-red-100 text-red-700' 
                                          : 'bg-green-100 text-green-700'
                                      }`}>
                                        {diet.summary.totalFats - formData.fatsPercentage > 0 ? '+' : ''}
                                        {diet.summary.totalFats - formData.fatsPercentage}%
                                        <div className="text-xs">grasas</div>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                        </div>
                      </div>
                      <FormInput
                          label="Comidas por día"
                          name="mealsPerDay"
                          type="number"
                          min="1"
                          max="6"
                          value={formData.mealsPerDay}
                          onChange={handleChange}
                          error={errors.mealsPerDay}
                          required
                        />
                        <FormInput
                          label="Tiempo máximo por comida (minutos)"
                          name="timePerMeal"
                          type="number"
                          min="5"
                          max="120"
                          value={formData.timePerMeal}
                          onChange={handleChange}
                          error={errors.timePerMeal}
                          required
                        />
                        <div className="space-y-2">
                          <FormInput
                            label="Objetivo"
                            name="goal"
                            type="select"
                            options={goalOptions}
                            value={formData.goal}
                            onChange={handleChange}
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
                          value={formData.preferences}
                          onChange={handleChange}
                          error={errors.preferences}
                          required
                        />
                        <FormInput
                          label="Alergias"
                          name="allergies"
                          type="text"
                          placeholder="p.ej: marisco, frutos secos, etc."
                          value={formData.allergies}
                          onChange={handleChange}
                          error={errors.allergies}
                        />
                        <FormInput
                          label="Alimentos no deseados"
                          name="forbiddenFoods"
                          type="text"
                          placeholder="p.ej: legumbres, pescado, etc."
                          value={formData.forbiddenFoods}
                          onChange={handleChange}
                          error={errors.forbiddenFoods}
                        />
                        <FormInput
                          label="Alimentos favoritos"
                          name="favoriteFoods"
                          type="text"
                          placeholder="p.ej: carne, pasta, etc."
                          value={formData.favoriteFoods}
                          onChange={handleChange}
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
              ) : (
                <div className="w-full">
                  <div className="bg-white rounded-lg">
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
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                          <h3 className="text-xs font-semibold text-neutral-500 mb-1">Comidas/día</h3>
                          <p className="text-sm text-neutral-800">{formData.mealsPerDay}</p>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                          <h3 className="text-xs font-semibold text-neutral-500 mb-1">Tiempo/comida</h3>
                          <p className="text-sm text-neutral-800">{formData.timePerMeal} min</p>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                          <h3 className="text-xs font-semibold text-neutral-500 mb-1">Preferencias</h3>
                          <p className="text-sm text-neutral-800">
                            {formData.preferences ? preferenceOptions.find(opt => opt.value === formData.preferences)?.label || formData.preferences : 'No especificadas'}
                          </p>
                        </div>
                      </div>
                      {/* Sección de Macros Totales */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                          <div className="flex items-center justify-center space-x-2 mb-1">
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                            <h3 className="text-xs font-semibold text-red-700">Proteínas</h3>
                          </div>
                          <p className="text-lg font-bold text-red-600 mt-1">
                            {diet.total_macros?.proteins || '0'}g
                          </p>
                        </div>
                        
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-center">
                          <div className="flex items-center justify-center space-x-2 mb-1">
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-600">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <h3 className="text-xs font-semibold text-orange-700">Carbohidratos</h3>
                          </div>
                          <p className="text-lg font-bold text-orange-600 mt-1">
                            {diet.total_macros?.carbs || '0'}g
                          </p>
                        </div>
                        
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-center">
                          <div className="flex items-center justify-center space-x-2 mb-1">
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 12c0-1.248-1.415-3.19-2.057-4.19-.773-1.2-2.318-1.81-4.443-1.81-2.125 0-3.67.61-4.443 1.81-.642 1-2.057 2.942-2.057 4.19 0 3.5 2.8 6 6 6s6-2.5 6-6z" />
                              </svg>
                            </div>
                            <h3 className="text-xs font-semibold text-yellow-700">Grasas</h3>
                          </div>
                          <p className="text-lg font-bold text-yellow-600 mt-1">
                            {diet.total_macros?.fats || '0'}g
                          </p>
                        </div>
                      </div>
                      
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
                          onClick={() => {
                            setShowForm(true);
                            setDiet(null);
                            setErrors({});
                            setFormData({
                              calories: '',
                              mealsPerDay: '3',
                              allergies: '',
                              preferences: '',
                              forbiddenFoods: '',
                              timePerMeal: '30',
                              goal: '',
                              favoriteFoods: ''
                            });
                          }}
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                         >
                          Generar nueva dieta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
