const { emitAgentActivity } = require('../../socket/socketHandler');

const analyzeHealth = async (query, userId) => {
  emitAgentActivity(userId, { agent: 'Healthcare Agent', message: 'Checking symptom patterns against medical database...', status: 'thinking' });
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  let response = {
    domain: 'Healthcare',
    assessment: '',
    riskLevel: 'Low',
    nextSteps: []
  };

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('pain') && lowerQuery.includes('chest')) {
    response.assessment = "Acute discomfort detected in thoracic region.";
    response.riskLevel = 'High';
    response.nextSteps = ["Emergency medical evaluation recommended", "Check vitals immediately", "Route to nearest Cardiac Care Unit"];
  } else if (lowerQuery.includes('fever') || lowerQuery.includes('cold') || lowerQuery.includes('cough')) {
    response.assessment = "Symptoms consistent with upper respiratory infection.";
    response.riskLevel = 'Moderate';
    response.nextSteps = ["Hydrate and rest", "Monitor temperature", "Consult GP if symptoms persist beyond 48hrs"];
  } else {
    response.assessment = "General wellness query detected.";
    response.riskLevel = 'Low';
    response.nextSteps = ["Maintain balanced diet", "Regular screening recommended"];
  }

  emitAgentActivity(userId, { agent: 'Healthcare Agent', message: 'Health assessment ready.', status: 'done' });
  return response;
};

module.exports = { analyzeHealth };
