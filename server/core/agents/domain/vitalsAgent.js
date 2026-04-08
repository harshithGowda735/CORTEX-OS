const { emitAgentActivity } = require('../../socket/socketHandler');

const monitorVitals = async (context) => {
  const { query, userId } = context;
  emitAgentActivity(userId, { agent: 'Vitals Agent', message: 'Streaming real-time biometric feed...', status: 'thinking' });
  
  await new Promise(resolve => setTimeout(resolve, 1500));

  let response = {
    domain: 'Vitals',
    current: {
      heartRate: 110,
      bp: '145/95',
      spo2: 92,
      temp: 99.1
    },
    riskTrend: 'High Volatility',
    alerts: ['Tachycardia Detected', 'Hypoxia Warning']
  };

  emitAgentActivity(userId, { agent: 'Vitals Agent', message: 'Vitals synchronized.', status: 'done' });
  context.results.vitals = response;
  return response;
};

module.exports = { monitorVitals };
