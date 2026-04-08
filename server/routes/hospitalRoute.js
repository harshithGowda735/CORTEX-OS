const express = require('express');
const {
  getHospitalDashboard,
  updateDoctorStatus,
  updateBeds,
  updateMedicine,
  updatePricing,
  manualBedUpdate,
  messagePatient,
  addDoctor,
  deleteDoctor
} = require('../controllers/hospitalController');

const hospitalRouter = express.Router();

// Dashboard (full snapshot)
hospitalRouter.get('/dashboard', getHospitalDashboard);

// Doctor management
hospitalRouter.post('/doctor', addDoctor);
hospitalRouter.patch('/doctor/:doctorId/status', updateDoctorStatus);
hospitalRouter.delete('/doctor/:doctorId', deleteDoctor);

// Bed management
hospitalRouter.patch('/beds', updateBeds);
hospitalRouter.patch('/beds/manual', manualBedUpdate);

// Medicine management
hospitalRouter.patch('/medicine/:medicineId', updateMedicine);

// Pricing management
hospitalRouter.patch('/pricing', updatePricing);

// Patient interaction
hospitalRouter.post('/patient/alert', messagePatient);

module.exports = hospitalRouter;
