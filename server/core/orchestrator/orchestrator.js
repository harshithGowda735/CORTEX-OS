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

const processQuery = async (query, userId = 'default_user', io, location) => {
  console.log(`🧠 [CORTEX MCP] Processing: "${query}"`);

  // 🔥 1. CREATE SHARED CONTEXT (CORE MCP - MODULE 1)
  const context = {
    query,
    userId,
    location, // Injected from frontend
    geoContext: null, // Populated by spatial_nexus_analysis
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

  // 🔥 2. PRE-PROCESS: SPATIAL NEXUS (MCP Core Concept)
  // If location is provided, we ALWAYS run the logistics tool first to enrich the context
  if (location) {
    try {
      const geoResult = await server.callTool("spatial_nexus_analysis", context);
      context.results.logistics = geoResult;
    } catch (error) {
      console.error("❌ MCP Spatial Nexus Failed:", error.message);
    }
  }

  // 🔥 3. PLANNER (TASK DECOMPOSITION - MODULE 2)
  const domainsToTrigger = await plannerAgent.planExecution(query, context.memory, userId);

  emitAgentActivity(userId, {
    agent: 'Planner',
    message: `Tasks identified: ${domainsToTrigger.join(', ')}`,
    status: 'success',
    timestamp: new Date()
  });

  // 🔥 4. MCP TOOL EXECUTION (MODULE 6)
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
      // Special Logic for PayFlow: Real-time Autonomous Settlement
      let result;
      if (domain === 'billing') {
        const healthRisk = context.results.healthcare?.riskLevel;
        const autoExecute = healthRisk === 'High' || healthRisk === 'Moderate' || query.toLowerCase().includes('pay') || query.toLowerCase().includes('book');
        result = await server.callTool(toolName, context, autoExecute);
      } else {
        result = await server.callTool(toolName, context);
      }

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

  // 🔥 5. CONTEXTUAL DISPATCH (ACTION vs ADVICE)
  const healthResult = context.results.healthcare;
  const logisticsResult = context.results.logistics;
  
  if (healthResult) {
    const severity = healthResult.riskLevel;
    const isEmergency = severity === 'High' || severity === 'Moderate';

    if (isEmergency) {
      // CASE A: HIGH/MODERATE SEVERITY -> AUTONOMOUS ACTION (MCP)
      emitAgentActivity(userId, {
        agent: 'MCP Dispatcher',
        message: `🚨 Emergency Protocol: Severity ${severity} detected.`,
        status: 'active'
      });

      try {
        const bookingResult = await server.callTool("autonomous_emergency_booking", {
          userId: userId === 'demo_user' ? '69d63cad259998ad67ae6286' : userId,
          department: context.results.operations?.assignedSpecialization || 'Emergency Care',
          severity: severity,
          targetHospital: logisticsResult?.nearest?.name || 'CORTEX Hospital',
          reason: `Autonomous MCP Booking: ${healthResult.assessment}`
        });

        context.results.autoBooking = bookingResult;
        emitAgentActivity(userId, { agent: 'MCP Dispatcher', message: `✅ Admission Secured: ${bookingResult.message}`, status: 'success' });
      } catch (error) {
        console.error('❌ MCP Action Tool Failed:', error.message);
      }
    } else {
      // CASE B: LOW SEVERITY -> SUGGESTIVE ADVICE
      context.results.suggestion = {
        type: 'manual_appointment',
        message: "Your condition is currently stable. I recommend a routine checkup. You can book an appointment here.",
        canBookManual: true
      };
      emitAgentActivity(userId, { agent: 'MCP Dispatcher', message: "Stable condition detected. Suggesting manual appointment.", status: 'done' });
    }
  }

  // 🔥 6. RESPONSE SYNTHESIS (MODULE 4)
  emitAgentActivity(userId, {
    agent: 'Response',
    message: 'Synthesizing final output...',
    status: 'active',
    timestamp: new Date()
  });

  const finalResponse = await responseAgent.generateResponse(context.results, context);

  // 🔥 7. MEMORY UPDATE (CONTEXT PERSISTENCE - MODULE 7)
  memoryService.saveInteraction(userId, {
    query,
    response: finalResponse.answer,
    context
  });

  return finalResponse;
};

module.exports = { processQuery };