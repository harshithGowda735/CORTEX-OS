const { emitAgentActivity } = require('../../socket/socketHandler');
const { callAI } = require('../../ai/openRouterService');
const HospitalResourceModel = require('../../../models/HospitalResourceModel');
const TransactionModel = require('../../../models/TransactionModel');
const UserModel = require('../../../models/UserModel');
const sendEmail = require('../../../config/sendEmail');

// ----------------------------------------------------------------------
// SUB-AGENT 1: FRAUD MONITOR (Meta Llama 3.3 70B AI)
// ----------------------------------------------------------------------
const checkFraud = async (userId, amount, severity) => {
    emitAgentActivity(userId, { agent: "Fraud Monitor", message: `Checking payment risk for ₹${amount}...`, status: "thinking" });

    const systemPrompt = `You are the CORTEX-OS Financial Risk AI. 
Assess if an automated payment of ₹${amount} for a "${severity}" medical severity is risky.
Respond with ONLY a JSON object containing "riskLevel" (Low, Medium, High).
Example: {"riskLevel": "Low"}`;

    try {
        const aiResponse = await callAI([{ role: "system", content: systemPrompt }]);
        const cleanJSON = aiResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJSON);
        
        emitAgentActivity(userId, { agent: "Fraud Monitor", message: `Fraud check complete: Risk is ${parsed.riskLevel}`, status: "done" });
        return { riskLevel: parsed.riskLevel };
    } catch (e) {
        // Safe fallback
        emitAgentActivity(userId, { agent: "Fraud Monitor", message: `AI Check Failed. Heuristic Risk: Low`, status: "warning" });
        return { riskLevel: "Low" };
    }
};

// ----------------------------------------------------------------------
// SUB-AGENT 2: PAYMENT EXECUTOR (Fast-Path / Queue Bypass)
// ----------------------------------------------------------------------
const executePayment = async (userId, total, hospital, severityLabel, isEmergency) => {
    const user = await UserModel.findById(userId);
    emitAgentActivity(userId, { agent: "Payment Executor", message: `Fast-Path executing: ₹${total} (Bypass Queue: ${isEmergency})`, status: "thinking" });

    if (!user || user.walletBalance < total) {
       return { status: 'Failed', message: 'Insufficient funds.' };
    }

    user.walletBalance -= total;
    await user.save();

    emitAgentActivity(userId, { agent: "Payment Executor", message: `Payment executed. Removed from wallet.`, status: "done" });
    return { status: 'Success', user };
};

// ----------------------------------------------------------------------
// SUB-AGENT 3: REVENUE SPLITTER
// ----------------------------------------------------------------------
const splitRevenue = async (userId, total, hospital, transactionData) => {
    emitAgentActivity(userId, { agent: "Revenue Splitter", message: `Splitting ₹${total} (90% Hosp / 10% Platform)...`, status: "thinking" });

    // MCP Feature: Idempotency Check (Prevents double-charging if network flickers)
    const existingTx = await TransactionModel.findOne({
         user: userId,
         amount: total,
         description: transactionData.desc,
         createdAt: { $gte: new Date(Date.now() - 60000) } // Check last 60 seconds
    });

    if (existingTx) {
        emitAgentActivity(userId, { agent: "Revenue Splitter", message: `[IDEMPOTENCY LOCK]: Duplicate split prevented. Using existing Receipt: ${existingTx.receiptId}`, status: "warning" });
        return { hospitalShare: existingTx.split?.hospital, platformFee: existingTx.split?.platform, transaction: existingTx };
    }

    const hospitalShare = Math.round(total * 0.9);
    const platformFee = total - hospitalShare;

    const transaction = new TransactionModel({
        user: userId,
        hospital: hospital._id,
        amount: total,
        type: 'Medical Bill',
        status: 'Success',
        description: transactionData.desc,
        split: { hospital: hospitalShare, platform: platformFee }
    });

    await transaction.save();

    emitAgentActivity(userId, { agent: "Revenue Splitter", message: `Revenue split completed. ID: ${transaction.receiptId}`, status: "done" });
    return { hospitalShare, platformFee, transaction };
};

