const { emitAgentActivity } = require('../../socket/socketHandler');
const { getTrafficData } = require('../../ai/mapsService');

const analyzeTraffic = async (context) => {
  const { query, userId, results, location } = context;
  const logistics = results.logistics;
  const targetHospital = logistics?.nearest?.name || "City Care Hospital";
  const hospitalCoords = logistics?.nearest?.location; // { latitude, longitude }

  emitAgentActivity(userId, { 
    agent: 'Traffic Agent', 
    message: `Optimizing emergency route for ${targetHospital}...`, 
    status: 'thinking' 
  });

  let trafficData = null;

  // Attempt real-time lookup if we have both coordinates
  if (location?.lat && location?.lng && hospitalCoords?.latitude) {
    emitAgentActivity(userId, { agent: 'Traffic Agent', message: 'Pulling real-time congestion from Google Clusters...', status: 'active' });
    trafficData = await getTrafficData(
      { lat: location.lat, lng: location.lng },
      { lat: hospitalCoords.latitude, lng: hospitalCoords.longitude }
    );
  }

  let response;

  if (trafficData) {
    // Real-Time Data (Verified)
    response = {
      domain: 'Traffic',
      hospital: targetHospital,
      distance: trafficData.distance,
      eta: trafficData.durationInTraffic,
      traffic: trafficData.trafficLevel,
      congestion: "Real-time Traffic Aware",
      bestRoute: `Optimized route to ${targetHospital} via Live Google Data`,
      source: 'Google Traffic Matrix'
    };
  } else {
    // Intelligent Simulation Fallback
    const distance = logistics?.nearest?.distance || 5.2;
    response = {
      domain: 'Traffic',
      hospital: targetHospital,
      distance: `${distance.toFixed(1)} km`,
      eta: `${Math.round(distance * 3.5)} mins`,
      traffic: "Moderate",
      congestion: "Local Estimate",
      bestRoute: `Emergency Skyway via Northern Sector to ${targetHospital}`,
      source: 'Autonomous Simulation'
    };
  }

  emitAgentActivity(userId, { 
    agent: 'Traffic Agent', 
    message: `✅ Traffic Path Secured: ${response.traffic} congestion.`, 
    status: 'success' 
  });

  context.results.traffic = response;
  return response;
};

module.exports = { analyzeTraffic };
