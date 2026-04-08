const { emitAgentActivity } = require('../socket/socketHandler');
const { callAI } = require('../ai/openRouterService');
const server = require('../mcp/server');

/**
 * Module 2: Planner Agent (Task Decomposition)
 * Converts user input into a set of specialized agent tasks using Gemma 3 27B
 */
const planExecution = async (query, memory, userId) => {
  emitAgentActivity(userId, { 
    agent: 'Planner', 
    message: 'Gemma 3 analyzing intent for MCP orchestration...', 
    status: 'thinking' 
  });
  
  const toolsDescription = server.getToolsDescription();

  const systemPrompt = `You are the CORTEX-OS Orchestrator, a medical AI brain that manages multiple specialized agents.
Your task is to analyze the user's query and decide which MCP tools (agents) need to be triggered.

AVAILABLE TOOLS:
${toolsDescription}

GUIDELINES:
1. Return ONLY a JSON array of tool names.
2. If a query mentions pain, vitals, or medical symptoms, trigger at least 'healthcare_diagnostics' and 'vitals_monitoring'.
3. If a query mentions costs or bills, trigger 'payflow_billing'.
4. If a query involves navigation or hospital arrival, trigger 'traffic_logistics'.
5. If the query is complex, you can trigger multiple tools.
6. Return only the array, e.g., ["healthcare_diagnostics", "vitals_monitoring"].

USER QUERY: ${query}
`;

  try {
    const aiResponse = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: query }
    ]);

    // Parse the JSON array from the response
    let toolList = [];
    try {
      // Find JSON array in the response (in case the LLM adds chatter)
      const match = aiResponse.match(/\[.*\]/s);
      if (match) {
        toolList = JSON.parse(match[0]);
      }
    } catch (parseError) {
      console.error("❌ [PLANNER] Failed to parse AI response:", aiResponse);
      // Fallback logic
      toolList = ["healthcare_diagnostics"];
    }

    // Map tool names back to domain internal IDs used by orchestrator
    const domainMap = {
      "healthcare_diagnostics": "healthcare",
      "vitals_monitoring": "vitals",
      "hospital_operations": "operations",
      "payflow_billing": "billing",
      "traffic_logistics": "traffic"
    };

    const taskList = toolList.map(tool => domainMap[tool]).filter(Boolean);
    
    emitAgentActivity(userId, { 
      agent: 'Planner', 
      message: `Gemma 3 identified tasks: ${taskList.join(', ')}`, 
      status: 'done' 
    });

    return taskList;
  } catch (error) {
    console.error("❌ [PLANNER] AI Planning Error:", error.message);
    // Safety fallback
    return ["healthcare"];
  }
};

module.exports = { planExecution };
