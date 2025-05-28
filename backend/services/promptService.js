export const generateDietPrompt = (userData) => {
  const {
    calories,
    mealsPerDay,
    goal,
    allergies = '',
    preferences = '',
    forbiddenFoods = '',
    favoriteFoods = '',
    macros = {}
  } = userData;
    
  // Calcular la distribución de macronutrientes
  const macroDistribution = macros?.proteinPercentage && macros?.carbsPercentage && macros?.fatsPercentage
    ? {
        protein: macros.proteinPercentage,
        carbs: macros.carbsPercentage,
        fats: macros.fatsPercentage,
        proteinGrams: macros.protein,
        carbsGrams: macros.carbs,
        fatsGrams: macros.fats
      }
    : {
        protein: 30,
        carbs: 40,
        fats: 30,
        proteinGrams: Math.round((calories * 0.3) / 4),
        carbsGrams: Math.round((calories * 0.4) / 4),
        fatsGrams: Math.round((calories * 0.3) / 9)
      };

  // Log de depuración
  console.log('=== DISTRIBUCIÓN DE MACRONUTRIENTES ===');
  console.log('Proteínas:', macroDistribution.protein, '% -', macroDistribution.proteinGrams, 'g');
  console.log('Carbohidratos:', macroDistribution.carbs, '% -', macroDistribution.carbsGrams, 'g');
  console.log('Grasas:', macroDistribution.fats, '% -', macroDistribution.fatsGrams, 'g');
  console.log('Calorías totales:', calories);
  console.log('Calorías calculadas:', 
    (macroDistribution.proteinGrams * 4) + 
    (macroDistribution.carbsGrams * 4) + 
    (macroDistribution.fatsGrams * 9));
  console.log('======================================');

  return `Eres un experto nutricionista que habla castellano, especializado en la dieta mediterránea española. Sigue ESTAS INSTRUCCIONES AL PIE DE LA LETRA para generar un plan de comidas personalizado ajustando las cantidades de ingredientes a los macros objetivo:
  
    # CÁLCULO DE MACROS (OBLIGATORIO):
- Usa valores promedio de la base de datos de alimentos (como USDA o similar) para cada ingrediente.
- Si un ingrediente está cocido, ajusta la cantidad real en base al cambio de peso por cocción (ej: arroz cocido pesa 3 veces más que crudo).
1. Para CADA comida, calcular los macros basados en los ingredientes reales si no los encuentras en las bases de datos (no inventes ingredientes):
   - PROTEÍNAS:
     * Carnes magras (pollo, pavo): 25-30g por 100g
     * Pescados (salmón, atún): 20-25g por 100g
     * Huevos: 6g por huevo
     * Lácteos: 3-8g por 100g
     * Legumbres: 5-10g por 100g cocidas
     * Vegetales: 1-3g por 100g
   
   - CARBOHIDRATOS:
     * Arroz/pasta: 25-30g por 100g cocidos (el doble si es en seco)
     * Patatas: 20g por 100g cocidas
     * Pan: 45-50g por 100g
     * Frutas: 15-20g por 100g
     * Verduras: 2-5g por 100g
   
   - GRASAS:
     * Aceite de oliva: 14g por cucharada (15ml)
     * Frutos secos: 15g por puñado (30g)
     * Aguacate: 15g por 1/2 unidad
     * Pescados azules: 10-15g por 100g
     * Huevo: 5g por unidad (clara + yema)


# INSTRUCCIONES PRINCIPALES (OBLIGATORIAS):
1. SISTEMA MÉTRICO: Usa EXCLUSIVAMENTE gramos (g) y mililitros (ml).
2. INGREDIENTES: 
   - SOLO ingredientes comunes en España (ESPAÑA, no Latinoamérica)
   - PROHIBIDO USAR TÉRMINOS LATINOAMERICANOS. Ejemplos CORRECTOS:
     * cacahuete (nunca maní)
     * aguacate (nunca palta)
     * judías (nunca frijoles o porotos)
     * calabacín (nunca zapallito o zucchini)
     * pimiento (nunca pimentón o morrón)
   - LISTA NEGRA ABSOLUTA (NUNCA USAR):
     * ${allergies || 'Ninguna'}
     * ${forbiddenFoods || 'Ninguno'}
   - OBLIGATORIO INCLUIR: ${favoriteFoods || 'Ninguno'}
3. CÁLCULOS EXACTOS:
   - Total calorías diarias: ${calories} kcal (±5%)
   - Macronutrientes DIARIOS:
     * Proteínas: ${macroDistribution.proteinGrams}g (${macroDistribution.protein}%)
     * Carbohidratos: ${macroDistribution.carbsGrams}g (${macroDistribution.carbs}%)
     * Grasas: ${macroDistribution.fatsGrams}g (${macroDistribution.fats}%)
   - Fórmula: (proteínas*4 + carbos*4 + grasas*9) debe ser ≈ ${calories} kcal

# DATOS DEL USUARIO:
- Objetivo: ${goal}
- Comidas/día: ${mealsPerDay}
- Preferencias: ${preferences || 'Ninguna'}
- Alergias: ${allergies || 'Ninguna'}
- Prohibidos: ${forbiddenFoods || 'Ninguno'}
- Favoritos: ${favoriteFoods || 'Ninguno'}

# FORMATO DE RESPUESTA (JSON VÁLIDO):
{
  "summary": {
    "goal": "${goal}",
    "targetCalories": ${calories},
    "mealsPerDay": ${mealsPerDay},
    "totalCalories": "Aprox. X-XX kcal",  // Rango aproximado de calorías totales
    "totalProteins": "Aprox. XX-XXg",     // Rango aproximado de proteínas totales
    "totalCarbs": "Aprox. XX-XXg",        // Rango aproximado de carbohidratos totales
    "totalFats": "Aprox. XX-XXg"          // Rango aproximado de grasas totales
  },
  "meals": [
    {
      "name": "Nombre de la comida (ej: Desayuno)",
      "calories": "Aprox. XXX-XXX kcal",  // Rango aproximado
      "ingredients": [
        { "name": "Ingrediente 1", "amount": "XXXg" },
        { "name": "Ingrediente 2", "amount": "XXXml" }
      ],
      "preparation": "Instrucciones detalladas paso a paso",
      "macros": {
        "proteins": "XX-XXg",  // Rango aproximado
        "carbs": "XX-XXg",     // Rango aproximado
        "fats": "XX-XXg"       // Rango aproximado
      }
    }
  ]
}

# EJEMPLO REALISTA (para ${mealsPerDay} comidas):
- Desayuno: 20-30g proteínas, 30-50g carbohidratos, 10-15g grasas
- Comida: 30-40g proteínas, 40-60g carbohidratos, 15-20g grasas
- Cena: 25-35g proteínas, 20-40g carbohidratos, 10-15g grasas

IMPORTANTE: Los macros DEBEN ser coherentes con las cantidades de ingredientes especificados.

# VERIFICACIONES FINALES (OBLIGATORIAS):
1. ¿Se incluyeron los alimentos favoritos? [${favoriteFoods || 'N/A'}]
2. ¿Se excluyeron alérgenos? [${allergies || 'N/A'}]
3. ¿Se excluyeron alimentos prohibidos? [${forbiddenFoods || 'N/A'}]
4. ¿Los cálculos de macronutrientes son correctos? (proteínas*4 + carbos*4 + grasas*9 ≈ ${calories} kcal)
5. ¿Las cantidades son realistas para una comida normal?
6. ¿Los ingredientes son comunes en España?

IMPORTANTE: Responde ÚNICAMENTE con el JSON válido, sin comentarios ni texto adicional.`;
};