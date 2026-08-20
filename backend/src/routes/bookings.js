const router = require('express').Router();
const {
  createBooking, getMyBookings, getBookingById, cancelBooking,
  getAllBookings, approveBooking, rejectBooking, createMaintenance,
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');
const { bookingRules, maintenanceRules, mongoIdParam, validate } = require('../middleware/validators');

// Member routes
router.post('/', authenticate, authorize('member', 'admin'), bookingRules, validate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.patch('/:id/cancel', authenticate, mongoIdParam('id'), validate, cancelBooking);
router.get('/:id', authenticate, mongoIdParam('id'), validate, getBookingById);

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllBookings);
router.patch('/:id/approve', authenticate, authorize('admin'), mongoIdParam('id'), validate, approveBooking);
router.patch('/:id/reject', authenticate, authorize('admin'), mongoIdParam('id'), validate, rejectBooking);
router.post('/maintenance', authenticate, authorize('admin'), maintenanceRules, validate, createMaintenance);

module.exports = router;
