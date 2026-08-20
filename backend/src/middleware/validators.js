const { body, query, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const spaceRules = [
  body('name').trim().notEmpty().withMessage('Space name is required'),
  body('type').isIn(['desk', 'meeting_room']).withMessage('Type must be desk or meeting_room'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('pricePerHour').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
];

const bookingRules = [
  body('spaceId').isMongoId().withMessage('Valid space ID required'),
  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be YYYY-MM-DD')
    .custom((val) => {
      const today = new Date().toISOString().split('T')[0];
      if (val < today) throw new Error('Cannot book a past date');
      return true;
    }),
  body('startTime').matches(/^\d{2}:\d{2}$/).withMessage('startTime must be HH:MM'),
  body('endTime')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('endTime must be HH:MM')
    .custom((val, { req }) => {
      if (val <= req.body.startTime) throw new Error('endTime must be after startTime');
      return true;
    }),
];

const maintenanceRules = [
  body('spaceId').isMongoId().withMessage('Valid space ID required'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD'),
  body('startTime').matches(/^\d{2}:\d{2}$/).withMessage('startTime must be HH:MM'),
  body('endTime')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('endTime must be HH:MM')
    .custom((val, { req }) => {
      if (val <= req.body.startTime) throw new Error('endTime must be after startTime');
      return true;
    }),
];

const mongoIdParam = (paramName) => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  spaceRules,
  bookingRules,
  maintenanceRules,
  mongoIdParam,
};
