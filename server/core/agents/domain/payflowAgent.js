const { emitAgentActivity } = require('../../socket/socketHandler');
const HospitalResourceModel = require('../../../models/HospitalResourceModel');

const analyzeBilling = async (context) => {
  const { query, userId } = context;
  emitAgentActivity(userId, { agent: 'PayFlow Agent', message: 'Computing severity-adjusted billing...', status: 'thinking' });

  try {
    const hospital = await HospitalResourceModel.findOne().lean();
    const healthResult = context.results?.healthcare;

    // Determine severity level from healthcare agent results
    const severity = healthResult?.riskLevel?.toLowerCase() || 'low';
    const multiplier = hospital?.severityPricing?.[severity]?.multiplier || 1.0;
    const severityLabel = hospital?.severityPricing?.[severity]?.label || 'Standard';

    const base = hospital?.basePricing || {
      consultation: 500, bedPerDay: 3000, icuPerDay: 8000, emergencyFee: 2000, labTests: 1500
    };

    // Build dynamic breakdown
    const breakdown = [
      { item: 'Consultation Fee', cost: Math.round(base.consultation * multiplier) },
      { item: 'Diagnostic Tests', cost: Math.round(base.labTests * multiplier) },
    ];

    if (severity === 'high') {
      breakdown.push({ item: 'Emergency Surcharge', cost: Math.round(base.emergencyFee * multiplier) });
      breakdown.push({ item: 'ICU Bed (per day)', cost: Math.round(base.icuPerDay * multiplier) });
    } else {
      breakdown.push({ item: 'Room Charges (per day)', cost: Math.round(base.bedPerDay * multiplier) });
    }

    const total = breakdown.reduce((sum, item) => sum + item.cost, 0);
    const predicted = Math.round(total * 2.8); // Predicted for 3-day stay

    // Check medicine costs if relevant
    let medicineEstimate = 0;
    if (hospital?.medicines) {
      const relevantMeds = hospital.medicines.filter(m => {
        if (severity === 'high') return m.category === 'Emergency' || m.category === 'Cardiac';
        return m.category === 'General' || m.category === 'Painkiller';
      }).slice(0, 3);

      relevantMeds.forEach(m => {
        const medCost = m.pricePerUnit * 10; // Assume 10 units
        medicineEstimate += medCost;
        breakdown.push({ item: `${m.name} (est.)`, cost: medCost });
      });
    }

    const response = {
      domain: 'Billing',
      consultation: Math.round(base.consultation * multiplier),
      tests: Math.round(base.labTests * multiplier),
      room: severity === 'high' ? Math.round(base.icuPerDay * multiplier) : Math.round(base.bedPerDay * multiplier),
      total: total + medicineEstimate,
      predicted: predicted + medicineEstimate,
      breakdown: breakdown.map(b => ({ ...b, cost: `₹${b.cost.toLocaleString()}` })),
      severityLevel: severityLabel,
      severityMultiplier: `${multiplier}x`,
      insuranceOptimization: severity === 'high'
        ? 'Emergency coverage activated. Consider switching to a critical illness rider to save up to 40%.'
        : 'Standard coverage applies. Switching to preferred provider insurance could save 20%.'
    };

    emitAgentActivity(userId, {
      agent: 'PayFlow Agent',
      message: `Billing synced: ${severityLabel} (${multiplier}x). Estimated: ₹${(total + medicineEstimate).toLocaleString()}`,
      status: 'done'
    });

    context.results.billing = response;
    return response;
  } catch (error) {
    console.error('❌ [PAYFLOW AGENT] Error:', error.message);
    const fallback = {
      consultation: 500, tests: 2000, room: 3000, total: 5500, predicted: 15000,
      breakdown: [{ item: 'Consultation Fee', cost: '₹500' }, { item: 'Diagnostic Tests', cost: '₹2,000' }],
      insuranceOptimization: 'Standard coverage applies.'
    };
    context.results.billing = fallback;
    emitAgentActivity(userId, { agent: 'PayFlow Agent', message: 'Billing (fallback data).', status: 'done' });
    return fallback;
  }
};

module.exports = { analyzeBilling };
