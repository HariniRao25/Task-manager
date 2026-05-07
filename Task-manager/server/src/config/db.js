const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('MONGO_URI not set; skipping MongoDB connection.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected');
    return true;
  } catch (err) {
    console.error('MongoDB connection failed:', err?.message || err);
    return false;
  }
};

module.exports = connectDB;
