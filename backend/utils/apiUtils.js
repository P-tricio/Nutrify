export const withRetry = async (fn, maxRetries = 3, initialDelay = 1000) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          const delayMs = initialDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    throw lastError;
  };