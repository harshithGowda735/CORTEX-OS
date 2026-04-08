const plannerAgent = require('../agents/plannerAgent');
const responseAgent = require('../agents/responseAgent');
const memoryService = require('../memory/memoryService');
const server = require('../mcp/server');
const { initMCPTools } = require('../mcp/tools');
const { emitAgentActivity } = require('../socket/socketHandler');

/**
 * MODULE 1: MCP CORE (ORCHESTRATOR + CONTEXT)
 * MODULE 6: TOOL EXECUTION FROM ORCHESTRATOR
 */

// Initialize MCP Tools once
initMCPTools();

const processQuery = async (query, userId = 'default_user', io) => {
  console.log(`🧠 [CORTEX MCP] Processing: "${query}"`);

  // 🔥 1. CREATE SHARED CONTEXT (CORE MCP - MODULE 1)
  const context = {
    query,
    userId,
    memory: memoryService.getMemory(userId),
    urgency: "normal",
    results: {},
    timestamp: new Date()
  };

  emitAgentActivity(userId, {
    agent: 'Planner',
    message: 'Analyzing input and building execution plan...',
    status: 'active',
    timestamp: new Date()
  });

  // 🔥 2. PLANNER (TASK DECOMPOSITION - MODULE 2)
  const domainsToTrigger = await plannerAgent.planExecution(query, context.memory, userId);

  emitAgentActivity(userId, {
    agent: 'Planner',
    message: `Tasks identified: ${domainsToTrigger.join(', ')}`,
    status: 'success',
    timestamp: new Date()
  });

  // 🔥 3. MCP TOOL EXECUTION (MODULE 6)
  // Mapping domain IDs to their registered MCP Tool names
  const toolMap = {
    healthcare: "healthcare_diagnostics",
    vitals: "vitals_monitoring",
    operations: "hospital_operations",
    billing: "payflow_billing",
    traffic: "traffic_logistics"
  };

  const agentTasks = domainsToTrigger.map(async (domain) => {
    const toolName = toolMap[domain];
    if (!toolName) return;

    emitAgentActivity(userId, {
      agent: domain.toUpperCase(),
      message: `Calling MCP Tool: ${toolName}...`,
      status: 'active',
      timestamp: new Date()
    });

    try {
      // THE CORE MCP CALL
      const result = await server.callTool(toolName, context);
      
      // Context is already updated inside the standard agents, 
      // but we ensure it's in context.results for the Response Agent.
      context.results[domain] = result;

      emitAgentActivity(userId, {
        agent: domain.toUpperCase(),
        message: `${domain} analysis completed`,
        status: 'success',
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      emitAgentActivity(userId, {
        agent: domain.toUpperCase(),
        message: `Execution failed: ${error.message}`,
        status: 'error',
        timestamp: new Date()
      });
    }
  });

  // 🔥 PARALLEL EXECUTION (TRUE MCP)
  await Promise.all(agentTasks);

  // 🔥 4. RESPONSE SYNTHESIS (MODULE 4)
  emitAgentActivity(userId, {
    agent: 'Response',
    message: 'Synthesizing final output...',
    status: 'active',
    timestamp: new Date()
  });

  const finalResponse = await responseAgent.generateResponse(context.results, context);

  // 🔥 5. MEMORY UPDATE (CONTEXT PERSISTENCE - MODULE 7)
  memoryService.saveInteraction(userId, {
    query,
    response: finalResponse.answer,
    context
  });

  return finalResponse;
};

module.exports = { processQuery };