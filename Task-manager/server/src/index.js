require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set; using a local development fallback secret.');
}

(async () => {
  const dbConnected = await connectDB();
  const isProduction = process.env.NODE_ENV === 'production';

  if (!dbConnected && isProduction) {
    console.error('MongoDB is required in production. Exiting process.');
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    if (!dbConnected) {
      console.warn('Server started without MongoDB connection (API requests may fail).');
    }
  });
})();
