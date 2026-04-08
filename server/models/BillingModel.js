const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    description: String,
    category: { type: String, enum: ['Consultation', 'Bed', 'Medicine', 'Lab Test', 'Surgery', 'Other'] },
    amount: Number,
    date: { type: Date, default: Date.now }
  }],
  autoCalculatedCharges: {
    bedCharges: { type: Number, default: 0 },
    serviceTax: { type: Number, default: 0 }
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  predictedTotal: Number,
  status: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid', 'Insurance Pending'],
    default: 'Unpaid'
  },
  anomalies: [String],
  insuranceOptimization: String
}, {
  timestamps: true
});

const BillingModel = mongoose.model('Billing', billingSchema);

module.exports = BillingModel;
