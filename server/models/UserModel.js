const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  avatar: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  verify_email: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    default: null,
  },
  otp_expiry: {
    type: Date,
    default: null,
  },
  refresh_token: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['patient', 'hospital'],
    default: 'patient',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
