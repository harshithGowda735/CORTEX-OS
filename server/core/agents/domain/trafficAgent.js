const { emitAgentActivity } = require('../../socket/socketHandler');

const analyzeTraffic = async (context) => {
  const { query, userId, results } = context;
  const logistics = results.logistics;
  const targetHospital = logistics?.nearest?.name || "City Care Hospital";
  const distance = logistics?.nearest?.distance || null;

  emitAgentActivity(userId, { 
    agent: 'Traffic Agent', 
    message: `Optimizing emergency route for ${targetHospital}...`, 
    status: 'thinking' 
  });
  
  await new Promise(resolve => setTimeout(resolve, 1200));

  let response = {
    domain: 'Traffic',
    hospital: targetHospital,
    distance: distance ? `${distance.toFixed(1)} km` : "Unknown",
    eta: distance ? `${Math.round(distance * 3)} mins` : "12 mins", // Rough simulation: distance * 3 mins/km
    traffic: "Moderate",
    congestion: "Local",
    bestRoute: distance ? `Route via Nearest Arterial Road to ${targetHospital}` : "Emergency Skyway via Northern Sector"
  };

  emitAgentActivity(userId, { agent: 'Traffic Agent', message: `Best route to ${targetHospital} calculated.`, status: 'done' });
  context.results.traffic = response;
  return response;
};

module.exports = { analyzeTraffic };
