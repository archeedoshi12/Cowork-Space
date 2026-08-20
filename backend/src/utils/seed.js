require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Space = require('../models/Space');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const adminExists = await User.findOne({ email: 'admin@cowork.com' });
  if (adminExists) {
    console.log('Seed already applied, skipping.');
    await mongoose.disconnect();
    return;
  }
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@cowork.com',
    password: 'admin123',
    role: 'admin',
  });

  const member = await User.create({
    name: 'John Member',
    email: 'member@cowork.com',
    password: 'member123',
    role: 'member',
  });

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

  console.log('Seed complete!');
  console.log('Admin: admin@cowork.com / admin123');
  console.log('Member: member@cowork.com / member123');
  await mongoose.disconnect();
};

seed().catch((err) => { console.error(err); process.exit(1); });
