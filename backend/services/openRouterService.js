import fetch from 'node-fetch';
import { API_CONFIG } from '../config/constants.js';
import { withRetry } from '../utils/apiUtils.js';

export const generateDietPlan = async (prompt) => {
  const requestBody = {
    model: API_CONFIG.OPENROUTER.MODEL,
    messages: [{ role: 'user', content: prompt }]
  };

  const { data } = await withRetry(
    () => callOpenRouterAPI(API_CONFIG.OPENROUTER.URL, requestBody),
    3,
    1000
  );

  return data.choices[0].message.content.trim();
};

const callOpenRouterAPI = async (url, body) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': API_CONFIG.OPENROUTER.REFERER,
      'X-Title': API_CONFIG.OPENROUTER.TITLE
    },
    body: JSON.stringify(body)
  });

  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : {};

  if (!response.ok) {
    throw new Error(data.error?.message || `Error de la API (${response.status})`);
  }

  return { response, data };
};