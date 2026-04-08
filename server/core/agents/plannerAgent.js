const { emitAgentActivity } = require('../socket/socketHandler');

/**
 * Module 2: Planner Agent (Task Decomposition)
 * Converts user input into a set of specialized agent tasks
 */
const planExecution = async (query, memory, userId) => {
  emitAgentActivity(userId, { 
    agent: 'Planner', 
    message: 'Analyzing intent for MCP orchestration...', 
    status: 'thinking' 
  });
  
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerQuery = query.toLowerCase();
  const domains = new Set(); // Use Set to avoid duplicates

  // Trigger Logic (Module 2)
  if (lowerQuery.includes("pain") || lowerQuery.includes("hurt") || lowerQuery.includes("breath")) {
    domains.add('healthcare');
    domains.add('vitals');
    domains.add('operations');
  }

  if (lowerQuery.includes("bill") || lowerQuery.includes("cost") || lowerQuery.includes("pay") || lowerQuery.includes("money")) {
    domains.add('billing');
  }

  if (lowerQuery.includes("route") || lowerQuery.includes("traffic") || lowerQuery.includes("reach") || lowerQuery.includes("eta")) {
    domains.add('traffic');
  }

  // Fallback / Defaults
  if (domains.size === 0) {
    domains.add('healthcare');
  }

  const taskList = Array.from(domains);
  
  emitAgentActivity(userId, { 
    agent: 'Planner', 
    message: `Tasks identified: ${taskList.join(', ')}`, 
    status: 'done' 
  });

  return taskList;
};

module.exports = { planExecution };