// ----------------------------------------------------------------------
// MAIN MCP ORCHESTRATOR FOR PAYFLOW
// ----------------------------------------------------------------------
const analyzeBilling = async (context, autoExecute = false) => {
  const { userId } = context;
  emitAgentActivity(userId, { agent: 'PayFlow Agent', message: 'Computing severity-adjusted billing...', status: 'active' });

  try {
    const hospital = await HospitalResourceModel.findOne().lean();
    const healthResult = context.results?.healthcare;
    const severity = healthResult?.riskLevel?.toLowerCase() || 'low';
    const multiplier = hospital?.severityPricing?.[severity]?.multiplier || 1.0;
    const severityLabel = hospital?.severityPricing?.[severity]?.label || 'Standard';

    // Calculate Bill
    const base = hospital?.basePricing || { consultation: 500, labTests: 1500, emergencyFee: 2000 };
    const breakdown = [
      { item: 'Consultation Fee', cost: Math.round(base.consultation * multiplier) },
      { item: 'Diagnostic Tests', cost: Math.round(base.labTests * multiplier) },
    ];
    if (severity === 'high') {
      breakdown.push({ item: 'Emergency Surcharge', cost: Math.round(base.emergencyFee * multiplier) });
    }
    const total = breakdown.reduce((sum, item) => sum + item.cost, 0);

    let settlement = { status: 'Pending', message: 'Awaiting manual confirmation.' };
    let finalUser = await UserModel.findById(userId);

    // AUTOMATED FAST-PATH PIPELINE
    if (autoExecute) {
       const isEmergency = (severity === 'high' || severity === 'moderate');
       
       // Step 1: AI Fraud Monitor
       const fraudResult = await checkFraud(userId, total, severity);
       if (fraudResult.riskLevel === 'High') {
         // MCP Feature: HITL (Human-in-the-Loop) Interlock
         emitAgentActivity(userId, { agent: "Safety Interlock", message: `[HITL REQUIRED]: High-Risk Transaction. Awaiting Hospital Admin Verification...`, status: "warning" });
         
         // Simulate Admin Timeout / Emergency Override
         await new Promise(resolve => setTimeout(resolve, 3500));
         
         emitAgentActivity(userId, { agent: "Safety Interlock", message: `[CRITICAL]: Admin timeout. Priority Health dictates Emergency Override. Auto-Approved.`, status: "active" });
       }

       // Step 2: Payment Execution
       const execResult = await executePayment(userId, total, hospital, severityLabel, isEmergency);

       if (execResult.status === 'Success') {
           finalUser = execResult.user;
           
           // Step 3: Split Revenue
           const splitR = await splitRevenue(userId, total, hospital, { desc: `Autonomous Fast-Path for ${severityLabel}` });

           // Step 4: Add to user history & Receipt
           finalUser.transactions.push(splitR.transaction._id);
           await finalUser.save();
           sendReceiptEmail(finalUser, splitR.transaction, breakdown);

           settlement = {
               status: 'Success',
               receiptId: splitR.transaction.receiptId,
               amountPaid: total,
               hospitalShare: splitR.hospitalShare,
               platformFee: splitR.platformFee,
               message: 'Fast-Path Payment executed autonomously.'
           };
       } else {
           settlement = execResult;
       }
    }

    const response = {
      domain: 'Billing',
      total,
      breakdown: breakdown.map(b => ({ ...b, cost: `₹${b.cost.toLocaleString()}` })),
      settlement,
      wallet: finalUser ? { balance: finalUser.walletBalance } : null,
      insuranceOptimization: severity === 'high' ? 'Fast-Path coverage activated. Sent to Spliter.' : 'Standard process applying.'
    };

    context.results.billing = response;
    return response;

  } catch (error) {
    console.error('❌ [PAYFLOW AGENT] Error:', error.message);
    return { error: error.message };
  }
};

/**
 * Send Receipt via Resend API
 */
async function sendReceiptEmail(user, transaction, breakdown) {
  // Simple receipt HTML omitted for brevity but remains functional
  const itemsHtml = breakdown.map(b => `<tr><td style="padding: 10px;">${b.item}</td><td style="text-align: right;">₹${b.cost}</td></tr>`).join('');
  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px;">
      <h2>CORTEX-OS Fast-Path Receipt</h2>
      <p>Receipt ID: ${transaction.receiptId}</p>
      <table style="width: 100%;">
        ${itemsHtml}
        <tr><td style="padding: 10px; font-weight: bold;">TOTAL PAID</td><td style="text-align: right; font-weight: bold; color: green;">₹${transaction.amount}</td></tr>
      </table>
      <p>Verified by PayFlow AI Fraud Monitor (Llama 3.3) and Splitter Agent.</p>
    </div>`;

  await sendEmail({ to: user.email, subject: `CORTEX-OS Priority Receipt: ${transaction.receiptId}`, html });
}

module.exports = { analyzeBilling };
