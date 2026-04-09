const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Emergency', 'General', 'Cardiac', 'Antibiotic', 'Painkiller', 'Anesthetic', 'Other'], default: 'General' },
  stock: { type: Number, default: 0 },
  unit: { type: String, default: 'tablets' },
  pricePerUnit: { type: Number, default: 0 },
  threshold: { type: Number, default: 10 } // low stock alert
});

const hospitalResourceSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true,
    default: 'CORTEX City Care Hospital'
  },
  location: {
    address: { type: String, default: 'Sector 14, Bannerghatta Road, Bengaluru' },
    lat: { type: Number, default: 12.8914 },
    lng: { type: Number, default: 77.5965 }
  },
  beds: {
    total: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    icu: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
    general: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
    emergency: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } }
  },
  medicines: [medicineSchema],
  severityPricing: {
    low: { multiplier: { type: Number, default: 1.0 }, label: { type: String, default: 'Standard' } },
    moderate: { multiplier: { type: Number, default: 1.5 }, label: { type: String, default: 'Urgent Care' } },
    high: { multiplier: { type: Number, default: 2.5 }, label: { type: String, default: 'Emergency Critical' } }
  },
  basePricing: {
    consultation: { type: Number, default: 0 },
    bedPerDay: { type: Number, default: 0 },
    icuPerDay: { type: Number, default: 0 },
    emergencyFee: { type: Number, default: 0 },
    labTests: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const HospitalResourceModel = mongoose.model('HospitalResource', hospitalResourceSchema);

module.exports = HospitalResourceModel;
