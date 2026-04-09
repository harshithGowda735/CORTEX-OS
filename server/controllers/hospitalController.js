const HospitalResourceModel = require('../models/HospitalResourceModel');
const DoctorModel = require('../models/DoctorModel');
const BookingModel = require('../models/BookingModel');
const TransactionModel = require('../models/TransactionModel');

// GET full hospital dashboard data
const getHospitalDashboard = async (req, res) => {
  try {
    const hospital = await HospitalResourceModel.findOne();
    const doctors = await DoctorModel.find().sort({ status: 1 });
    const recentBookings = await BookingModel.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name email');

    const transactions = await TransactionModel.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name');

    return res.json({
      success: true,
      data: { hospital, doctors, recentBookings, transactions }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE doctor status (Available / On Duty / In Surgery / Off Duty)
const updateDoctorStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.body;

    const doctor = await DoctorModel.findByIdAndUpdate(
      doctorId,
      { status },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) io.emit('hospital-update', { type: 'doctor-status', data: doctor });

    return res.json({ success: true, data: doctor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE bed availability
const updateBeds = async (req, res) => {
  try {
    const { bedType, available } = req.body; // bedType: 'icu' | 'general' | 'emergency'
    const hospital = await HospitalResourceModel.findOne();
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    if (hospital.beds[bedType]) {
      hospital.beds[bedType].available = available;
    }
    // Recalculate total available
    hospital.beds.available = hospital.beds.icu.available + hospital.beds.general.available + hospital.beds.emergency.available;
    await hospital.save();

    const io = req.app.get('io');
    if (io) io.emit('hospital-update', { type: 'beds', data: hospital.beds });

    return res.json({ success: true, data: hospital.beds });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE medicine stock
const updateMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { stock, pricePerUnit } = req.body;

    const hospital = await HospitalResourceModel.findOne();
    const medicine = hospital.medicines.id(medicineId);
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });

    if (stock !== undefined) medicine.stock = stock;
    if (pricePerUnit !== undefined) medicine.pricePerUnit = pricePerUnit;
    await hospital.save();

    const io = req.app.get('io');
    if (io) io.emit('hospital-update', { type: 'medicine', data: hospital.medicines });

    return res.json({ success: true, data: hospital.medicines });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE severity-based pricing
const updatePricing = async (req, res) => {
  try {
    const { basePricing, severityPricing } = req.body;
    const hospital = await HospitalResourceModel.findOne();
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    if (basePricing) hospital.basePricing = { ...hospital.basePricing, ...basePricing };
    if (severityPricing) hospital.severityPricing = { ...hospital.severityPricing, ...severityPricing };
    await hospital.save();

    const io = req.app.get('io');
    if (io) io.emit('hospital-update', { type: 'pricing', data: { basePricing: hospital.basePricing, severityPricing: hospital.severityPricing } });

    return res.json({ success: true, data: hospital });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// AUTONOMOUS BOOKING (called by the orchestrator, not by HTTP)
const autonomousBook = async ({ userId, department, severity, doctorId, reason, targetHospital }) => {
  try {
    const hospitalName = targetHospital || 'CORTEX City Care Hospital';
    const hospital = await HospitalResourceModel.findOne();
    if (!hospital) throw new Error('Hospital resource not found');

    // 1. Find next available time slot
    const now = new Date();
    const appointmentDate = new Date(now.getTime() + 30 * 60000); // 30 mins from now
    const timeSlot = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // 2. Determine bed type needed
    let bedType = 'general';
    if (severity === 'High') bedType = 'emergency';

    // 3. Allocate bed (Simulated for target hospital if not central)
    if (hospital.beds[bedType] && hospital.beds[bedType].available > 0) {
      hospital.beds[bedType].available -= 1;
      hospital.beds.available -= 1;
      await hospital.save();
    }

    // 4. Assign doctor
    if (doctorId) {
      await DoctorModel.findByIdAndUpdate(doctorId, { status: 'On Duty' });
    }

    // 5. Create booking record
    const booking = new BookingModel({
      user: userId,
      department: department || 'General Consultation',
      appointmentDate,
      timeSlot,
      status: severity === 'High' ? 'Confirmed' : 'Pending',
      reason: reason || `Auto-booked at ${hospitalName} by CORTEX-OS MCP`
    });
    await booking.save();

    // 6. Calculate estimated cost
    const multiplier = hospital.severityPricing[severity.toLowerCase()]?.multiplier || 1;
    const estimatedCost = Math.round(
      (hospital.basePricing.consultation +
        hospital.basePricing.labTests +
        (bedType === 'emergency' ? hospital.basePricing.emergencyFee : 0) +
        hospital.basePricing.bedPerDay) * multiplier
    );

    return {
      booking: booking.toObject(),
      hospitalName,
      bedAllocated: bedType,
      bedsRemaining: hospital.beds[bedType].available,
      estimatedCost,
      severityMultiplier: multiplier,
      message: `Auto-booked at ${hospitalName}: ${department} at ${timeSlot}. Bed (${bedType}) allocated. Est. cost: ₹${estimatedCost.toLocaleString()}`
    };
  } catch (error) {
    console.error('❌ [AUTONOMOUS BOOKING] Error:', error.message);
    return { error: error.message };
  }
};

// MANUAL ADMIT/DISCHARGE
const manualBedUpdate = async (req, res) => {
  try {
    const { bedType, increment } = req.body; // increment: 1 (discharge) or -1 (admit)
    const hospital = await HospitalResourceModel.findOne();
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    if (hospital.beds[bedType]) {
      hospital.beds[bedType].available += increment;
      hospital.beds.available += increment;
    }
    await hospital.save();

    const io = req.app.get('io');
    if (io) io.emit('hospital-update', { type: 'beds', data: hospital.beds });

    return res.json({ success: true, data: hospital.beds });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ADD DOCTOR
const addDoctor = async (req, res) => {
  try {
    const { name, specialization, experience, shift } = req.body;
    const newDoc = new DoctorModel({
      name,
      specialization,
      experience,
      shift,
      status: 'Available'
    });
    await newDoc.save();
    return res.status(201).json({ success: true, data: newDoc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE DOCTOR
const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    await DoctorModel.findByIdAndDelete(doctorId);
    return res.json({ success: true, message: 'Doctor removed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// SEND MESSAGE TO PATIENT
const messagePatient = async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    const io = req.app.get('io');
    
    if (io) {
      io.emit('hospital-alert', {
        userId,
        message,
        type: type || 'info', 
        timestamp: new Date()
      });
    }

    return res.json({ success: true, message: 'Alert sent to patient' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getHospitalDashboard,
  updateDoctorStatus,
  updateBeds,
  updateMedicine,
  updatePricing,
  autonomousBook,
  manualBedUpdate,
  messagePatient,
  addDoctor,
  deleteDoctor
};
