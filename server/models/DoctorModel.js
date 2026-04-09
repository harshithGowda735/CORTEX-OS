const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Doctor name is required"]
  },
  specialization: {
    type: String,
    required: [true, "Specialization is required"],
    enum: ['General Consultation', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Neurology', 'Surgery']
  },
  experience: {
    type: Number,
    required: [true, "Experience in years is required"]
  },
  qualification: {
    type: String,
    required: [true, "Medical qualification is required"],
    default: "MBBS, MD"
  },
  email: {
    type: String,
    required: [true, "Professional email is required"],
    unique: true,
    default: function() { return `dr.${this.name?.toLowerCase().replace(/\s/g, '')}@cortex.os`; }
  },
  profileImage: {
    type: String,
    default: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop"
  },
  status: {
    type: String,
    enum: ['Available', 'On Duty', 'Off Duty', 'In Surgery'],
    default: 'Available'
  },
  shift: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' }
  },
  currentPatients: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const DoctorModel = mongoose.model('Doctor', doctorSchema);

module.exports = DoctorModel;
