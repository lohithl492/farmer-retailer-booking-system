const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

/* ==================== ENSURE UPLOAD FOLDER EXISTS ==================== */

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('📁 Uploads folder created');
}

/* ==================== MIDDLEWARE ==================== */

app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve uploaded images
app.use('/uploads', express.static(uploadDir));

console.log('📦 Express configured');


/* ==================== DATABASE CONNECTION ==================== */

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/farmer-retailer-db';

console.log('🔗 Connecting to MongoDB...');
console.log('   URI:', MONGODB_URI);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed!');
    console.error('   Error:', err.message);
    process.exit(1);
  });


/* ==================== CONNECTION EVENTS ==================== */

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB Disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Error:', err.message);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB Reconnected');
});

console.log('📡 Database event listeners configured');


/* ==================== ROUTES ==================== */

console.log('🛣️ Loading routes...');

try {

  app.use('/api/auth', require('./routes/auth'));
  console.log('✓ Auth routes loaded');

  app.use('/api/farmer', require('./routes/farmer'));
  console.log('✓ Farmer routes loaded');

  app.use('/api/retailer', require('./routes/retailer'));
  console.log('✓ Retailer routes loaded');

  app.use('/api/admin', require('./routes/admin'));
  console.log('✓ Admin routes loaded');

} catch (error) {

  console.error('❌ Error loading routes:', error.message);
  process.exit(1);

}


/* ==================== FRONTEND SERVING ==================== */

console.log('📁 Configuring frontend...');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


/* ==================== HEALTH CHECK ==================== */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date(),
  });
});

console.log('✓ Frontend configured');


/* ==================== ERROR HANDLING ==================== */

app.use((err, req, res, next) => {

  console.error('❌ Request Error:', err);

  res.status(500).json({
    success: false,
    message: err.message,
  });

});

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: 'Route not found: ' + req.path,
  });

});

console.log('🛡️ Error handlers configured');


/* ==================== START SERVER ==================== */

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║                                                    ║');
  console.log('║      🚀 Farmer-Retailer Booking System 🚀         ║');
  console.log('║                                                    ║');
  console.log('║  Server running on port:', PORT);
  console.log('║  API path: /api');
  console.log('║  Health: /api/health');
  console.log('║                                                    ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('\n');

});


/* ==================== GRACEFUL SHUTDOWN ==================== */

process.on('SIGINT', () => {

  console.log('\n⏹️ Shutting down gracefully...');

  server.close(async () => {

    console.log('✅ Server closed');

    try {
      await mongoose.connection.close(false);
      console.log('✅ MongoDB connection closed');
    } catch (err) {
      console.error('MongoDB close error:', err);
    }

    process.exit(0);

  });

});


/* ==================== UNHANDLED PROMISE ==================== */

process.on('unhandledRejection', (reason, promise) => {

  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);

});


/* ==================== CONNECTION TIMEOUT CHECK ==================== */

setTimeout(() => {

  if (mongoose.connection.readyState !== 1) {

    console.error('❌ MongoDB connection timeout!');
    process.exit(1);

  }

}, 10000);