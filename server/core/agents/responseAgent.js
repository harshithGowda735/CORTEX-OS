const { emitAgentActivity } = require('../socket/socketHandler');

const generateResponse = async (results, query, userId) => {
  emitAgentActivity(userId, { agent: 'CORTEX Response', message: 'Synthesizing clinical and logistical data for CORTEX-OS...', status: 'thinking' });
  
  await new Promise(resolve => setTimeout(resolve, 1000));

  let summary = "CORTEX-OS Assessment: ";
  
  const health = results.find(r => r.domain === 'Healthcare');
  const traffic = results.find(r => r.domain === 'Traffic');

  if (health) {
    if (health.riskLevel === 'High') {
      summary += "CRITICAL health status detected. Immediate medical attention is recommended. ";
    } else {
      summary += "Non-critical clinical status confirmed. ";
    }
  }

  if (traffic) {
    summary += `Logistical analysis recommends using ${traffic.bestRoute} for the fastest arrival.`;
  }

  const finalResponse = {
    answer: summary,
    results,
    timestamp: new Date().toISOString()
  };

  emitAgentActivity(userId, { agent: 'CORTEX Response', message: 'Hospital intelligence package ready.', status: 'done' });
  return finalResponse;
};

module.exports = { generateResponse };
