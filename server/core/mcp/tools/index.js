const server = require('../server');
const { analyzeHealth } = require('../../agents/domain/healthAgent');
const { monitorVitals } = require('../../agents/domain/vitalsAgent');
const { manageOperations } = require('../../agents/domain/operationsAgent');
const { analyzeBilling } = require('../../agents/domain/payflowAgent');
const { analyzeTraffic } = require('../../agents/domain/trafficAgent');

/**
 * Register all domain agents as MCP Tools
 */
const initMCPTools = () => {
  server.registerTool({
    name: "healthcare_diagnostics",
    execute: analyzeHealth
  });

  server.registerTool({
    name: "vitals_monitoring",
    execute: monitorVitals
  });

  server.registerTool({
    name: "hospital_operations",
    execute: manageOperations
  });

  server.registerTool({
    name: "payflow_billing",
    execute: analyzeBilling
  });

  server.registerTool({
    name: "traffic_logistics",
    execute: analyzeTraffic
  });
};

module.exports = { initMCPTools };
