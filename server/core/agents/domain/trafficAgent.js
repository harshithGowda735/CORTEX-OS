const { emitAgentActivity } = require('../../socket/socketHandler');

const analyzeTraffic = async (context) => {
  const { query, userId } = context;
  emitAgentActivity(userId, { agent: 'Traffic Agent', message: 'Optimizing emergency route for City Care Hospital...', status: 'thinking' });
  
  await new Promise(resolve => setTimeout(resolve, 1200));

  let response = {
    domain: 'Traffic',
    hospital: "City Care Hospital",
    eta: "12 mins",
    traffic: "Heavy",
    congestion: "Heavy",
    bestRoute: "Emergency Skyway via Northern Sector"
  };

  emitAgentActivity(userId, { agent: 'Traffic Agent', message: 'Route optimized for arrival.', status: 'done' });
  context.results.traffic = response;
  return response;
};

module.exports = { analyzeTraffic };
