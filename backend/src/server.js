require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const spaceRoutes = require('./routes/spaces');
const bookingRoutes = require('./routes/bookings');

const app = express();

// Security & parsing
app.use(helmet());
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',')
  : ['http://localhost:3000'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some((o) => origin.startsWith(o.trim()))) return cb(null, true);
    cb(new Error('CORS not allowed'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(apiLimiter);

// Swagger docs
try {
  const swaggerDoc = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch (e) {
  console.log('Swagger docs not loaded:', e.message);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running', timestamp: new Date() }));

app.post('/api/seed', async (req, res) => {
  if (req.headers['x-seed-secret'] !== process.env.SEED_SECRET)
    return res.status(403).json({ success: false, message: 'Forbidden' });
  try {
    const User = require('./models/User');
    const Space = require('./models/Space');
    const adminExists = await User.findOne({ email: 'admin@cowork.com' });
    if (adminExists) return res.json({ success: true, message: 'Already seeded' });
    await User.create([
      { name: 'Admin User', email: 'admin@cowork.com', password: 'admin123', role: 'admin' },
      { name: 'John Member', email: 'member@cowork.com', password: 'member123', role: 'member' },
    ]);
    await Space.insertMany([
      { name: 'Hot Desk A1', type: 'desk', capacity: 1, amenities: ['WiFi', 'Power Outlet'], description: 'Open hot desk in main area' },
      { name: 'Hot Desk A2', type: 'desk', capacity: 1, amenities: ['WiFi', 'Power Outlet', 'Monitor'], description: 'Open hot desk with monitor' },
      { name: 'Private Desk B1', type: 'desk', capacity: 1, amenities: ['WiFi', 'Power Outlet', 'Locker'], description: 'Private desk with locker' },
      { name: 'Meeting Room Alpha', type: 'meeting_room', capacity: 6, amenities: ['WiFi', 'Projector', 'Whiteboard', 'TV Screen'], description: 'Small meeting room for 6' },
      { name: 'Meeting Room Beta', type: 'meeting_room', capacity: 12, amenities: ['WiFi', 'Projector', 'Whiteboard', 'Video Conferencing'], description: 'Large meeting room for 12' },
      { name: 'Board Room', type: 'meeting_room', capacity: 20, amenities: ['WiFi', 'Dual Projectors', 'Whiteboard', 'Video Conferencing', 'Catering'], description: 'Executive board room' },
      { name: 'Focus Pod 1', type: 'desk', capacity: 1, amenities: ['WiFi', 'Noise Cancellation', 'Power Outlet'], description: 'Quiet focus pod' },
      { name: 'Collaboration Hub', type: 'meeting_room', capacity: 8, amenities: ['WiFi', 'Whiteboard', 'Standing Desks'], description: 'Open collaboration space' },
    ]);
    res.json({ success: true, message: 'Seeded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error('DB connection failed:', err);
  process.exit(1);
});

module.exports = app;
