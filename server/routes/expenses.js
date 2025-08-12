const express = require('express');
const { body } = require('express-validator');
const { auth, checkPermission } = require('../middleware/auth');
const {
  getAllExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt,
  getExpenseStats,
  getProfitLossStatement
} = require('../controllers/expenseController');

const router = express.Router();

// Validation middleware
const expenseValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .isIn(['Expense', 'Revenue'])
    .withMessage('Type must be either Expense or Revenue'),
  body('category')
    .isIn([
      'Office Supplies', 'Utilities', 'Rent', 'Salaries', 'Marketing',
      'Travel', 'Equipment', 'Software', 'Insurance', 'Legal',
      'Taxes', 'Maintenance', 'Food & Beverages', 'Transportation',
      'Training', 'Other'
    ])
    .withMessage('Invalid category'),
  body('vendor.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Vendor name must be less than 100 characters'),
  body('vendor.contact')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Vendor contact must be less than 50 characters'),
  body('vendor.email')
    .optional()
    .isEmail()
    .withMessage('Invalid vendor email'),
  body('paymentMethod')
    .optional()
    .isIn(['Cash', 'Bank Transfer', 'Credit Card', 'Check', 'Online Payment'])
    .withMessage('Invalid payment method'),
  body('status')
    .optional()
    .isIn(['Pending', 'Paid', 'Cancelled'])
    .withMessage('Invalid status'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag must be less than 50 characters')
];

const updateExpenseValidation = [
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .optional()
    .isIn(['Expense', 'Revenue'])
    .withMessage('Type must be either Expense or Revenue'),
  body('category')
    .optional()
    .isIn([
      'Office Supplies', 'Utilities', 'Rent', 'Salaries', 'Marketing',
      'Travel', 'Equipment', 'Software', 'Insurance', 'Legal',
      'Taxes', 'Maintenance', 'Food & Beverages', 'Transportation',
      'Training', 'Other'
    ])
    .withMessage('Invalid category'),
  body('vendor.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Vendor name must be less than 100 characters'),
  body('vendor.contact')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Vendor contact must be less than 50 characters'),
  body('vendor.email')
    .optional()
    .isEmail()
    .withMessage('Invalid vendor email'),
  body('paymentMethod')
    .optional()
    .isIn(['Cash', 'Bank Transfer', 'Credit Card', 'Check', 'Online Payment'])
    .withMessage('Invalid payment method'),
  body('status')
    .optional()
    .isIn(['Pending', 'Paid', 'Cancelled'])
    .withMessage('Invalid status'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag must be less than 50 characters')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.get('/', checkPermission('expenses', 'view'), getAllExpenses);
router.get('/stats', checkPermission('expenses', 'view'), getExpenseStats);
router.get('/profit-loss', checkPermission('expenses', 'view'), getProfitLossStatement);
router.get('/:id', checkPermission('expenses', 'view'), getExpense);
router.post('/', checkPermission('expenses', 'create'), expenseValidation, createExpense);
router.put('/:id', checkPermission('expenses', 'edit'), updateExpenseValidation, updateExpense);
router.delete('/:id', checkPermission('expenses', 'delete'), deleteExpense);
router.post('/:id/receipt', checkPermission('expenses', 'edit'), uploadReceipt);

module.exports = router; 