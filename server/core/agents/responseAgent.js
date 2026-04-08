const { emitAgentActivity } = require('../socket/socketHandler');
const { callAI } = require('../ai/openRouterService');

/**
 * Module 4: Response Agent (Final Output Synthesis)
 * Combines all standardized agent outputs into a unified clinical package using Gemma 3 27B
 */
const generateResponse = async (results, context) => {
  const { userId, query } = context;
  emitAgentActivity(userId, { 
    agent: 'Response', 
    message: 'Synthesizing clinical, biometric, and logistical data with Gemma 3...', 
    status: 'thinking' 
  });
  
  const systemPrompt = `You are the CORTEX-OS Response Agent, a senior clinical AI supervisor.
Your job is to take raw outputs from multiple specialized agents (Healthcare, Vitals, Traffic, etc.) and synthesize them into a single, cohesive, authoritative, and action-oriented response for the patient/hospital.

AVAILABLE DATA FROM AGENTS:
${JSON.stringify(results, null, 2)}

GUIDELINES:
1. Be professional, clinical, and empathetic.
2. Provide a clear "Status Summary" (Normal, Critical, or Emergency).
3. List specific "Action Items" based on the agent findings.
4. If results show critical risk, emphasize the immediate urgency.
5. Combine health, logistics, and billing info into a coherent narrative.
6. The user asked: "${query}"

Structure your response clearly with headers like:
- **CORTEX Assessment**
- **Vitals Alert** (if applicable)
- **Logistics & ETA** (if applicable)
- **Immediate Next Steps**
`;

  try {
    const aiResponse = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Synthesize a response for: ${query}` }
    ]);

    const isEmergency = results?.healthcare?.riskLevel === 'High';

    emitAgentActivity(userId, { 
      agent: 'Response', 
      message: 'Unified clinical package synthesized by Gemma 3.', 
      status: 'done' 
    });

    return {
      answer: aiResponse,
      data: results,
      context: {
          urgency: isEmergency ? "critical" : "normal",
          ...context
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("❌ [RESPONSE AGENT] Synthesis Error:", error.message);
    return {
      answer: "I apologize, but I encountered an error during synthesis. Please check the individual agent cards for details.",
      status: 'Error'
    };
  }
};

module.exports = { generateResponse };
