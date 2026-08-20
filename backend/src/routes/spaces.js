const router = require('express').Router();
const {
  getSpaces, getSpaceById, getSpaceAvailability,
  createSpace, updateSpace, deleteSpace,
} = require('../controllers/spaceController');
const { authenticate, authorize } = require('../middleware/auth');
const { spaceRules, mongoIdParam, validate } = require('../middleware/validators');

// Public routes
router.get('/', getSpaces);
router.get('/:id', mongoIdParam('id'), validate, getSpaceById);
router.get('/:id/availability', mongoIdParam('id'), validate, getSpaceAvailability);

// Admin routes
router.post('/', authenticate, authorize('admin'), spaceRules, validate, createSpace);
router.put('/:id', authenticate, authorize('admin'), mongoIdParam('id'), spaceRules, validate, updateSpace);
router.delete('/:id', authenticate, authorize('admin'), mongoIdParam('id'), validate, deleteSpace);

module.exports = router;
