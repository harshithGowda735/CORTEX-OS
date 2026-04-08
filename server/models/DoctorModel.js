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
  status: {
    type: String,
    enum: ['Available', 'On Duty', 'Off Duty', 'In Surgery'],
    default: 'Available'
  },
  shift: {
    start: String,
    end: String
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
