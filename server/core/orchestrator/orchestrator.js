const plannerAgent = require('../agents/plannerAgent');
const responseAgent = require('../agents/responseAgent');
const memoryService = require('../memory/memoryService');
const server = require('../mcp/server');
const { initMCPTools } = require('../mcp/tools');
const { emitAgentActivity } = require('../socket/socketHandler');
const { autonomousBook } = require('../../controllers/hospitalController');

/**
 * MODULE 1: MCP CORE (ORCHESTRATOR + CONTEXT)
 * MODULE 6: TOOL EXECUTION FROM ORCHESTRATOR
 * MODULE 12: AUTONOMOUS BOOKING & RESOURCE ALLOCATION
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
      const result = await server.callTool(toolName, context);
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

  // 🔥 4. AUTONOMOUS BOOKING (MODULE 12)
  // If healthcare risk is High or Moderate, auto-book appointment and allocate resources
  const healthResult = context.results.healthcare;
  const opsResult = context.results.operations;

  if (healthResult && (healthResult.riskLevel === 'High' || healthResult.riskLevel === 'Moderate')) {
    emitAgentActivity(userId, {
      agent: 'Auto-Booking',
      message: `${healthResult.riskLevel} risk detected. Initiating autonomous resource allocation...`,
      status: 'active',
      timestamp: new Date()
    });

    try {
      const bookingResult = await autonomousBook({
        userId: userId === 'demo_user' ? '69d63cad259998ad67ae6286' : userId,
        department: opsResult?.assignedSpecialization || 'General Consultation',
        severity: healthResult.riskLevel,
        doctorId: opsResult?.assignedDoctorId || null,
        reason: `Auto-booked: ${healthResult.assessment}`
      });

      context.results.autoBooking = bookingResult;

      emitAgentActivity(userId, {
        agent: 'Auto-Booking',
        message: bookingResult.message || 'Booking completed.',
        status: 'success',
        timestamp: new Date()
      });

      // Emit hospital-update so the Management Dashboard updates in real-time
      if (io) {
        io.emit('hospital-update', {
          type: 'auto-booking',
          data: bookingResult
        });
      }
    } catch (error) {
      console.error('❌ [AUTO-BOOKING] Failed:', error.message);
      emitAgentActivity(userId, {
        agent: 'Auto-Booking',
        message: `Booking failed: ${error.message}`,
        status: 'error',
        timestamp: new Date()
      });
    }
  }

  // 🔥 5. RESPONSE SYNTHESIS (MODULE 4)
  emitAgentActivity(userId, {
    agent: 'Response',
    message: 'Synthesizing final output...',
    status: 'active',
    timestamp: new Date()
  });

  const finalResponse = await responseAgent.generateResponse(context.results, context);

  // 🔥 6. MEMORY UPDATE (CONTEXT PERSISTENCE - MODULE 7)
  memoryService.saveInteraction(userId, {
    query,
    response: finalResponse.answer,
    context
  });

  return finalResponse;
};

module.exports = { processQuery };