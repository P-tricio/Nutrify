import { useState } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import DietForm from './components/DietForm';
import DietResults from './components/DietResults';

// Opciones para los selects
export const goalOptions = [
  { value: 'perdida', label: 'Pérdida de peso' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'aumento', label: 'Aumento de masa muscular' },
  { value: 'definicion', label: 'Definición muscular' },
];

// Mapeo entre opciones de objetivo y distribución de macros
export const goalToMacroDistribution = {
  'perdida': 'perdida',
  'definicion': 'definicion',
  'mantenimiento': 'mantenimiento',
  'aumento': 'aumento'
};

export const preferenceOptions = [
  { value: 'omnivoro', label: 'Omnívoro' },
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'vegano', label: 'Vegano' },
  { value: 'sin_gluten', label: 'Sin gluten' },
  { value: 'sin_lactosa', label: 'Sin lactosa' },
];

// Distribuciones de macronutrientes según el objetivo
export const goalMacroDistributions = {
  'perdida': { protein: 40, carbs: 35, fats: 25 },
  'definicion': { protein: 45, carbs: 35, fats: 20 },
  'mantenimiento': { protein: 30, carbs: 40, fats: 30 },
  'aumento': { protein: 25, carbs: 50, fats: 25 }
};

function App() {
  const [formData, setFormData] = useState({
    calories: '',
    mealsPerDay: '3',
    allergies: '',
    preferences: '',
    forbiddenFoods: '',
    goal: '',
    favoriteFoods: '',
    proteinPercentage: 30,
    carbsPercentage: 40,
    fatsPercentage: 30
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
      const totalCalories = parseInt(formData.calories, 10) || 0;
      const proteinPercentage = parseInt(formData.proteinPercentage, 10) || 30;
      const carbsPercentage = parseInt(formData.carbsPercentage, 10) || 40;
      const fatsPercentage = parseInt(formData.fatsPercentage, 10) || 30;
      
      const totalPercentage = proteinPercentage + carbsPercentage + fatsPercentage;
      const normalizedProtein = Math.round((proteinPercentage / totalPercentage) * 100);
      const normalizedCarbs = Math.round((carbsPercentage / totalPercentage) * 100);
      const normalizedFats = 100 - normalizedProtein - normalizedCarbs;
      
      const proteinGrams = Math.round((totalCalories * (normalizedProtein / 100)) / 4);
      const carbsGrams = Math.round((totalCalories * (normalizedCarbs / 100)) / 4);
      const fatsGrams = Math.round((totalCalories * (normalizedFats / 100)) / 9);
      
      const requestBody = {
        ...formData,
        calories: totalCalories,
        mealsPerDay: parseInt(formData.mealsPerDay, 10) || 3,
        
        macros: {
          protein: proteinGrams,
          carbs: carbsGrams,
          fats: fatsGrams,
          proteinPercentage: normalizedProtein,
          carbsPercentage: normalizedCarbs,
          fatsPercentage: normalizedFats
        }
      };
      
      console.log('Enviando solicitud a /api/ con datos:', JSON.stringify(requestBody, null, 2));
      
      let res;
      let data;
      
      try {
        console.log('Enviando solicitud a la API...');
        res = await fetch("/api/", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });
        
        console.log('Respuesta HTTP recibida. Status:', res.status);
        
        // Intentar leer el cuerpo de la respuesta como JSON
        const responseText = await res.text();
        console.log('Contenido de la respuesta (texto):', responseText);
        
        try {
          data = responseText ? JSON.parse(responseText) : {};
          console.log('Respuesta del servidor (parseada):', JSON.stringify(data, null, 2));
        } catch (parseError) {
          console.error('Error al analizar la respuesta JSON:', parseError);
          throw new Error('La respuesta del servidor no es un JSON válido.');
        }
        
        if (!res.ok) {
          throw new Error(data.error || `Error del servidor: ${res.status} ${res.statusText}`);
        }
        
        if (!data) {
          throw new Error('El servidor no devolvió ningún dato.');
        }
      } catch (error) {
        console.error('Error en la petición:', {
          message: error.message,
          status: res?.status,
          response: data || 'No hay datos de respuesta',
          stack: error.stack
        });
        throw error; // Relanzar el error para que lo capture el catch externo
      }
      
      if (data.success && data.plan && data.plan.meals) {
        const updatedMeals = data.plan.meals.map(meal => {
          const calculatedMacros = calculateMacros(meal.calories || 0);
          return {
            ...meal,
            proteins: meal.proteins || Math.round(calculatedMacros.proteins),
            carbs: meal.carbs || Math.round(calculatedMacros.carbs),
            fats: meal.fats || Math.round(calculatedMacros.fats)
          };
        });
        
        const totalMacros = updatedMeals.reduce((acc, meal) => ({
          proteins: acc.proteins + (meal.proteins || 0),
          carbs: acc.carbs + (meal.carbs || 0),
          fats: acc.fats + (meal.fats || 0)
        }), { proteins: 0, carbs: 0, fats: 0 });
        
        data.plan.meals = updatedMeals;
        data.plan.total_macros = {
          proteins: Math.round(totalMacros.proteins),
          carbs: Math.round(totalMacros.carbs),
          fats: Math.round(totalMacros.fats)
        };
      }
      
      setDiet(data.success ? data.plan : null);
      setShowForm(false);
    } catch (err) {
      console.error('Error en handleSubmit:', {
        message: err.message,
        stack: err.stack,
        response: err.response ? await err.response.text().catch(() => 'No se pudo leer la respuesta') : 'No hay respuesta'
      });
      setApiError(err.message || 'Error al procesar la respuesta del servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMacros = (calories) => {
    const proteinsGrams = (calories * 0.3) / 4;
    const fatsGrams = (calories * 0.3) / 9;
    const carbsGrams = (calories * 0.4) / 4;
    
    return {
      proteins: proteinsGrams,
      carbs: carbsGrams,
      fats: fatsGrams
    };
  };

  const handleNewDiet = () => {
    setShowForm(true);
    setDiet(null);
  };

  return (
    <div className={`min-h-screen bg-neutral-50 flex items-center justify-center p-3 sm:p-4 ${!showForm ? 'py-8' : ''}`}>
      <div className={`w-full ${showForm ? 'max-w-md' : 'max-w-2xl'}`}>
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 shadow-lg transform ${showForm ? '-skew-y-2 sm:skew-y-0 sm:-rotate-2 sm:rounded-xl' : '-skew-y-3 sm:skew-y-0 sm:-rotate-3 sm:rounded-2xl'}`}></div>
          <div className={`relative bg-white ${showForm ? 'shadow-md rounded-lg' : 'shadow-lg rounded-xl'} p-4 ${!showForm ? 'sm:p-5' : ''}`}>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            ) : showForm ? (
              <DietForm 
                formData={formData}
                errors={errors}
                isLoading={isLoading}
                apiError={apiError}
                goalOptions={goalOptions}
                preferenceOptions={preferenceOptions}
                diet={diet}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                isValid={isValid}
              />
            ) : (
              <DietResults 
                formData={formData}
                goalOptions={goalOptions}
                preferenceOptions={preferenceOptions}
                diet={diet}
                onNewDiet={handleNewDiet}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
