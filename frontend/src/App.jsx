import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import GenericSpinner from "./components/GenericSpinner";
import DietForm from "./components/DietForm";
import DietResults from "./components/DietResults";
import config from "./config.js";

export const goalOptions = [
  { value: "perdida", label: "Pérdida de peso" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "aumento", label: "Aumento de masa muscular" },
];

export const goalMacroDistributions = {
  perdida: { protein: 40, carbs: 35, fats: 25 },
  mantenimiento: { protein: 30, carbs: 40, fats: 30 },
  aumento: { protein: 25, carbs: 50, fats: 25 },
};

export const goalToMacroDistribution = {
  perdida: "perdida",
  mantenimiento: "mantenimiento",
  aumento: "aumento",
};

export const preferenceOptions = [
  { value: "omnivoro", label: "Omnívoro" },
  { value: "vegetariano", label: "Vegetariano" },
  { value: "vegano", label: "Vegano" },
  { value: "sin_gluten", label: "Sin gluten" },
  { value: "sin_lactosa", label: "Sin lactosa" },
];

function App() {
  const { loginWithRedirect, logout, isAuthenticated, isLoading: authLoading, user } = useAuth0();

  // Determine where the user should be redirected after logging out.
  const logoutUrl = config.appUrl || window.location.origin;

  const [formData, setFormData] = useState({
    calories: "2000",
    mealsPerDay: "3",
    allergies: "",
    preferences: "",
    forbiddenFoods: "",
    goal: "",
    favoriteFoods: "",
    proteinPercentage: 30,
    carbsPercentage: 40,
    fatsPercentage: 30,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [diet, setDiet] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [isValid, setIsValid] = useState(true);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.calories || isNaN(formData.calories) || formData.calories < 1000 || formData.calories > 10000)
      newErrors.calories = "Introduce entre 1000 y 10000 kcal";
    if (!formData.mealsPerDay || isNaN(formData.mealsPerDay) || formData.mealsPerDay < 1 || formData.mealsPerDay > 6)
      newErrors.mealsPerDay = "Introduce entre 1 y 6 comidas";
    if (!formData.goal) newErrors.goal = "Selecciona un objetivo";
    if (!formData.preferences) newErrors.preferences = "Selecciona preferencias";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "goal") {
      const dist = goalMacroDistributions[goalToMacroDistribution[value]];
      setFormData((p) => ({ ...p, [name]: value, proteinPercentage: dist.protein, carbsPercentage: dist.carbs, fatsPercentage: dist.fats }));
    } else if (name === "calories") {
      const calVal = value === "" ? "" : value.replace(/\D/g, "");
      setFormData((p) => ({ ...p, [name]: calVal }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
    if (errors[name]) setErrors((e) => ({ ...e, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setApiError(null);

    try {
      const totalCalories = parseInt(formData.calories, 10);
      const proteinPercentage = parseInt(formData.proteinPercentage);
      const carbsPercentage = parseInt(formData.carbsPercentage);
      const fatsPercentage = 100 - proteinPercentage - carbsPercentage;

      const proteinGrams = Math.round((totalCalories * (proteinPercentage / 100)) / 4);
      const carbsGrams = Math.round((totalCalories * (carbsPercentage / 100)) / 4);
      const fatsGrams = Math.round((totalCalories * (fatsPercentage / 100)) / 9);

      const config = (await import("./config.js")).default;
      const res = await fetch(`${config.apiUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          calories: totalCalories,
          mealsPerDay: parseInt(formData.mealsPerDay),
          macros: {
            protein: proteinGrams,
            carbs: carbsGrams,
            fats: fatsGrams,
            proteinPercentage,
            carbsPercentage,
            fatsPercentage,
          },
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || "Error del servidor");

      if (data.success && data.plan?.meals) {
        const updatedMeals = data.plan.meals.map((meal) => {
          const { proteins, carbs, fats } = calculateMacros(meal.calories || 0);
          return {
            ...meal,
            proteins: meal.proteins || Math.round(proteins),
            carbs: meal.carbs || Math.round(carbs),
            fats: meal.fats || Math.round(fats),
          };
        });

        const totalMacros = updatedMeals.reduce(
          (acc, m) => ({ proteins: acc.proteins + m.proteins, carbs: acc.carbs + m.carbs, fats: acc.fats + m.fats }),
          { proteins: 0, carbs: 0, fats: 0 }
        );

        data.plan.meals = updatedMeals;
        data.plan.total_macros = {
          proteins: Math.round(totalMacros.proteins),
          carbs: Math.round(totalMacros.carbs),
          fats: Math.round(totalMacros.fats),
        };
      }

      setDiet(data.success ? data.plan : null);
      setShowForm(false);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMacros = (calories) => ({
    proteins: (calories * 0.3) / 4,
    carbs: (calories * 0.4) / 4,
    fats: (calories * 0.3) / 9,
  });

  const handleNewDiet = () => {
    setShowForm(true);
    setDiet(null);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <GenericSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-100">
        <h1 className="text-2xl font-bold mb-4">Inicia sesión para acceder a la app</h1>
        <button
          onClick={() => loginWithRedirect()}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-3 sm:p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-700">Bienvenido, {user?.name}</span>
        <button onClick={() => logout({ returnTo: logoutUrl })} className="text-sm text-red-600 hover:underline">
          Cerrar sesión
        </button>
      </div>
      <div className="w-full max-w-7xl mx-auto">
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 shadow-lg transform ${showForm ? "sm:rounded-xl" : "sm:rounded-2xl"}`}></div>
          <div className={`relative bg-white ${showForm ? "shadow-md rounded-lg" : "shadow-lg rounded-xl"} p-4 ${!showForm ? "sm:p-5" : ""}`} style={{ minHeight: "calc(100vh - 2rem)" }}>
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
