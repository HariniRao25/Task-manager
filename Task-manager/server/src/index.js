require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set; using a local development fallback secret.');
}

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0',() => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });
