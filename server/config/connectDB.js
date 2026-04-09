const mongoose = require('mongoose');

async function connectDB() {
  try {
    console.log('🔋 [DB] Attempting to link with CORTEX Data Nexus...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'agrihealth',
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ [DB] MongoDB connected successfully');
  } catch (error) {
    console.error('❌ [DB] Connection error:', error.message);
    console.error('❌ [DB] Ensure your MongoDB Atlas IP Whitelist allows 0.0.0.0/0');
    // We do NOT exit(1) here so the server stays alive for logs
  }
}

module.exports = connectDB;
