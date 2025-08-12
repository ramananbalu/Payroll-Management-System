const express = require('express');
const { auth, checkPermission } = require('../middleware/auth');
const Settings = require('../models/Settings');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    // Get or create default settings from database
    const settings = await Settings.getOrCreateDefault();

    // Merge with environment variables for email settings
    const emailSettings = {
      smtpHost: process.env.SMTP_HOST || settings.email.smtpHost,
      smtpPort: process.env.SMTP_PORT || settings.email.smtpPort,
      smtpUser: process.env.EMAIL_USER || settings.email.smtpUser,
      smtpPass: process.env.EMAIL_PASS || settings.email.smtpPass,
      fromEmail: process.env.EMAIL_USER || settings.email.fromEmail,
      fromName: settings.email.fromName
    };

    const responseSettings = {
      company: settings.company,
      payroll: settings.payroll,
      attendance: settings.attendance,
      email: emailSettings,
      notifications: settings.notifications,
      customization: settings.customization
    };

    res.json({
      success: true,
      data: { settings: responseSettings }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    console.log('=== UPDATE SETTINGS ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);

    const { settings } = req.body;

    // Validate settings structure
    if (!settings || typeof settings !== 'object') {
      console.log('Invalid settings format');
      return res.status(400).json({
        success: false,
        message: 'Invalid settings format'
      });
    }

    // Get or create settings document
    let settingsDoc = await Settings.getOrCreateDefault();
    console.log('Current settings doc:', settingsDoc);

    // Update the settings document
    settingsDoc.set(settings);
    console.log('Updated settings doc:', settingsDoc);

    await settingsDoc.save();
    console.log('Settings saved successfully');

    // Return updated settings
    const updatedSettings = await Settings.getOrCreateDefault();
    console.log('Retrieved updated settings:', updatedSettings);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings: updatedSettings }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get payroll configuration
// @route   GET /api/settings/payroll-config
// @access  Private
const getPayrollConfig = async (req, res) => {
  try {
    const config = {
      allowances: [
        { name: 'HRA', description: 'House Rent Allowance' },
        { name: 'DA', description: 'Dearness Allowance' },
        { name: 'TA', description: 'Transport Allowance' },
        { name: 'Medical', description: 'Medical Allowance' },
        { name: 'Other', description: 'Other Allowances' }
      ],
      deductions: [
        { name: 'PF', description: 'Provident Fund' },
        { name: 'ESI', description: 'Employee State Insurance' },
        { name: 'Tax', description: 'Income Tax' },
        { name: 'LOP', description: 'Loss of Pay' },
        { name: 'Other', description: 'Other Deductions' }
      ],
      bonuses: [
        { name: 'Performance', description: 'Performance Bonus' },
        { name: 'Festival', description: 'Festival Bonus' },
        { name: 'Other', description: 'Other Bonuses' }
      ]
    };

    res.json({
      success: true,
      data: { config }
    });
  } catch (error) {
    console.error('Get payroll config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get expense categories
// @route   GET /api/settings/expense-categories
// @access  Private
const getExpenseCategories = async (req, res) => {
  try {
    const categories = [
      'Office Supplies',
      'Utilities',
      'Rent',
      'Salaries',
      'Marketing',
      'Travel',
      'Equipment',
      'Software',
      'Insurance',
      'Legal',
      'Taxes',
      'Maintenance',
      'Food & Beverages',
      'Transportation',
      'Training',
      'Other'
    ];

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get expense categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get employee roles and departments
// @route   GET /api/settings/employee-config
// @access  Private
const getEmployeeConfig = async (req, res) => {
  try {
    const config = {
      roles: [
        'Manager',
        'Developer',
        'Designer',
        'HR',
        'Accountant',
        'Admin',
        'Other'
      ],
      departments: [
        'IT',
        'HR',
        'Finance',
        'Marketing',
        'Sales',
        'Operations',
        'Other'
      ],
      statuses: [
        'Active',
        'Inactive',
        'Terminated'
      ]
    };

    res.json({
      success: true,
      data: { config }
    });
  } catch (error) {
    console.error('Get employee config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Routes
router.get('/', checkPermission('settings', 'view'), getSettings);
router.put('/', checkPermission('settings', 'edit'), updateSettings);
router.get('/payroll-config', checkPermission('settings', 'view'), getPayrollConfig);
router.get('/expense-categories', checkPermission('settings', 'view'), getExpenseCategories);
router.get('/employee-config', checkPermission('settings', 'view'), getEmployeeConfig);

module.exports = router; 