import express from "express";
import { body, validationResult } from "express-validator";
import dotenv from 'dotenv';
import fetch from 'node-fetch';

const router = express.Router();
dotenv.config();

// Depuración de variables de entorno
console.log('Variables de entorno en generateDiet.js:', {
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
  NODE_ENV: process.env.NODE_ENV
});

// Configuración de la API
const API_CONFIG = {
  OPENROUTER: {
    URL: process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions',
    MODEL: process.env.OPENROUTER_MODEL || 'qwen/qwen3-14b:free',
    REFERER: process.env.APP_URL || 'http://localhost:5173',
    TITLE: process.env.APP_TITLE || 'Nutrify'
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
    const prompt = `Eres un experto nutricionista que habla castellano, especializado en la dieta mediterránea española. Sigue ESTAS INSTRUCCIONES AL PIE DE LA LETRA para generar un plan de comidas personalizado:

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
    "totalCalories": number,  // Debe ser cercano a ${calories}
    "totalProteins": number,  // ≈ ${macroDistribution.proteinGrams}g
    "totalCarbs": number,     // ≈ ${macroDistribution.carbsGrams}g
    "totalFats": number       // ≈ ${macroDistribution.fatsGrams}g
  },
  "meals": [
    {
      "name": "Nombre de la comida (ej: Desayuno)",
      "calories": number,     // Suma de (proteínas*4 + carbos*4 + grasas*9)
      "ingredients": "Ingrediente 1: XXXg\nIngrediente 2: YYYml",
      "preparation": "Instrucciones detalladas paso a paso",
      "proteins": number,     // En gramos
      "carbs": number,        // En gramos
      "fats": number          // En gramos
    }
  ]
}

# VERIFICACIONES FINALES (OBLIGATORIAS):
1. ¿Se incluyeron los alimentos favoritos? [${favoriteFoods || 'N/A'}]
2. ¿Se excluyeron alérgenos? [${allergies || 'N/A'}]
3. ¿Se excluyeron alimentos prohibidos? [${forbiddenFoods || 'N/A'}]
4. ¿Los cálculos de macronutrientes son correctos? (proteínas*4 + carbos*4 + grasas*9 ≈ ${calories} kcal)
5. ¿Las cantidades son realistas para una comida normal?
6. ¿Los ingredientes son comunes en España?

IMPORTANTE: Responde ÚNICAMENTE con el JSON válido, sin comentarios ni texto adicional.`;

    // Log del prompt que se enviará a la IA
    console.log('\n=== PROMPT ENVIADO A LA IA ===');
    console.log(prompt);
    console.log('===============================\n');

    try {
      console.log('Enviando solicitud a OpenRouter con modelo:', API_CONFIG.OPENROUTER.MODEL);
      
      const requestBody = {
        model: API_CONFIG.OPENROUTER.MODEL,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en nutrición y dietética que habla castellano. Utiliza un formato de desayuno, almuerzo y cena, si el número de comidas es mayor de 3 utiliza más comidas (snack 1, snack 2, etc.). Genera planes de comidas personalizados basados en los parámetros proporcionados presta especial atención a las instrucciones obligatorias del prompt, utiliza ingredientes concretos en lugar de genéricos. Responde ÚNICAMENTE con un JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      };

      console.log('=== CUERPO DE LA SOLICITUD ===');
      console.log(JSON.stringify(requestBody, null, 2));
      console.log('==============================');

      const response = await fetch(API_CONFIG.OPENROUTER.URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': API_CONFIG.OPENROUTER.REFERER,
          'X-Title': API_CONFIG.OPENROUTER.TITLE
        },
        body: JSON.stringify(requestBody)
      });

      console.log('=== RESPUESTA HTTP ===');
      console.log('Status:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('Respuesta en bruto:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error al parsear la respuesta JSON:', e);
        throw new Error(`La respuesta de la API no es un JSON válido: ${responseText.substring(0, 200)}...`);
      }
      
      console.log('=== RESPUESTA DE LA API ===');
      console.log(JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        console.error('Error en la respuesta de la API:', data);
        throw new Error(`Error de la API: ${data.error?.message || response.statusText}`);
      }
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Estructura de respuesta inesperada:', data);
        throw new Error('La respuesta de la API no tiene el formato esperado');
      }
      
      const content = data.choices[0].message.content.trim();
      
      console.log('\n=== CONTENIDO DE LA RESPUESTA ===');
      console.log(content);
      console.log('=================================\n');
      
      // Extraer el JSON de la respuesta
      let jsonResponse;
      try {
        // Buscar el primer { y el último } para extraer el JSON
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error('No se encontró un objeto JSON en la respuesta');
        }
        
        const jsonString = content.substring(jsonStart, jsonEnd);
        console.log('JSON extraído para análisis:', jsonString);
        
        // Limpiar el JSON de posibles caracteres inválidos
        const cleanJsonString = jsonString
          .replace(/\n/g, '')  // Eliminar saltos de línea
          .replace(/\r/g, '')   // Eliminar retornos de carro
          .replace(/\t/g, '')   // Eliminar tabulaciones
          .replace(/\f/g, '')   // Eliminar saltos de página
          .replace(/\b(?:true|false|null)\b/gi, match => match.toLowerCase());  // Asegurar booleanos y null en minúsculas
        
        console.log('JSON limpio:', cleanJsonString);
        
        jsonResponse = JSON.parse(cleanJsonString);
        console.log('JSON analizado correctamente:', JSON.stringify(jsonResponse, null, 2));
        
      } catch (error) {
        console.error('Error al analizar la respuesta JSON:', error);
        console.error('Contenido que falló al analizar:', content);
        throw new Error('El modelo devolvió un formato no válido. Por favor, inténtalo de nuevo.');
      }

      // Verificar si el contenido es un JSON válido
      try {
        const plan = jsonResponse;
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