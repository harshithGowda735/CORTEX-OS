const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: [true, "Please provide department name"],
    enum: ['General Consultation', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Neurology']
  },
  appointmentDate: {
    type: Date,
    required: [true, "Please provide appointment date"]
  },
  timeSlot: {
    type: String,
    required: [true, "Please provide time slot"]
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  reason: {
    type: String
  }
}, {
  timestamps: true
});

const BookingModel = mongoose.model('Booking', bookingSchema);

module.exports = BookingModel;
