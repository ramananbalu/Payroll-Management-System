const express = require('express');
const { body } = require('express-validator');
const { auth, checkPermission } = require('../middleware/auth');
const {
  generatePayroll,
  getMonthlyPayroll,
  getEmployeePayroll,
  updatePayrollStatus,
  generatePayslip,
  sendPayslipEmail,
  getAllPayrolls,
  getPayrollStats
} = require('../controllers/payrollController');

const router = express.Router();

// Validation middleware
const generatePayrollValidation = [
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030')
];

const updatePayrollStatusValidation = [
  body('status')
    .isIn(['Pending', 'Paid', 'Cancelled'])
    .withMessage('Invalid status'),
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid payment date format'),
  body('paymentMethod')
    .optional()
    .isIn(['Bank Transfer', 'Cash', 'Check'])
    .withMessage('Invalid payment method'),
  body('transactionId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Transaction ID must be less than 100 characters'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must be less than 500 characters')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.get('/', checkPermission('payroll', 'view'), getAllPayrolls);
router.get('/stats', checkPermission('payroll', 'view'), getPayrollStats);
router.post('/generate', checkPermission('payroll', 'create'), generatePayrollValidation, generatePayroll);
router.get('/monthly/:month', checkPermission('payroll', 'view'), getMonthlyPayroll);
router.get('/employee/:employeeId', checkPermission('payroll', 'view'), getEmployeePayroll);
router.put('/status/:id', checkPermission('payroll', 'edit'), updatePayrollStatusValidation, updatePayrollStatus);
router.get('/payslip/:id', checkPermission('payroll', 'view'), generatePayslip);
router.post('/send-payslip/:id', checkPermission('payroll', 'edit'), sendPayslipEmail);

module.exports = router; 