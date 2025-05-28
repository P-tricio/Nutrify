export const API_CONFIG = {
    OPENROUTER: {
      URL: process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions',
      MODEL: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-prover-v2:free',
      REFERER: process.env.APP_URL || 'http://localhost:5173',
      TITLE: process.env.APP_TITLE || 'Nutrify'
    }
  };