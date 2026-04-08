const { emitAgentActivity } = require('../socket/socketHandler');

const planExecution = async (query, memory, userId) => {
  emitAgentActivity(userId, { agent: 'Planner Agent', message: 'Analyzing CORTEX-OS intent...', status: 'thinking' });
  
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerQuery = query.toLowerCase();
  const domains = [];

  if (lowerQuery.includes('pain') || lowerQuery.includes('fever') || lowerQuery.includes('health') || lowerQuery.includes('doctor') || lowerQuery.includes('symptom') || lowerQuery.includes('hospital') || lowerQuery.includes('book')) {
    domains.push('healthcare');
  }

  if (lowerQuery.includes('traffic') || lowerQuery.includes('route') || lowerQuery.includes('road') || lowerQuery.includes('drive')) {
    domains.push('traffic');
  }

  // If no specific domain found, look at memory or default to healthcare for CORTEX-OS
  if (domains.length === 0) {
    emitAgentActivity(userId, { agent: 'Planner Agent', message: 'General query detected. Accessing healthcare core.', status: 'info' });
    domains.push('healthcare');
  } else {
    emitAgentActivity(userId, { agent: 'Planner Agent', message: `Hospital subsystems identified: ${domains.join(', ')}`, status: 'done' });
  }

  return domains;
};

module.exports = { planExecution };
