const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  space: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  startTime: { type: String, required: true }, // HH:MM
  endTime: { type: String, required: true },   // HH:MM
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  notes: { type: String, trim: true },
  adminNote: { type: String, trim: true },
  isMaintenance: { type: Boolean, default: false },
}, { timestamps: true });

// Indexes for fast overlap queries and filtering
bookingSchema.index({ space: 1, date: 1, status: 1 });
bookingSchema.index({ member: 1, status: 1 });
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ space: 1, date: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
