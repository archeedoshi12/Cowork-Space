const Space = require('../models/Space');
const Booking = require('../models/Booking');

const getSpaces = async (req, res, next) => {
  try {
    const { search, type, capacity, date, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };

    if (type) filter.type = type;
    if (capacity) filter.capacity = { $gte: parseInt(capacity) };
    if (search) filter.$text = { $search: search };

    // If date provided, exclude spaces with full-day maintenance blocks
    let bookedSpaceIds = [];
    if (date) {
      const maintenanceBookings = await Booking.find({
        date,
        status: { $in: ['pending', 'approved'] },
        isMaintenance: true,
      }).distinct('space');
      bookedSpaceIds = maintenanceBookings;
    }

    if (bookedSpaceIds.length > 0) {
      filter._id = { $nin: bookedSpaceIds };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [spaces, total] = await Promise.all([
      Space.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Space.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: spaces,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

const getSpaceById = async (req, res, next) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space || !space.isActive) return res.status(404).json({ success: false, message: 'Space not found' });
    res.json({ success: true, data: space });
  } catch (err) {
    next(err);
  }
};

const getSpaceAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const bookings = await Booking.find({
      space: req.params.id,
      date,
      status: { $in: ['pending', 'approved'] },
    }).select('startTime endTime status isMaintenance member').populate('member', 'name');

    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

const createSpace = async (req, res, next) => {
  try {
    const space = await Space.create(req.body);
    res.status(201).json({ success: true, data: space });
  } catch (err) {
    next(err);
  }
};

const updateSpace = async (req, res, next) => {
  try {
    const space = await Space.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!space) return res.status(404).json({ success: false, message: 'Space not found' });
    res.json({ success: true, data: space });
  } catch (err) {
    next(err);
  }
};

const deleteSpace = async (req, res, next) => {
  try {
    const space = await Space.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!space) return res.status(404).json({ success: false, message: 'Space not found' });
    res.json({ success: true, message: 'Space deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSpaces, getSpaceById, getSpaceAvailability, createSpace, updateSpace, deleteSpace };
