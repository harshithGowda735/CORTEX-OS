const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  hospital: {
    type: mongoose.Schema.ObjectId,
    ref: 'HospitalResource',
    required: true
  },
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking'
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['Medical Bill', 'Platform Fee', 'Ambulance Charge', 'Pharmacy'],
    default: 'Medical Bill'
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed', 'Flagged'],
    default: 'Success'
  },
  split: {
    hospital: { type: Number },
    platform: { type: Number }
  },
  isAutonomous: {
    type: Boolean,
    default: true
  },
  receiptId: {
    type: String,
    unique: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

// Generate Receipt ID before saving
transactionSchema.pre('save', function(next) {
  if (!this.receiptId) {
    this.receiptId = 'REC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

const TransactionModel = mongoose.model('Transaction', transactionSchema);

module.exports = TransactionModel;
