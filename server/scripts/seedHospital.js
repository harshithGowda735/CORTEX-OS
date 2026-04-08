/**
 * Seed Script - Populates the database with demo hospital data
 * Run: node scripts/seedHospital.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const HospitalResourceModel = require('../models/HospitalResourceModel');
const DoctorModel = require('../models/DoctorModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrihealth';

const doctors = [
  { name: 'Dr. Sarah Chen', specialization: 'Cardiology', experience: 12, status: 'Available', shift: { start: '08:00', end: '16:00' } },
  { name: 'Dr. Michael Ross', specialization: 'General Consultation', experience: 8, status: 'On Duty', shift: { start: '09:00', end: '17:00' } },
  { name: 'Dr. Priya Sharma', specialization: 'Neurology', experience: 15, status: 'Available', shift: { start: '10:00', end: '18:00' } },
  { name: 'Dr. James Wilson', specialization: 'Orthopedics', experience: 10, status: 'In Surgery', shift: { start: '07:00', end: '15:00' } },
  { name: 'Dr. Ananya Rao', specialization: 'Pediatrics', experience: 6, status: 'Available', shift: { start: '08:00', end: '16:00' } },
  { name: 'Dr. David Kim', specialization: 'Surgery', experience: 18, status: 'Available', shift: { start: '06:00', end: '14:00' } },
  { name: 'Dr. Fatima Ali', specialization: 'Dermatology', experience: 9, status: 'Off Duty', shift: { start: '12:00', end: '20:00' } },
];

const hospitalResource = {
  hospitalName: 'CORTEX City Care Hospital',
  location: {
    address: 'Sector 14, Bannerghatta Road, Bengaluru 560076',
    lat: 12.8914,
    lng: 77.5965
  },
  beds: {
    total: 200,
    available: 42,
    icu: { total: 30, available: 8 },
    general: { total: 120, available: 25 },
    emergency: { total: 50, available: 9 }
  },
  medicines: [
    { name: 'Aspirin (ASA)', category: 'Cardiac', stock: 500, unit: 'tablets', pricePerUnit: 5, threshold: 50 },
    { name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 300, unit: 'capsules', pricePerUnit: 12, threshold: 30 },
    { name: 'Paracetamol 650mg', category: 'Painkiller', stock: 1000, unit: 'tablets', pricePerUnit: 3, threshold: 100 },
    { name: 'Insulin Glargine', category: 'General', stock: 80, unit: 'vials', pricePerUnit: 450, threshold: 10 },
    { name: 'Nitroglycerin', category: 'Emergency', stock: 120, unit: 'tablets', pricePerUnit: 25, threshold: 20 },
    { name: 'Morphine Sulfate', category: 'Anesthetic', stock: 45, unit: 'ampoules', pricePerUnit: 180, threshold: 5 },
    { name: 'Ceftriaxone 1g', category: 'Antibiotic', stock: 200, unit: 'vials', pricePerUnit: 85, threshold: 20 },
    { name: 'Adrenaline', category: 'Emergency', stock: 150, unit: 'ampoules', pricePerUnit: 35, threshold: 15 },
    { name: 'Diazepam 5mg', category: 'General', stock: 250, unit: 'tablets', pricePerUnit: 8, threshold: 25 },
    { name: 'Metformin 500mg', category: 'General', stock: 600, unit: 'tablets', pricePerUnit: 4, threshold: 60 },
  ],
  basePricing: {
    consultation: 500,
    bedPerDay: 3000,
    icuPerDay: 8000,
    emergencyFee: 2000,
    labTests: 1500
  },
  severityPricing: {
    low: { multiplier: 1.0, label: 'Standard' },
    moderate: { multiplier: 1.5, label: 'Urgent Care' },
    high: { multiplier: 2.5, label: 'Emergency Critical' }
  }
};

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'agrihealth'
    });
    console.log('✅ Connected to MongoDB (agrihealth)');

    // Clear existing data
    await DoctorModel.deleteMany({});
    await HospitalResourceModel.deleteMany({});
    console.log('🗑️  Cleared existing doctors and hospital resources');

    // Seed doctors
    const createdDoctors = await DoctorModel.insertMany(doctors);
    console.log(`👨‍⚕️ Seeded ${createdDoctors.length} doctors`);

    // Seed hospital resource
    const createdHospital = await HospitalResourceModel.create(hospitalResource);
    console.log(`🏥 Seeded hospital: ${createdHospital.hospitalName}`);
    console.log(`   📦 ${createdHospital.medicines.length} medicines in inventory`);
    console.log(`   🛏️  ${createdHospital.beds.available}/${createdHospital.beds.total} beds available`);

    console.log('\n🎉 Seed complete! Hospital is ready for demo.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
