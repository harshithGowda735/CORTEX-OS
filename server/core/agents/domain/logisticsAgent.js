const { emitAgentActivity } = require('../../socket/socketHandler');
const { findNearbyHospitals } = require('../../ai/mapsService');

/**
 * Module: Spatial Nexus Analysis (Agent)
 * Logic: Analyzes physical proximity and ranks medical destinations
 * In an MCP architecture, this agent populates the 'geoContext' shared memory.
 */
const spatialNexusAnalysis = async (context) => {
  const { userId, location } = context;

  emitAgentActivity(userId, { 
    agent: 'Logistics Agent', 
    message: 'Analyzing spatial nexus and nearby medical resources...', 
    status: 'thinking' 
  });

  if (!location || !location.lat || !location.lng) {
    emitAgentActivity(userId, { 
        agent: 'Logistics Agent', 
        message: 'No location context provided. Defaulting to City Care Hospital.', 
        status: 'info' 
    });
    return null;
  }

  try {
    const hospitals = await findNearbyHospitals(location.lat, location.lng);
    
    // Sort by proximity (simple calculation for demo)
    const processedHospitals = hospitals.map(h => {
        const dist = calculateDistance(location.lat, location.lng, h.location.latitude, h.location.longitude);
        return { ...h, distance: dist };
    }).sort((a, b) => a.distance - b.distance);

    const nearest = processedHospitals[0];

    emitAgentActivity(userId, { 
        agent: 'Logistics Agent', 
        message: `Nexus established: Nearest facility is ${nearest.name} (${nearest.distance.toFixed(1)}km away).`, 
        status: 'done' 
    });

    // Share this with the orchestrator context
    context.geoContext = {
        nearest,
        allNearby: processedHospitals,
        userLocation: location
    };

    return context.geoContext;

  } catch (error) {
    console.error("❌ [LOGISTICS AGENT] Failed:", error.message);
    return null;
  }
};

/**
 * Basic distance formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

module.exports = { spatialNexusAnalysis };
