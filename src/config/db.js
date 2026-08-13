const mongoose = require('mongoose');

const connectDb = async () => {
  mongoose.set('strictQuery', true);
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn('MongoDB URI is not configured. API will start without database connectivity.');
    return;
  }
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully');
    
    // Automatically seed/verify Super Admin account and roles on startup
    const seedSuperAdmin = require('../jobs/seed');
    await seedSuperAdmin().catch((err) => console.error('Auto seed failed:', err.message));
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error;
    console.warn(`MongoDB unavailable (${error.message}). API will start in degraded development mode.`);
  }
};

module.exports = connectDb;

