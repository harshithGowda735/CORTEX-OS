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

LANGUAGE REQUIREMENT: 
Detect the primary language of the user's query ("${query}"). 
You MUST provide the entire synthesized response (headers and content) in that same language (e.g., Hindi, Kannada, Tamil, etc.). 
If you cannot detect the language, default to English.
`;

  try {
    const aiResponse = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Synthesize a response for: ${query}` }
    ]);

    const isEmergency = results?.healthcare?.riskLevel === 'High';

    emitAgentActivity(userId, { 
      agent: 'Response', 
      message: 'Unified clinical package synthesized successfully.', 
      status: 'done' 
    });

    return {
      answer: aiResponse,
      data: results,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.warn("⚠️ [RESPONSE AGENT] LLM Synthesis failed, using Heuristic Fallback:", error.message);
    
    // HEURISTIC FALLBACK (For Hackathon zero-downtime)
    const health = results.healthcare;
    const traffic = results.traffic;
    const billing = results.billing;
    const auto = results.autoBooking;

    let fallback = `### CORTEX-OS Autonomous Summary\n\n`;
    
    if (health) {
      fallback += `**Clinical Status:** ${health.riskLevel} Risk detected. ${health.assessment}\n\n`;
    }

    if (auto) {
      fallback += `**🚨 EMERGENCY ACTION:** Autonomous admission secured at **${auto.hospital}**. Bed and doctor notified.\n\n`;
    }

    if (traffic) {
      fallback += `**Logistics:** The best route to **${traffic.hospital}** is ready. Estimated travel time: **${traffic.eta}**.\n\n`;
    }

    if (billing) {
      fallback += `**Financials:** Autonomous settlement active. Estimated care cost: **₹${billing.total?.toLocaleString()}**.\n\n`;
    }

    fallback += `_Note: Synthesis generated via local heuristic core due to high server load._`;

    emitAgentActivity(userId, { 
      agent: 'Response', 
      message: 'Heuristic synthesis fallback active.', 
      status: 'success' 
    });

    return {
      answer: fallback,
      data: results,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = { generateResponse };
