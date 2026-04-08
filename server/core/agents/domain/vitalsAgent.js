const { emitAgentActivity } = require('../../socket/socketHandler');

const monitorVitals = async (query, userId) => {
  emitAgentActivity(userId, { agent: 'Vitals Agent', message: 'Streaming real-time biometric feed from patient node...', status: 'thinking' });
  
  await new Promise(resolve => setTimeout(resolve, 1200));

  let response = {
    domain: 'Vitals',
    current: {
      heartRate: 78,
      bp: '122/82',
      spo2: 99,
      temp: 98.4
    },
    riskTrend: 'Stable',
    alerts: [],
    insights: 'Heart rate variability is normal. Baseline vitals consistent with historical data.'
  };

  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('vitals') || lowerQuery.includes('heart') || lowerQuery.includes('health')) {
    response.message = `Vitals analysis: ${response.insights} Urgency level: Normal.`;
  } else {
    response.message = "Vitals monitoring active. Tracking recovery trends for discharge estimation.";
  }

  emitAgentActivity(userId, { agent: 'Vitals Agent', message: 'Biometric analysis synchronized.', status: 'done' });
  return response;
};

module.exports = { monitorVitals };
