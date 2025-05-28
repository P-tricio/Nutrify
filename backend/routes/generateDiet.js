import express from 'express';
import { body } from 'express-validator';
import { generateDietPrompt } from '../services/promptService.js';
import { parseApiResponse } from '../services/responseService.js';
import { generateDietWithGroq } from '../services/groqService.js';

const router = express.Router();

// Validación de entrada
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

// Ruta principal
router.post('/', validateInput, async (req, res, next) => {
  try {
    console.log('Solicitud recibida:', {
      body: req.body,
      headers: req.headers
    });
    
    const prompt = generateDietPrompt(req.body);
    console.log('Prompt generado:', prompt.substring(0, 200) + '...');
    
    const response = await generateDietWithGroq(prompt);
    console.log('Respuesta de Groq recibida:', JSON.stringify(response).substring(0, 200) + '...');
    
    const dietPlan = parseApiResponse(response);
    console.log('Plan de dieta parseado:', JSON.stringify(dietPlan, null, 2).substring(0, 200) + '...');
    
    res.json({ success: true, plan: dietPlan });
  } catch (error) {
    console.error('Error en la ruta /:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      originalError: error.originalError?.message || error.originalError || null
    });
    
    // Pasar el error al siguiente middleware
    error.status = error.status || 500;
    next(error);
  }
});

export default router;