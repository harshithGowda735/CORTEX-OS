const { emitAgentActivity } = require('../../socket/socketHandler');

const analyzeAgriculture = async (query, userId) => {
  emitAgentActivity(userId, { agent: 'Agriculture Agent', message: 'Analyzing soil components and weather trends...', status: 'thinking' });
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  let response = {
    domain: 'Agriculture',
    data: {},
    recommendation: ''
  };

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('soil') || lowerQuery.includes('ph')) {
    response.data = { ph: 6.8, condition: 'Near-neutral', fertility: 'High' };
    response.recommendation = "Soil pH is optimal for most legumes and tubers. Maintain current organic mulching practices.";
  } else if (lowerQuery.includes('crop') || lowerQuery.includes('plant')) {
    response.data = { suggestions: ['Rice', 'Sugarcane', 'Cotton'], season: 'Kharif' };
    response.recommendation = "Based on the high moisture forecast, moisture-intensive crops like Rice or Sugarcane are highly recommended for this cycle.";
  } else {
    response.data = { status: 'General Monitoring' };
    response.recommendation = "Optimal weather detected. Continue standard irrigation schedule.";
  }

  emitAgentActivity(userId, { agent: 'Agriculture Agent', message: 'Assessment complete.', status: 'done' });
  return response;
};

module.exports = { analyzeAgriculture };
