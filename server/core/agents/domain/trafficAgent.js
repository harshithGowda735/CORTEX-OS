const { emitAgentActivity } = require('../../socket/socketHandler');

const analyzeTraffic = async (query, userId) => {
  emitAgentActivity(userId, { agent: 'Traffic Agent', message: 'Scanning real-time traffic grids and road incidents...', status: 'thinking' });
  
  await new Promise(resolve => setTimeout(resolve, 1200));

  let response = {
    domain: 'Traffic',
    congestion: 'Low',
    incidents: 0,
    bestRoute: '',
    estimatedTime: 0
  };

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('heavy') || lowerQuery.includes('jam') || lowerQuery.includes('traffic')) {
    response.congestion = 'Severe';
    response.incidents = 2;
    response.bestRoute = "Avoid Main Street. Use bypass via Northern Expressway.";
    response.estimatedTime = 45;
  } else {
    response.congestion = 'Moderate';
    response.incidents = 0;
    response.bestRoute = "Standard route clear. Use Central Avenue.";
    response.estimatedTime = 20;
  }

  emitAgentActivity(userId, { agent: 'Traffic Agent', message: 'Traffic optimization complete.', status: 'done' });
  return response;
};

module.exports = { analyzeTraffic };
