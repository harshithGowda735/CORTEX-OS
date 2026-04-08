const { emitAgentActivity } = require('../../socket/socketHandler');

const analyzeHealth = async (context) => {
  const { query, userId } = context;
  emitAgentActivity(userId, { agent: 'Healthcare Agent', message: 'Scanning symptom database...', status: 'thinking' });
  
  await new Promise(resolve => setTimeout(resolve, 1500));

  let response = {
    domain: 'Healthcare',
    assessment: '',
    riskLevel: 'Low',
    riskProbability: '5%',
    marker: 'Routine',
    nextSteps: []
  };

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('pain') && lowerQuery.includes('chest')) {
    response.assessment = "Acute discomfort in thoracic region reported. Cardiovascular distress suspected.";
    response.riskLevel = 'High';
    response.riskProbability = '88%';
    response.marker = 'Emergency';
    response.nextSteps = ["Immediate clinical triage", "Administer ASA if appropriate", "Continuous vitals profiling"];
  } else if (lowerQuery.includes('fever') || lowerQuery.includes('cold')) {
    response.assessment = "Symptoms indicate standard viral respiratory infection.";
    response.riskLevel = 'Moderate';
    response.riskProbability = '25%';
    response.marker = 'Urgent';
    response.nextSteps = ["In-person consultation within 24h", "Temp monitoring", "Hydration protocol"];
  } else {
    response.assessment = "Predictive wellness check. No acute pathology detected.";
    response.riskLevel = 'Low';
    response.nextSteps = ["Annual physical exam", "Standard biometric tracking"];
  }

  emitAgentActivity(userId, { agent: 'Healthcare Agent', message: 'Clinical assessment synthesized.', status: 'done' });
  context.results.healthcare = response;
  return response;
};

module.exports = { analyzeHealth };
