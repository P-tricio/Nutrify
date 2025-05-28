export const API_CONFIG = {
  OPENROUTER: {
    URL: process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions',
    MODEL: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-prover-v2:free',
    REFERER: process.env.APP_URL || 'http://localhost:5173',
    TITLE: process.env.APP_TITLE || 'Nutrify'
  },
  GROQ: {
    // Modelos disponibles en Groq (actualizado Mayo 2024)
    MODELS: {
      // Modelos Mixtral (Mistral AI)
      MIXTRAL_8X7B: 'mixtral-8x7b-32768',
      MIXTRAL_8X22B: 'mixtral-8x22b-32768',
      
      // Modelos Llama (Meta)
      LLAMA2_70B: 'llama2-70b-4096',
      LLAMA3_8B: 'llama3-8b-8192',
      LLAMA3_70B: 'llama3-70b-8192',
      
      // Modelos Gemma (Google)
      GEMMA_7B: 'gemma-7b-it',
      
      // Modelos Code (Especializados en código)
      DEEPSEEK_CODER: 'deepseek-coder-33b-instruct',
      
      // Modelos de propósito general
      MISTRAL_SMALL: 'mistral-small',
      MISTRAL_MEDIUM: 'mistral-medium',
      MISTRAL_LARGE: 'mistral-large',
      
      // Modelos de código
      CODE_LLAMA_70B: 'codellama-70b-instruct',
      
      // Modelos de Meta
      META_LLAMA3_70B: 'meta-llama/llama-3-70b-instruct',
      
      // Modelos de Google
      GEMINI_PRO: 'gemini-pro',
      
      // Modelos de OpenAI
      GPT_3_5_TURBO: 'gpt-3.5-turbo',
      GPT_4: 'gpt-4',
      
      // Modelos de Anthropic
      CLAUDE_3_OPUS: 'claude-3-opus-20240229',
      CLAUDE_3_SONNET: 'claude-3-sonnet-20240229',
      CLAUDE_3_HAIKU: 'claude-3-haiku-20240307',
      
      // Modelos de Mistral
      MISTRAL_7B: 'mistral-7b-instruct',
      MIXTRAL_SMALL: 'mixtral-7b-instruct',
      
      // Modelos de código especializado
      STARCODER: 'starcoder2-15b',
      
      // Modelos de investigación
      OPENHERMES: 'openhermes-2.5-mistral-7b',
      
      // Modelos multilingües
      BLOOMZ: 'bigscience/bloomz-7b1',
      
      // Modelos de chat
      VICUNA_13B: 'vicuna-13b-v1.5',
      
      // Modelos de código abierto
      OPENCHAT: 'openchat/openchat-7b',
      
      // Modelos de código especializado
      WIZARD_CODER: 'wizardcoder-33b',
      
      // Modelos de propósito general
      FALCON_180B: 'falcon-180b-chat',
      
      // Modelos de chat en español
      ESPERANZA: 'espersp/esperanza-7b',
      
      // Modelos de código en español
      STELLARIS: 'stabilityai/stablelm-zephyr-3b',
      
      // Modelos de chat en español
      SPANISH_LLAMA: 'spanish-llama-7b',
      
      // Modelos de código en español
      SPANISH_CODEGEN: 'spanish-codegen-16b'
    },
    // Configuración por defecto
    DEFAULTS: {
      MODEL: 'mixtral-8x7b-32768',
      TEMPERATURE: 0.7,
      MAX_TOKENS: 4000,
      TOP_P: 1,
      TIMEOUT: 40000, // 40 segundos
      MAX_RETRIES: 3,
      RETRY_DELAY: 1000 // 1 segundo
    }
  }
};