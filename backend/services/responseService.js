export const parseApiResponse = (content) => {
    try {
      const cleanContent = content
        .replace(/^```json\s*|\s*```$/g, '')
        .replace(/[\r\n\t\f]/g, '')
        .trim();
  
      const jsonResponse = JSON.parse(cleanContent);
      validateDietPlan(jsonResponse);
      return jsonResponse;
    } catch (error) {
      throw new Error(`Error al procesar la respuesta: ${error.message}`);
    }
  };
  
  const validateDietPlan = (plan) => {
    if (!plan.meals || !Array.isArray(plan.meals)) {
      throw new Error('Formato de plan de comidas inválido');
    }
    // Agregar más validaciones según sea necesario
  };