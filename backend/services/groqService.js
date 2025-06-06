import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
import { withRetry } from '../utils/apiUtils.js';
import { API_CONFIG } from '../config/constants.js';

// Estadísticas de uso
const usageStats = {
  totalCalls: 0,
  totalTokens: 0,
  totalTime: 0,
  byModel: {},
  lastCalls: []
};

/**
 * Registra métricas de una llamada exitosa
 * @param {string} model - Modelo utilizado
 * @param {Object} usage - Uso de tokens
 * @param {number} duration - Duración en ms
 */
const recordMetrics = (model, usage, duration) => {
  usageStats.totalCalls++;
  usageStats.totalTokens += usage?.total_tokens || 0;
  usageStats.totalTime += duration;
  
  // Actualizar estadísticas por modelo
  if (!usageStats.byModel[model]) {
    usageStats.byModel[model] = {
      calls: 0,
      tokens: 0,
      time: 0
    };
  }
  
  usageStats.byModel[model].calls++;
  usageStats.byModel[model].tokens += usage?.total_tokens || 0;
  usageStats.byModel[model].time += duration;
  
  // Mantener registro de las últimas 10 llamadas
  usageStats.lastCalls.unshift({
    timestamp: new Date().toISOString(),
    model,
    tokens: usage?.total_tokens || 0,
    duration,
    promptTokens: usage?.prompt_tokens,
    completionTokens: usage?.completion_tokens
  });
  
  usageStats.lastCalls = usageStats.lastCalls.slice(0, 10);
};

dotenv.config();

// Configuración de Groq
const groqConfig = {
  apiKey: process.env.GROQ_API_KEY,
  timeout: API_CONFIG.GROQ.DEFAULTS.TIMEOUT
};

// Inicializar cliente Groq
const groq = new Groq(groqConfig);

/**
 * Llama a la API de Groq con manejo de errores
 * @param {Array} messages - Array de mensajes para la conversación
 * @param {Object} options - Opciones para la generación
 * @returns {Promise<Object>} Respuesta de la API
 */
