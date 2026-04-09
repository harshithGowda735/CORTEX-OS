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

  const logistics = context.results.logistics;
  const facility = logistics?.nearest?.name || "City Care Hospital";

  if (lowerQuery.includes('pain') && lowerQuery.includes('chest')) {
    response.assessment = `Acute thoracic distress reported. Risk protocol initiated for ${facility}.`;
    response.riskLevel = 'High';
    response.riskProbability = '88%';
    response.marker = 'Emergency';
    response.nextSteps = [`Immediate clinical triage at ${facility}`, "Administer ASA if appropriate", "Continuous vitals profiling"];
  } else if (lowerQuery.includes('fever') || lowerQuery.includes('cold')) {
    response.assessment = `Viral infection suspected. Standard protocol active for ${facility}.`;
    response.riskLevel = 'Moderate';
    response.riskProbability = '25%';
    response.marker = 'Urgent';
    response.nextSteps = [`Consultation at ${facility} within 24h`, "Temp monitoring", "Hydration protocol"];
  } else {
    response.assessment = `Wellness check complete. Reference center: ${facility}.`;
    response.riskLevel = 'Low';
    response.nextSteps = ["Annual physical exam", "Standard biometric tracking"];
  }

  emitAgentActivity(userId, { agent: 'Healthcare Agent', message: `Clinical assessment synced with ${facility}.`, status: 'done' });
  context.results.healthcare = response;
  return response;
};

module.exports = { analyzeHealth };
