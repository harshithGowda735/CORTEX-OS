const { emitAgentActivity } = require('../socket/socketHandler');

const planExecution = async (query, memory, userId) => {
  emitAgentActivity(userId, { agent: 'Planner Agent', message: 'Breaking down query and identifying target domains...', status: 'thinking' });
  
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerQuery = query.toLowerCase();
  const domains = [];

  if (lowerQuery.includes('crop') || lowerQuery.includes('soil') || lowerQuery.includes('plant') || lowerQuery.includes('farm')) {
    domains.push('agriculture');
  }
  
  if (lowerQuery.includes('pain') || lowerQuery.includes('fever') || lowerQuery.includes('health') || lowerQuery.includes('doctor') || lowerQuery.includes('symptom')) {
    domains.push('healthcare');
  }

  if (lowerQuery.includes('traffic') || lowerQuery.includes('route') || lowerQuery.includes('road') || lowerQuery.includes('drive')) {
    domains.push('traffic');
  }

  // If no specific domain found, look at memory or default to all for a "pulse check"
  if (domains.length === 0) {
    emitAgentActivity(userId, { agent: 'Planner Agent', message: 'No specific domain identified. Performing global system check.', status: 'info' });
    domains.push('agriculture', 'healthcare', 'traffic');
  } else {
    emitAgentActivity(userId, { agent: 'Planner Agent', message: `Target domains identified: ${domains.join(', ')}`, status: 'done' });
  }

  return domains;
};

module.exports = { planExecution };
