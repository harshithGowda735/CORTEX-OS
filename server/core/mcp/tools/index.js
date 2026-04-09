const server = require('../server');
const { analyzeHealth } = require('../../agents/domain/healthAgent');
const { monitorVitals } = require('../../agents/domain/vitalsAgent');
const { manageOperations } = require('../../agents/domain/operationsAgent');
const { analyzeBilling } = require('../../agents/domain/payflowAgent');
const { analyzeTraffic } = require('../../agents/domain/trafficAgent');
const { spatialNexusAnalysis } = require('../../agents/domain/logisticsAgent');

/**
 * Register all domain agents as MCP Tools
 */
const initMCPTools = () => {
  server.registerTool({
    name: "healthcare_diagnostics",
    description: "Analyzes symptoms, risk factors, and provides medical assessment and next steps.",
    execute: analyzeHealth
  });

  server.registerTool({
    name: "vitals_monitoring",
    description: "Monitors real-time biometric feeds like heart rate, SpO2, and blood pressure for alerts.",
    execute: monitorVitals
  });

  server.registerTool({
    name: "hospital_operations",
    description: "Manages doctor availability, bed occupancy, and duty shifts for hospital logistics.",
    execute: manageOperations
  });

  server.registerTool({
    name: "payflow_billing",
    description: "Automates billing calculations, predicts treatment costs, and detects financial anomalies.",
    execute: analyzeBilling
  });

  server.registerTool({
    name: "traffic_logistics",
    description: "Calculates emergency routes, ETA, and optimal navigation for medical transport.",
    execute: analyzeTraffic
  });

  server.registerTool({
    name: "spatial_nexus_analysis",
    description: "Analyzes geographical context, identifies nearest hospitals, and rankings facilities by proximity.",
    execute: spatialNexusAnalysis
  });
};

module.exports = { initMCPTools };
