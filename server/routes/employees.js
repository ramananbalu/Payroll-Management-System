const express = require('express');
const { body } = require('express-validator');
const { auth, checkPermission } = require('../middleware/auth');
const {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  uploadDocument,
  deleteDocument,
  getEmployeeStats
} = require('../controllers/employeeController');

const router = express.Router();

// Validation middleware
const employeeValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['Manager', 'Developer', 'Designer', 'HR', 'Accountant', 'Admin', 'Other'])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .isIn(['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Other'])
    .withMessage('Invalid department'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Terminated'])
    .withMessage('Invalid status'),
  body('salary.basic')
    .optional()
    .isNumeric()
    .withMessage('Basic salary must be a number')
    .isFloat({ min: 0 })
    .withMessage('Basic salary must be positive'),
  body('bankDetails.accountNumber')
    .optional()
    .trim(),
  body('bankDetails.ifscCode')
    .optional()
    .trim(),
  body('bankDetails.bankName')
    .optional()
    .trim()
];

const updateEmployeeValidation = [
  body('firstName')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .trim(),
  body('lastName')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['Manager', 'Developer', 'Designer', 'HR', 'Accountant', 'Admin', 'Other'])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .isIn(['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Other'])
    .withMessage('Invalid department'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Terminated'])
    .withMessage('Invalid status'),
  body('salary.basic')
    .optional()
    .isNumeric()
    .withMessage('Basic salary must be a number')
    .isFloat({ min: 0 })
    .withMessage('Basic salary must be positive')
];

const documentValidation = [
  body('documentType')
    .isIn(['ID Proof', 'Salary Slip', 'Bank Statement', 'Other'])
    .withMessage('Invalid document type')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.get('/', checkPermission('employees', 'view'), getAllEmployees);
router.get('/stats', checkPermission('employees', 'view'), getEmployeeStats);
router.get('/:id', checkPermission('employees', 'view'), getEmployee);
router.post('/', checkPermission('employees', 'create'), employeeValidation, createEmployee);
router.put('/:id', checkPermission('employees', 'edit'), updateEmployeeValidation, updateEmployee);
router.delete('/:id', checkPermission('employees', 'delete'), deleteEmployee);
router.post('/:id/documents', checkPermission('employees', 'edit'), documentValidation, uploadDocument);
router.delete('/:id/documents/:documentId', checkPermission('employees', 'edit'), deleteDocument);

module.exports = router; 