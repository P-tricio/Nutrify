import React from 'react';

// Componente para mostrar un macronutriente con su icono
const MacroItem = ({ icon, value, label, color = 'gray' }) => (
  <div className="flex items-center space-x-2">
    <span className={`text-${color}-500`}>
      {icon}
    </span>
    <span className={`text-xs sm:text-sm text-${color}-600`}>
      {value}g {label}
    </span>
  </div>
);

// Iconos para los macronutrientes
const icons = {
  proteins: (
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
</svg>
  ),
  carbs: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  fats: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </svg>
  ),
  calorias: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
  </svg>
  
  )
};

const MealCard = ({ meal }) => {
  // Usar directamente los valores proporcionados por el backend
  const macros = {
    proteins: meal.proteins || 0,
    carbs: meal.carbs || 0,
    fats: meal.fats || 0,
    calories: meal.calories || 0
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">{meal.name}</h3>
        <div className="flex flex-wrap gap-3 mt-2 sm:mt-0">
          {/* Proteínas */}
          <div className="flex items-center space-x-1 bg-red-50 px-2 py-1 rounded-full">
            <span className="text-red-500">{icons.proteins}</span>
            <span className="text-xs font-medium text-red-700">{macros.proteins}g</span>
          </div>
          
          {/* Carbohidratos */}
          <div className="flex items-center space-x-1 bg-orange-50 px-2 py-1 rounded-full">
            <span className="text-orange-500">{icons.carbs}</span>
            <span className="text-xs font-medium text-orange-700">{macros.carbs}g</span>
          </div>
          
          {/* Grasas */}
          <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
            <span className="text-yellow-500">{icons.fats}</span>
            <span className="text-xs font-medium text-yellow-700">{macros.fats}g</span>
          </div>
          
          {/* Calorías */}
          <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
            <span className="text-green-500">{icons.calorias}</span>
            <span className="text-xs font-medium text-green-700">{macros.calories} kcal</span>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="w-full">
          <h4 className="text-lg font-medium text-gray-800">Ingredientes principales</h4>
          <p className="mt-1 text-gray-600 whitespace-pre-wrap">{meal.ingredients}</p>
        </div>
        {meal.preparation && (
          <div className="w-full mt-4">
            <h4 className="text-lg font-medium text-gray-800">Preparación</h4>
            <p className="mt-1 text-gray-600 whitespace-pre-wrap">{meal.preparation}</p>
          </div>
        )}
        {meal.notes && (
          <div className="w-full mt-4">
            <h4 className="text-lg font-medium text-gray-800">Notas</h4>
            <p className="mt-1 text-gray-600 whitespace-pre-wrap">{meal.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealCard;
