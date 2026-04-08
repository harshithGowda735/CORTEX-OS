const { emitAgentActivity } = require('../socket/socketHandler');

/**
 * Module 4: Response Agent (Final Output Synthesis)
 * Combines all standardized agent outputs into a unified clinical package
 */
const generateResponse = async (results, context) => {
  const { userId, query } = context;
  emitAgentActivity(userId, { 
    agent: 'Response', 
    message: 'Synthesizing clinical, biometric, and logistical data...', 
    status: 'thinking' 
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));

  let answer = "";
  const isEmergency = results.healthcare?.riskLevel === 'High';

  if (isEmergency) {
    answer = `⚠️ EMERGENCY DETECTED: Clinical assessment indicates highly critical status (${results.healthcare.riskProbability}). ${results.operations.assignedDoctor} has been assigned. Recommended ETA: ${results.traffic.eta} via ${results.traffic.bestRoute}. Predicted financial impact: ₹${results.billing.predicted}.`;
  } else {
    answer = `CORTEX-OS Assessment: Clinical status is within normal parameters. Our operations agent has monitored resource availability, and the billing core is synchronized with your current profile.`;
  }

  const finalResponse = {
    answer,
    data: results, // Unified results from all agents
    context: {
        urgency: isEmergency ? "critical" : "normal",
        ...context
    },
    timestamp: new Date().toISOString()
  };

  emitAgentActivity(userId, { 
    agent: 'Response', 
    message: 'Unified clinical package ready.', 
    status: 'done' 
  });

  return finalResponse;
};

module.exports = { generateResponse };
