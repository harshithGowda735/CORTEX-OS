const { emitAgentActivity } = require('../socket/socketHandler');

const generateResponse = async (results, query, userId) => {
  emitAgentActivity(userId, { agent: 'Response Agent', message: 'Synthesizing all agent outputs into a unified decision...', status: 'thinking' });
  
  await new Promise(resolve => setTimeout(resolve, 1000));

  let summary = "System assessment complete. ";
  
  const agri = results.find(r => r.domain === 'Agriculture');
  const health = results.find(r => r.domain === 'Healthcare');
  const traffic = results.find(r => r.domain === 'Traffic');

  if (health && health.riskLevel === 'High') {
    summary += "CRITICAL: Health risks detected. Priority routing to medical facilities is essential. ";
  } else if (agri) {
    summary += "Agri-optimization suggests favorable conditions for your current objectives. ";
  }

  if (traffic) {
    summary += `Traffic analysis predicts ${traffic.bestRoute} as the optimal path.`;
  }

  const finalResponse = {
    answer: summary,
    results,
    timestamp: new Date().toISOString()
  };

  emitAgentActivity(userId, { agent: 'Response Agent', message: 'Final intelligence package dispatched.', status: 'done' });
  return finalResponse;
};

module.exports = { generateResponse };
