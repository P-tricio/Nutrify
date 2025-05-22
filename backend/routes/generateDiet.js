import express from "express";
import { body, validationResult } from "express-validator";
const router = express.Router();
require('dotenv').config();

// Configuración de la API
const API_CONFIG = {
  OPENROUTER: {
    URL: process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions',
    MODEL: process.env.OPENROUTER_MODEL || 'qwen/qwen3-14b:free',
    REFERER: process.env.APP_URL || 'http://localhost:5173',
    TITLE: process.env.APP_TITLE || 'Diet Generator'
  },
  NUTRITION: {
    PROTEIN_CALORIES_PER_GRAM: 4,
    CARBS_CALORIES_PER_GRAM: 4,
    FAT_CALORIES_PER_GRAM: 9,
    DEFAULT_MEALS_PER_DAY: 3,
    MIN_CALORIES: 1000,
    MAX_CALORIES: 5000
  }
};

// Middleware para parsear JSON
router.use(express.json());

// Validación de entrada simplificada
const validateInput = [
  body('calories').optional().isNumeric().withMessage('Calorías debe ser un número'),
  body('mealsPerDay').optional().isInt({ min: 1, max: 6 }).withMessage('Comidas por día debe ser entre 1 y 6'),
  body('allergies').optional().isString().trim(),
  body('preferences').optional().isString().trim(),
  body('forbiddenFoods').optional().isString().trim(),
  body('supermarket').optional().isString().trim(),
  body('cookingLevel').optional().isString().trim(),
  body('timePerMeal').optional().isInt({ min: 5 }).withMessage('Tiempo por comida debe ser al menos 5 minutos'),
  body('goal').optional().isString().trim()
];

// Ruta de prueba simple
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "La ruta de prueba está funcionando correctamente"
  });
});

// Ruta para generar dieta (simplificada para pruebas)
router.post("/", validateInput, async (req, res) => {
  console.log('Ruta /generate-diet accedida con método POST');
  console.log('Datos recibidos:', req.body);
  try {
    // Validar los datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    // Obtener los datos del formulario
    const {
      calories,
      mealsPerDay,
      timePerMeal,
      goal,
      allergies = '',
      preferences = '',
      forbiddenFoods = '',
      favoriteFoods = '',
      macros = {}
    } = req.body;

    // Obtener la distribución de macronutrientes o usar valores por defecto
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

    // Crear el prompt para OpenRouter
    const prompt = `Eres un experto en nutrición y dietética con amplio conocimiento de la gastronomía española. Genera un plan de comidas personalizado siguiendo ESTAS INSTRUCCIONES DE FORMA ESTRICTA:

1. DATOS DEL USUARIO:
- Objetivo: ${goal}
- Calorías diarias totales: ${calories} kcal
- Comidas por día: ${mealsPerDay}
- Tiempo máximo por comida: ${timePerMeal} minutos
- Distribución de macronutrientes:
  * Proteínas: ${macroDistribution.protein}% (${macroDistribution.proteinGrams}g)
  * Carbohidratos: ${macroDistribution.carbs}% (${macroDistribution.carbsGrams}g)
  * Grasas: ${macroDistribution.fats}% (${macroDistribution.fatsGrams}g)
- Preferencias: ${preferences || 'Ninguna'}
- Alergias: ${allergies || 'Ninguna'}
- Alimentos prohibidos: ${forbiddenFoods || 'Ninguno'}
- Alimentos favoritos: ${favoriteFoods || 'Ninguno'}

2. INSTRUCCIONES OBLIGATORIAS:
- Utiliza EXCLUSIVAMENTE el sistema métrico decimal (gramos, mililitros, etc.)
- Emplea SOLO ingredientes comunes en España, evita utilizar términos latinos como maní, etc.
- Las cantidades deben ser realistas y coherentes con las calorías especificadas
- Incluye cantidades exactas en gramos para cada ingrediente 
- Asegúrate de que la suma de calorías de todas las comidas se acerque lo máximo posible a ${calories} kcal
- La distribución de macronutrientes debe ser lo más cercana posible a la especificada (${macroDistribution.protein}% proteína, ${macroDistribution.carbs}% carbohidratos, ${macroDistribution.fats}% grasas)
- Los gramos de cada macronutriente deben ser aproximadamente: ${macroDistribution.proteinGrams}g proteína, ${macroDistribution.carbsGrams}g carbohidratos, ${macroDistribution.fatsGrams}g grasas


3. FORMATO DE RESPUESTA (JSON VÁLIDO):
{
  "summary": {
    "goal": "${goal}",
    "targetCalories": ${calories},
    "mealsPerDay": ${mealsPerDay},
    "timePerMeal": ${timePerMeal},
    "totalCalories": number,  // Debe ser cercano a ${calories}
    "totalProteins": number,  // Calculado como 4 kcal/g
    "totalCarbs": number,     // Calculado como 4 kcal/g
    "totalFats": number       // Calculado como 9 kcal/g
  },
  "meals": [
    {
      "name": "string",
      "calories": number,
      "time": number,
      "ingredients": "string (cantidades exactas en gramos)",
      "preparation": "string (instrucciones detalladas)",
      "proteins": number,
      "carbs": number,
      "fats": number
    }
  ]
}

IMPORTANTE: 
- Verifica que la suma de proteínas*4 + carbohidratos*4 + grasas*9 sea igual a las calorías totales (con un margen de ±5%)
- Los valores nutricionales deben ser coherentes con los ingredientes y cantidades especificados


SOLO DEVUELVE EL JSON VÁLIDO, SIN TEXTO ADICIONAL.`;

    // Log del prompt que se enviará a la IA
    console.log('\n=== PROMPT ENVIADO A LA IA ===');
    console.log(prompt);
    console.log('===============================\n');

    try {
      const response = await fetch(API_CONFIG.OPENROUTER.URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': API_CONFIG.OPENROUTER.REFERER,
          'X-Title': API_CONFIG.OPENROUTER.TITLE
        },
        body: JSON.stringify({
          model: API_CONFIG.OPENROUTER.MODEL,
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en nutrición y dietética. Utiliza un formato de desayuno, almuerzo y cena, si el número de comidas es mayor de 3 utiliza más comidas (merienda, snack, etc.). Genera planes de comidas personalizados basados en los parámetros proporcionados sin dar más explicaciones.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar el plan de comidas');
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      
      // Log de la respuesta de la IA
      console.log('\n=== RESPUESTA DE LA IA ===');
      console.log(content);
      console.log('===========================\n');
      
      // Verificar si el contenido es un JSON válido
      try {
        const plan = JSON.parse(content);
        res.json({
          success: true,
          plan
        });
      } catch (parseError) {
        console.error('Error al parsear JSON:', parseError);
        console.log('Contenido recibido:', content);
        
        // Si no es JSON válido, devolver un error
        return res.status(500).json({
          success: false,
          error: 'El modelo devolvió un formato no válido. Por favor, inténtalo de nuevo.'
        });
      }
    } catch (error) {
      console.error('Error en la generación del plan:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al generar el plan de comidas'
      });
    }
    
  } catch (error) {
    console.error('Error en /generate-diet:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Error al generar la dieta'
    });
  }
});

export default router;