const callGroqAPI = async (messages, options = {}) => {
  try {
    const {
      model = API_CONFIG.GROQ.DEFAULTS.MODEL,
      temperature = API_CONFIG.GROQ.DEFAULTS.TEMPERATURE,
      max_tokens = API_CONFIG.GROQ.DEFAULTS.MAX_TOKENS,
      top_p = API_CONFIG.GROQ.DEFAULTS.TOP_P,
      stream = false,
    } = options;

    // Validar que el modelo solicitado esté en la lista de modelos permitidos
    const validModels = Object.values(API_CONFIG.GROQ.MODELS);
    if (!validModels.includes(model)) {
      console.warn(`Modelo ${model} no está en la lista de modelos permitidos. Usando modelo por defecto.`);
      options.model = API_CONFIG.GROQ.DEFAULTS.MODEL;
    }

    console.log(`Llamando a Groq con modelo: ${options.model || model}`);
    
    const startTime = Date.now();
    const response = await groq.chat.completions.create({
      messages,
      model: options.model || model,
      temperature: Math.min(Math.max(temperature, 0), 2),
      max_tokens: Math.min(max_tokens, 32768),
      top_p: Math.min(Math.max(top_p, 0), 1),
      stream,
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Registrar métricas
    recordMetrics(options.model || model, response.usage, duration);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Groq Metrics] ${options.model || model} - ${duration}ms - ${response.usage?.total_tokens || '?'} tokens`);
    }
    
    return response;
  } catch (error) {
    console.error('Error en callGroqAPI:', {
      message: error.message,
      status: error.status,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    throw new Error(`Error al llamar a la API de Groq: ${error.message}`);
  }
};

/**
 * Genera texto usando Groq con manejo de reintentos
 * @param {Array} messages - Array de mensajes para la conversación
 * @param {Object} options - Opciones para la generación
 * @returns {Promise<string>} Texto generado
 */
export const generateWithGroq = async (messages, options = {}) => {
  try {
    const response = await withRetry(
      () => callGroqAPI(messages, options),
      options.maxRetries ?? API_CONFIG.GROQ.DEFAULTS.MAX_RETRIES,
      options.retryDelay ?? API_CONFIG.GROQ.DEFAULTS.RETRY_DELAY,
      (error) => {
        // Reintentar solo en ciertos códigos de error
        const retryCodes = [429, 500, 502, 503, 504];
        return retryCodes.includes(error?.status);
      }
    );

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Error en generateWithGroq:', {
      message: error.message,
      status: error.status,
      code: error.code
    });
    throw new Error(`Error al generar la respuesta: ${error.message}`);
  }
};

/**
 * Genera un plan de dieta usando Groq
 * @param {string} prompt - Prompt para la generación del plan de dieta
 * @param {Object} options - Opciones adicionales para la generación
 * @returns {Promise<Object>} Plan de dieta generado
 */
// Estilos culinarios para añadir variedad
const CULINARY_STYLES = [
  'mediterráneo', 'asiático', 'latinoamericano', 'vegetariano', 'vegano',
  'keto', 'bajo en carbohidratos', 'alto en proteínas', 'mediterráneo moderno',
  'fusión', 'tradicional español', 'cocina de mercado'
];

// Ingredientes de temporada (puedes actualizarlos según la estación)
const SEASONAL_INGREDIENTS = {
  verano: ['sandía', 'melón', 'tomate', 'pepino', 'calabacín', 'berenjena', 'albahaca', 'melocotón'],
  otoño: ['calabaza', 'boniato', 'setas', 'granada', 'caqui', 'coliflor', 'manzana', 'pera'],
  invierno: ['coles', 'espinacas', 'acelgas', 'naranja', 'kiwi', 'aguacate', 'alcachofa'],
  primavera: ['fresas', 'cerezas', 'espárragos', 'guisantes', 'habas', 'alcachofa', 'rábano']
};

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

export const generateDietWithGroq = async (prompt, options = {}) => {
  // Determinar la estación actual
  const currentMonth = new Date().getMonth();
  let season = 'primavera';
  if (currentMonth >= 5 && currentMonth <= 7) season = 'verano';
  else if (currentMonth >= 8 && currentMonth <= 10) season = 'otoño';
  else if (currentMonth === 11 || currentMonth <= 1) season = 'invierno';

  // Seleccionar estilo culinario aleatorio
  const culinaryStyle = 'mediterráneo';
  const seasonalIngredient = getRandomElement(SEASONAL_INGREDIENTS[season] || []);

  const defaultOptions = {
    model: API_CONFIG.GROQ.MODELS.COMPOUND_BETA,
    temperature: 0.8,  // Aumentamos ligeramente la temperatura para más variedad
    max_tokens: 4000,
    ...options
  };

  const systemPrompt = `Eres un chef nutricionista experto en cocina de estilo ${culinaryStyle}. \
` +
    `Incorpora ingredientes de temporada como ${seasonalIngredient} en las recetas cuando sea posible. \
` +
    `Proporciona recetas creativas y variadas, evitando repetir los mismos platos. \
` +
    `Responde ÚNICAMENTE con un JSON válido sin comentarios.`;

  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  console.log(`Generando dieta con estilo: ${culinaryStyle}, ingrediente estacional: ${seasonalIngredient}`);

  try {
    const response = await generateWithGroq(messages, defaultOptions);
    return response;
  } catch (error) {
    console.error('Error en generateDietWithGroq:', error);
    throw new Error('No se pudo generar el plan de dieta. Por favor, inténtalo de nuevo más tarde.');
  }
};

/**
 * Obtiene la lista de modelos disponibles
 * @returns {Object} Objeto con los modelos disponibles
 */
/**
 * Obtiene estadísticas de uso de la API
 * @returns {Object} Estadísticas de uso
 */
export const getUsageStats = () => {
  return {
    totalCalls: usageStats.totalCalls,
    totalTokens: usageStats.totalTokens,
    totalTime: usageStats.totalTime,
    avgTimePerCall: usageStats.totalCalls > 0 
      ? Math.round(usageStats.totalTime / usageStats.totalCalls) 
      : 0,
    byModel: { ...usageStats.byModel },
    lastCalls: [...usageStats.lastCalls]
  };
};

/**
 * Obtiene la lista de modelos disponibles
 * @returns {Object} Modelos disponibles
 */
export const getAvailableModels = () => {
  return {
    ...API_CONFIG.GROQ.MODELS,
    default: API_CONFIG.GROQ.DEFAULTS.MODEL
  };
};