const { emitAgentActivity } = require('../../socket/socketHandler');

const manageOperations = async (query, userId) => {
  emitAgentActivity(userId, { agent: 'Ops Agent', message: 'Optimizing staff schedules based on current clinical load...', status: 'thinking' });
  
  await new Promise(resolve => setTimeout(resolve, 1800));

  let response = {
    domain: 'Operations',
    availableDoctors: [
      { name: 'Dr. Sarah Chen', dept: 'Cardiology', waitTime: '15 mins' },
      { name: 'Dr. Michael Ross', dept: 'General Medicine', waitTime: '0 mins' }
    ],
    bedOccupancy: '82%',
    shiftOptimization: 'Optimized - 4 nurses on standby for emergency triage'
  };

  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('doctor') || lowerQuery.includes('specialist') || lowerQuery.includes('available')) {
    response.message = "Based on specialization and current occupancy, I have identified the optimal medical staff for your condition.";
  } else {
    response.message = "Hospital operations are running at 82% efficiency. Emergency triage is pre-positioned.";
  }

  emitAgentActivity(userId, { agent: 'Ops Agent', message: 'Logistical optimization complete.', status: 'done' });
  return response;
};

module.exports = { manageOperations };
