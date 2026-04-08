const { planExecution } = require('../agents/plannerAgent');
const { generateResponse } = require('../agents/responseAgent');
const { analyzeHealth } = require('../agents/domain/healthAgent');
const { analyzeTraffic } = require('../agents/domain/trafficAgent');
const { monitorVitals } = require('../agents/domain/vitalsAgent');
const { analyzeBilling } = require('../agents/domain/payflowAgent');
const { manageOperations } = require('../agents/domain/operationsAgent');
const memoryService = require('../memory/memoryService');
const { emitAgentActivity } = require('../socket/socketHandler');

const processQuery = async (query, userId = 'default_user', io) => {
  console.log(`\n🧠 [CORTEX-OS] Processing query for user ${userId}: "${query}"`);
  
  // 1. Get Memory/Context
  const memory = memoryService.getMemory(userId);
  
  emitAgentActivity(userId, { agent: 'CORTEX-OS', message: 'Orchestrating hospital intelligence workflow...', status: 'info', timestamp: new Date() });

  // 2. Planning Phase
  const domainsToTrigger = await planExecution(query, memory, userId);
  
  // 3. Execution Phase (Run agents in parallel)
  const agentTasks = [];
  
  if (domainsToTrigger.includes('healthcare')) agentTasks.push(analyzeHealth(query, userId));
  if (domainsToTrigger.includes('traffic')) agentTasks.push(analyzeTraffic(query, userId));
  if (domainsToTrigger.includes('vitals')) agentTasks.push(monitorVitals(query, userId));
  if (domainsToTrigger.includes('billing')) agentTasks.push(analyzeBilling(query, userId));
  if (domainsToTrigger.includes('operations')) agentTasks.push(manageOperations(query, userId));

  const results = await Promise.all(agentTasks);
  
  // 4. Response Synthesis
  const finalResponse = await generateResponse(results, query, userId);
  
  // 5. Update Memory
  memoryService.saveInteraction(userId, { query, response: finalResponse.answer });
  
  return finalResponse;
};

module.exports = { processQuery };
