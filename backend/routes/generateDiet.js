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
    const prompt = generateDietPrompt(req.body);
    const response = await generateDietWithGroq(prompt);
    const dietPlan = parseApiResponse(response);
    
    res.json({ success: true, plan: dietPlan });
  } catch (error) {
    next(error);
  }
});

export default router;