import express from 'express';
import { getUsageStats } from '../services/groqService.js';

const router = express.Router();

/**
 * @swagger
 * /metrics/usage:
 *   get:
 *     summary: Obtiene métricas de uso de la API de Groq
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Estadísticas de uso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCalls:
 *                   type: number
 *                   description: Número total de llamadas a la API
 *                 totalTokens:
 *                   type: number
 *                   description: Total de tokens utilizados
 *                 totalTime:
 *                   type: number
 *                   description: Tiempo total de procesamiento en ms
 *                 avgTimePerCall:
 *                   type: number
 *                   description: Tiempo promedio por llamada en ms
 *                 byModel:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       calls:
 *                         type: number
 *                       tokens:
 *                         type: number
 *                       time:
 *                         type: number
 *                 lastCalls:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                       model:
 *                         type: string
 *                       tokens:
 *                         type: number
 *                       duration:
 *                         type: number
 *                       promptTokens:
 *                         type: number
 *                       completionTokens:
 *                         type: number
 */
router.get('/usage', (req, res, next) => {
  try {
    const stats = getUsageStats();
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    next(error);
  }
});

export default router;
