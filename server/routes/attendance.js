const express = require('express');
const { body } = require('express-validator');
const { auth, checkPermission } = require('../middleware/auth');
const {
  checkIn,
  checkOut,
  getEmployeeAttendance,
  getMonthlyAttendanceReport,
  getTodayAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');

const router = express.Router();

// Validation middleware
const checkInValidation = [
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isMongoId()
    .withMessage('Invalid employee ID'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters')
];

const checkOutValidation = [
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isMongoId()
    .withMessage('Invalid employee ID'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters')
];

const updateAttendanceValidation = [
  body('status')
    .optional()
    .isIn(['Present', 'Absent', 'Half Day', 'Leave', 'Holiday'])
    .withMessage('Invalid status'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must be less than 500 characters'),
  body('checkIn.time')
    .optional()
    .isISO8601()
    .withMessage('Invalid check-in time format'),
  body('checkOut.time')
    .optional()
    .isISO8601()
    .withMessage('Invalid check-out time format')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.post('/checkin', checkPermission('attendance', 'create'), checkInValidation, checkIn);
router.post('/checkout', checkPermission('attendance', 'create'), checkOutValidation, checkOut);
router.get('/today', checkPermission('attendance', 'view'), getTodayAttendance);
router.get('/report/:month', checkPermission('attendance', 'view'), getMonthlyAttendanceReport);
router.get('/:employeeId', checkPermission('attendance', 'view'), getEmployeeAttendance);
router.put('/:id', checkPermission('attendance', 'edit'), updateAttendanceValidation, updateAttendance);
router.delete('/:id', checkPermission('attendance', 'delete'), deleteAttendance);

module.exports = router; 