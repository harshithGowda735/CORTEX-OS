const { emitAgentActivity } = require('../../socket/socketHandler');
const HospitalResourceModel = require('../../../models/HospitalResourceModel');
const TransactionModel = require('../../../models/TransactionModel');
const UserModel = require('../../../models/UserModel');
const sendEmail = require('../../../config/sendEmail');

const analyzeBilling = async (context, autoExecute = false) => {
  const { query, userId } = context;
  emitAgentActivity(userId, { agent: 'PayFlow Agent', message: 'Computing severity-adjusted billing...', status: 'thinking' });

  try {
    const hospital = await HospitalResourceModel.findOne().lean();
    const user = await UserModel.findById(userId);
    const healthResult = context.results?.healthcare;

    // Determine severity level
    const severity = healthResult?.riskLevel?.toLowerCase() || 'low';
    const multiplier = hospital?.severityPricing?.[severity]?.multiplier || 1.0;
    const severityLabel = hospital?.severityPricing?.[severity]?.label || 'Standard';

    const base = hospital?.basePricing || {
      consultation: 500, bedPerDay: 3000, icuPerDay: 8000, emergencyFee: 2000, labTests: 1500
    };

    const breakdown = [
      { item: 'Consultation Fee', cost: Math.round(base.consultation * multiplier) },
      { item: 'Diagnostic Tests', cost: Math.round(base.labTests * multiplier) },
    ];

    if (severity === 'high') {
      breakdown.push({ item: 'Emergency Surcharge', cost: Math.round(base.emergencyFee * multiplier) });
    }

    const total = breakdown.reduce((sum, item) => sum + item.cost, 0);
    
    // Autonomous Settlement Logic
    let settlement = { status: 'Pending', message: 'Awaiting manual confirmation.' };
    
    if (autoExecute && user && user.walletBalance >= total) {
      emitAgentActivity(userId, { agent: 'PayFlow Agent', message: `Autonomous Settlement Initialized (Wallet: ₹${user.walletBalance.toLocaleString()})`, status: 'active' });
      
      // Perform Settlement
      const hospitalShare = Math.round(total * 0.9);
      const platformFee = total - hospitalShare;

      const transaction = new TransactionModel({
        user: userId,
        hospital: hospital._id,
        amount: total,
        type: 'Medical Bill',
        status: 'Success',
        description: `Autonomous settlement for ${severityLabel} care.`,
        split: { hospital: hospitalShare, platform: platformFee }
      });

      await transaction.save();

      // Update User Wallet
      user.walletBalance -= total;
      user.transactions.push(transaction._id);
      await user.save();

      settlement = {
        status: 'Success',
        receiptId: transaction.receiptId,
        amountPaid: total,
        hospitalShare,
        platformFee,
        message: 'Payment executed autonomously from CORTEX Wallet.'
      };

      emitAgentActivity(userId, { agent: 'PayFlow Agent', message: `✅ Transaction Secure: ${transaction.receiptId}`, status: 'success' });

      // Trigger Email Receipt
      sendReceiptEmail(user, transaction, breakdown);
    }

    const response = {
      domain: 'Billing',
      total,
      breakdown: breakdown.map(b => ({ ...b, cost: `₹${b.cost.toLocaleString()}` })),
      settlement,
      wallet: user ? { balance: user.walletBalance } : null,
      insuranceOptimization: severity === 'high'
        ? 'Emergency coverage activated. Settlement automated.'
        : 'Standard coverage applies.'
    };

    context.results.billing = response;
    return response;
  } catch (error) {
    console.error('❌ [PAYFLOW AGENT] Error:', error.message);
    return { error: error.message };
  }
};

/**
 * Send Receipt via Resend
 */
async function sendReceiptEmail(user, transaction, breakdown) {
  const itemsHtml = breakdown.map(b => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${b.item}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${b.cost.toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 2px solid #10b981; border-radius: 20px; padding: 30px;">
      <h1 style="color: #0f172a; margin-bottom: 5px;">CORTEX<span style="color: #10b981;">-OS</span></h1>
      <p style="text-transform: uppercase; font-size: 10px; letter-spacing: 2px; color: #64748b;">Autonomous Health Nexus</p>
      
      <div style="margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 15px;">
        <h2 style="margin: 0; color: #10b981;">Payment Receipt</h2>
        <p style="font-size: 12px; color: #64748b;">Receipt ID: ${transaction.receiptId}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 10px; text-align: left;">Description</th>
            <th style="padding: 10px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td style="padding: 20px 10px; font-weight: bold;">TOTAL PAID</td>
            <td style="padding: 20px 10px; text-align: right; font-weight: bold; color: #10b981; font-size: 20px;">₹${transaction.amount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #64748b;">
        <p>This payment was processed autonomously via your CORTEX Managed Wallet.</p>
        <p>Verified by PayFlow AI Fraud Monitoring.</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: `Medical Receipt: ${transaction.receiptId} - CORTEX-OS`,
    html
  });
}

module.exports = { analyzeBilling };

module.exports = { analyzeBilling };
