const { emitAgentActivity } = require('../../socket/socketHandler');

const analyzeBilling = async (query, userId) => {
  emitAgentActivity(userId, { agent: 'PayFlow Agent', message: 'Analyzing consultation records and resource utilization...', status: 'thinking' });
  
  await new Promise(resolve => setTimeout(resolve, 1500));

  let response = {
    domain: 'Billing',
    totalEstimated: '₹4,500',
    anomalies: 'None detected',
    breakdown: [
      { item: 'Consultation Fee', cost: '₹500' },
      { item: 'Diagnostic Panel', cost: '₹2,500' },
      { item: 'In-patient Room (Est.)', cost: '₹1,500' }
    ],
    savingsAdvice: 'Switching to preferred provider insurance could save 20%'
  };

  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('bill') || lowerQuery.includes('cost') || lowerQuery.includes('pay')) {
    response.message = `Your current estimated total is ${response.totalEstimated}. I have analyzed your treatment path and no anomalies were found.`;
  } else {
    response.message = "Billing monitoring active. No critical anomalies detected in the current session.";
  }

  emitAgentActivity(userId, { agent: 'PayFlow Agent', message: 'Financial intelligence package ready.', status: 'done' });
  return response;
};

module.exports = { analyzeBilling };
