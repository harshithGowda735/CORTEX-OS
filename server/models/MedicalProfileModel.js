const mongoose = require('mongoose');

const medicalProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  medicalHistory: [String],
  admissions: [{
    admitDate: { type: Date, default: Date.now },
    predictedDischargeDate: Date,
    actualDischargeDate: Date,
    reason: String,
    status: { type: String, enum: ['Active', 'Discharged'], default: 'Active' }
  }],
  vitals: {
    heartRate: { type: Number, default: 75 },
    bloodPressure: { type: String, default: '120/80' },
    oxygenLevel: { type: Number, default: 98 },
    temperature: { type: Number, default: 98.6 },
    lastUpdated: { type: Date, default: Date.now }
  },
  aiInsights: [{
    insight: String,
    urgency: { type: String, enum: ['Normal', 'Critical', 'Emergency'], default: 'Normal' },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

const MedicalProfileModel = mongoose.model('MedicalProfile', medicalProfileSchema);

module.exports = MedicalProfileModel;
