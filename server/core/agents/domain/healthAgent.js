const { emitAgentActivity } = require('../../socket/socketHandler');
const { callAI } = require('../../ai/openRouterService');

const analyzeHealth = async (context) => {
  const { query, userId, results } = context;
  const facility = results.logistics?.nearest?.name || "CORTEX City Care Hospital";

  emitAgentActivity(userId, { 
    agent: 'Healthcare Agent', 
    message: 'Analyzing symptoms using deep clinical reasoning...', 
    status: 'thinking' 
  });

  const systemPrompt = `You are the CORTEX-OS Healthcare Triage Agent.
Your job is to analyze the user's medical query and provide a structured JSON assessment.

You MUST respond with ONLY a raw JSON object (no markdown, no backticks).
Include the following keys:
- "assessment": A short, clinical summary of the suspected condition.
- "riskLevel": Must be exactly "Low", "Moderate", or "High". Be highly sensitive to chest pain, sudden numbness, or severe trauma (High).
- "riskProbability": A percentage string (e.g., "85%").
- "marker": A one-word severity marker (e.g., "Emergency", "Urgent", "Routine").
- "nextSteps": An array of 2-3 short strings with immediate medical advice.

The target facility for triage is: ${facility}

User Query: "${query}"`;

  try {
    const aiResponse = await callAI(
      [ { role: "system", content: systemPrompt } ],
      { model: "google/gemma-3-27b-it:free" } // MCP Feature: Model Heterogeneity
    );

    // Parse the JSON output from the LLM
    let parsedResponse;
    try {
      // aggressively strip any potential markdown block markers
      const cleanJSON = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedResponse = JSON.parse(cleanJSON);
    } catch (parseError) {
      console.warn("⚠️ Healthcare Agent failed to parse JSON, falling back to heuristics.", parseError);
      throw new Error("JSON Parse failure");
    }

    const response = {
      domain: 'Healthcare',
      ...parsedResponse
    };

    emitAgentActivity(userId, { 
      agent: 'Healthcare Agent', 
      message: `Clinical assessment completed. Risk: ${response.riskLevel}`, 
      status: 'done' 
    });

    context.results.healthcare = response;
    return response;

  } catch (error) {
    // Fail-safe heuristic fallback for demo stability
    const lowerQuery = query.toLowerCase();
    let response = {
      domain: 'Healthcare',
      assessment: `Condition analysis for ${facility}.`,
      riskLevel: 'Low',
      riskProbability: '10%',
      marker: 'Routine',
      nextSteps: ["Monitor symptoms", "Consult if worsened"]
    };

    if (lowerQuery.includes('pain') || lowerQuery.includes('severe')) {
        response.riskLevel = 'High';
        response.assessment = 'Potential acute condition. Emergency protocols advised.';
    }

    emitAgentActivity(userId, { 
      agent: 'Healthcare Agent', 
      message: 'Heuristic assessment deployed due to LLM timeout.', 
      status: 'warning' 
    });
    
    context.results.healthcare = response;
    return response;
  }
};

module.exports = { analyzeHealth };
