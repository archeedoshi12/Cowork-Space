const Booking = require('../models/Booking');
const Space = require('../models/Space');
const { bookingStatusEmail } = require('../utils/email');

const overlapFilter = (spaceId, date, startTime, endTime, excludeId = null) => {
  const f = {
    space: spaceId,
    date,
    status: { $in: ['pending', 'approved'] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
  if (excludeId) f._id = { $ne: excludeId };
  return f;
};

const createBooking = async (req, res, next) => {
  try {
    const { spaceId, date, startTime, endTime, notes } = req.body;

    const space = await Space.findById(spaceId);
    if (!space || !space.isActive)
      return res.status(404).json({ success: false, message: 'Space not found' });

    const overlap = await Booking.findOne(overlapFilter(spaceId, date, startTime, endTime));
    if (overlap)
      return res.status(409).json({ success: false, message: 'This time slot overlaps with an existing booking' });

    const booking = await Booking.create({ space: spaceId, member: req.user._id, date, startTime, endTime, notes });
    const populated = await booking.populate([
      { path: 'space', select: 'name type capacity' },
      { path: 'member', select: 'name email' },
    ]);

    bookingStatusEmail(req.user.email, req.user.name, 'pending', space.name, date, startTime, endTime);
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { member: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('space', 'name type capacity')
        .sort({ date: -1, startTime: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, member: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!['pending', 'approved'].includes(booking.status))
      return res.status(400).json({ success: false, message: 'Only pending or approved bookings can be cancelled' });

    const today = new Date().toISOString().split('T')[0];
    if (booking.date < today)
      return res.status(400).json({ success: false, message: 'Cannot cancel past bookings' });

    booking.status = 'cancelled';
    await booking.save();

    const space = await Space.findById(booking.space);
    bookingStatusEmail(req.user.email, req.user.name, 'cancelled', space?.name, booking.date, booking.startTime, booking.endTime);
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('space', 'name type capacity')
      .populate('member', 'name email');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (req.user.role !== 'admin' && booking.member._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const { status, date, spaceId, isMaintenance, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) filter.date = date;
    if (spaceId) filter.space = spaceId;
    if (isMaintenance !== undefined) filter.isMaintenance = isMaintenance === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('space', 'name type')
        .populate('member', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

const approveBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('member', 'name email')
      .populate('space', 'name');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Only pending bookings can be approved' });

    booking.status = 'approved';
    booking.adminNote = req.body.adminNote || '';
    await booking.save();

    // Auto-reject all overlapping pending bookings
    const overlapping = await Booking.find({
      _id: { $ne: booking._id },
      space: booking.space._id,
      date: booking.date,
      status: 'pending',
      startTime: { $lt: booking.endTime },
      endTime: { $gt: booking.startTime },
    }).populate('member', 'name email');

    for (const ob of overlapping) {
      ob.status = 'rejected';
      ob.adminNote = 'Auto-rejected due to overlapping approved booking';
      await ob.save();
      bookingStatusEmail(ob.member.email, ob.member.name, 'rejected', booking.space.name, ob.date, ob.startTime, ob.endTime);
    }

    bookingStatusEmail(booking.member.email, booking.member.name, 'approved', booking.space.name, booking.date, booking.startTime, booking.endTime);
    res.json({ success: true, data: booking, autoRejected: overlapping.length });
  } catch (err) {
    next(err);
  }
};

const rejectBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('member', 'name email')
      .populate('space', 'name');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Only pending bookings can be rejected' });

    booking.status = 'rejected';
    booking.adminNote = req.body.adminNote || '';
    await booking.save();

    bookingStatusEmail(booking.member.email, booking.member.name, 'rejected', booking.space.name, booking.date, booking.startTime, booking.endTime);
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

const createMaintenance = async (req, res, next) => {
  try {
    const { spaceId, date, startTime, endTime, notes } = req.body;

    const space = await Space.findById(spaceId);
    if (!space) return res.status(404).json({ success: false, message: 'Space not found' });

    // Auto-reject any pending/approved bookings in this window
    const conflicting = await Booking.find({
      space: spaceId,
      date,
      status: { $in: ['pending', 'approved'] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      isMaintenance: false,
    }).populate('member', 'name email');

    for (const cb of conflicting) {
      cb.status = 'rejected';
      cb.adminNote = 'Rejected due to maintenance window';
      await cb.save();
      bookingStatusEmail(cb.member.email, cb.member.name, 'rejected', space.name, cb.date, cb.startTime, cb.endTime);
    }

    const maintenance = await Booking.create({
      space: spaceId, member: req.user._id, date, startTime, endTime, notes,
      isMaintenance: true, status: 'approved',
    });

    res.status(201).json({ success: true, data: maintenance, conflictsResolved: conflicting.length });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  approveBooking,
  rejectBooking,
  createMaintenance,
};
