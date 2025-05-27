import React, { useState, useEffect } from 'react';

// Mapeo de objetivos a porcentajes de ajuste de calorías
const goalToCalorieAdjustment = {
  'perdida': -0.15,        // -15% para pérdida de peso
  'mantenimiento': 0,     // 0% para mantenimiento
  'aumento': 0.15         // +15% para aumento de masa muscular
};

const CalorieCalculator = ({ onCalculate, selectedGoal = 'mantenimiento', goalOptions }) => { // Añadimos goalOptions como prop
  const [formData, setFormData] = useState({
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    activityLevel: '1.2',
    goal: '0'
  });

  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const activityLevels = [
    { value: '1.2', label: 'Sedentario (poco o ningún ejercicio)' },
    { value: '1.375', label: 'Ligera actividad (ejercicio ligero 1-3 días/semana)' },
    { value: '1.55', label: 'Moderada (ejercicio moderado 3-5 días/semana)' },
    { value: '1.725', label: 'Activo (ejercicio intenso 6-7 días/semana)' },
    { value: '1.9', label: 'Muy activo (ejercicio muy intenso o trabajo físico)' }
  ];

  // Usamos el objetivo seleccionado para determinar el ajuste calórico
  const [goalAdjustment, setGoalAdjustment] = useState(goalToCalorieAdjustment[selectedGoal] || 0);
  
  // Actualizamos el ajuste cuando cambia el objetivo seleccionado
  useEffect(() => {
    setGoalAdjustment(goalToCalorieAdjustment[selectedGoal] || 0);
  }, [selectedGoal]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.age || formData.age < 15 || formData.age > 100) {
      newErrors.age = 'Edad debe estar entre 15 y 100 años';
    }
    if (!formData.weight || formData.weight < 30 || formData.weight > 250) {
      newErrors.weight = 'Peso debe estar entre 30kg y 250kg';
    }
    if (!formData.height || formData.height < 120 || formData.height > 250) {
      newErrors.height = 'Altura debe estar entre 120cm y 250cm';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateCalories = (e) => {
    // Prevenir el comportamiento por defecto del formulario
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    
    if (!validateForm()) {
      console.log('Validación fallida');
      return false;
    }
    
    console.log('Datos del formulario:', formData);
    
    const { gender, age, weight, height, activityLevel } = formData;
    
    // Asegurarse de que los valores sean números
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseFloat(age);
    
    console.log('Valores numéricos procesados:', { weightNum, heightNum, ageNum });
    
    if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum)) {
      console.error('Valores inválidos para el cálculo');
      return;
    }
    
    // Fórmula de Harris-Benedict
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weightNum) + (4.799 * heightNum) - (5.677 * ageNum);
    } else {
      bmr = 447.593 + (9.247 * weightNum) + (3.098 * heightNum) - (4.330 * ageNum);
    }
    
    const tdee = bmr * parseFloat(activityLevel);
    // Redondear a la centena más cercana (ej: 2134 -> 2100, 2167 -> 2200)
    const adjustedCalories = Math.round(tdee * (1 + goalAdjustment) / 100) * 100;
    
    console.log('Cálculos intermedios:', { bmr, tdee, goalAdjustment, adjustedCalories });
    
    const resultData = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      adjustedCalories,
      goal: goalAdjustment * 100
    };
    
    setResult(resultData);
    
    // Llamar a onCalculate con las calorías calculadas
    console.log('Llamando a onCalculate con:', adjustedCalories);
    
    // Forzar la actualización incluso si onCalculate no está definido
    if (typeof onCalculate === 'function') {
      onCalculate(adjustedCalories);
    } else {
      console.warn('onCalculate no es una función, pero continuando con el valor:', adjustedCalories);
      // Si onCalculate no está definido, actualizamos directamente el campo
      const caloriesInput = document.querySelector('input[name="calories"]');
      if (caloriesInput) {
        caloriesInput.value = adjustedCalories;
        // Disparar evento de cambio manualmente
        const event = new Event('input', { bubbles: true });
        caloriesInput.dispatchEvent(event);
        console.log('Campo de calorías actualizado manualmente');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Calculadora de calorías diarias</h2>
      
      <form onSubmit={calculateCalories} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Género */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Género</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  className="text-primary-600"
                />
                <span className="ml-2">Hombre</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  className="text-primary-600"
                />
                <span className="ml-2">Mujer</span>
              </label>
            </div>
          </div>

          {/* Edad */}
          <div className="space-y-2">
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Edad (años)
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="15"
              max="100"
              required
            />
            {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
          </div>

          {/* Peso */}
          <div className="space-y-2">
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              Peso (kg)
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="30"
              max="250"
              step="0.1"
              required
            />
            {errors.weight && <p className="mt-1 text-xs text-red-600">{errors.weight}</p>}
          </div>

          {/* Altura */}
          <div className="space-y-2">
            <label htmlFor="height" className="block text-sm font-medium text-gray-700">
              Altura (cm)
            </label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="120"
              max="250"
              required
            />
            {errors.height && <p className="mt-1 text-xs text-red-600">{errors.height}</p>}
          </div>

          {/* Nivel de actividad */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700">
              Nivel de actividad física
            </label>
            <select
              id="activityLevel"
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              {activityLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Objetivo (mostrado solo si se proporcionan goalOptions) */}
          {goalOptions && (
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
                Objetivo
              </label>
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm text-gray-700">
                  {goalOptions.find(opt => opt.value === selectedGoal)?.label || 'No especificado'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Ajuste calórico: {goalAdjustment > 0 ? '+' : ''}{(goalAdjustment * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex space-x-3">
          <button
            type="button"
            onClick={calculateCalories}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            Calcular Calorías
          </button>
          <button
            type="button"
            onClick={() => handleChange({ target: { name: 'calories', value: '' } })}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Limpiar
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Resultados</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">TMB (Tasa Metabólica Basal):</span> {result.bmr.toLocaleString()} kcal/día
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">TDEE (Gasto Calórico Diario):</span> {result.tdee.toLocaleString()} kcal/día
            </p>
            <p className="text-lg font-semibold text-primary-700 mt-3">
              Calorías diarias recomendadas: {result.adjustedCalories.toLocaleString()} kcal/día
              {result.goal !== 0 && (
                <span className="block text-sm font-normal text-gray-600">
                  ({result.goal > 0 ? '+' : ''}{result.goal}% de ajuste por objetivo)
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalorieCalculator;
