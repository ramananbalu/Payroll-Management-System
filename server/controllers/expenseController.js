const Expense = require('../models/Expense');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Configure multer for receipt uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed!'));
    }
  }
});

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getAllExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, type, status, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'vendor.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const expenses = await Expense.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(query);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: { expense }
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      amount,
      type,
      category,
      vendor,
      date,
      paymentMethod,
      status,
      tags,
      recurring
    } = req.body;

    const expense = new Expense({
      title,
      description,
      amount,
      type,
      category,
      vendor,
      date: date || new Date(),
      paymentMethod,
      status,
      tags,
      recurring
    });

    await expense.save();

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { expense }
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const {
      title,
      description,
      amount,
      type,
      category,
      vendor,
      date,
      paymentMethod,
      status,
      tags,
      recurring
    } = req.body;

    // Update fields
    if (title) expense.title = title;
    if (description) expense.description = description;
    if (amount) expense.amount = amount;
    if (type) expense.type = type;
    if (category) expense.category = category;
    if (vendor) expense.vendor = { ...expense.vendor, ...vendor };
    if (date) expense.date = date;
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (status) expense.status = status;
    if (tags) expense.tags = tags;
    if (recurring) expense.recurring = { ...expense.recurring, ...recurring };

    await expense.save();

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: { expense }
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload receipt
// @route   POST /api/expenses/:id/receipt
// @access  Private
const uploadReceipt = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    upload.single('receipt')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const receipt = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        uploadDate: new Date()
      };

      expense.receipt = receipt;
      await expense.save();

      res.json({
        success: true,
        message: 'Receipt uploaded successfully',
        data: { receipt }
      });
    });
  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private
const getExpenseStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0);
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
    }

    const stats = await Expense.aggregate([
      {
        $match: dateFilter
      },
      {
        $group: {
          _id: null,
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Expense'] }, '$amount', 0]
            }
          },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Revenue'] }, '$amount', 0]
            }
          },
          totalTransactions: { $sum: 1 },
          expenseCount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Expense'] }, 1, 0]
            }
          },
          revenueCount: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Revenue'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const categoryStats = await Expense.aggregate([
      {
        $match: {
          ...dateFilter,
          type: 'Expense'
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    const monthlyStats = await Expense.aggregate([
      {
        $match: dateFilter
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalExpenses: 0,
          totalRevenue: 0,
          totalTransactions: 0,
          expenseCount: 0,
          revenueCount: 0
        },
        byCategory: categoryStats,
        byMonth: monthlyStats
      }
    });
  } catch (error) {
    console.error('Get expense stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get profit/loss statement
// @route   GET /api/expenses/profit-loss
// @access  Private
const getProfitLossStatement = async (req, res) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);

    const statement = await Expense.getProfitLossStatement(monthNum, yearNum);

    const expenses = statement.find(s => s._id === 'Expense')?.totalAmount || 0;
    const revenue = statement.find(s => s._id === 'Revenue')?.totalAmount || 0;
    const netProfit = revenue - expenses;

    res.json({
      success: true,
      data: {
        month: monthNum,
        year: yearNum,
        monthName: new Date(yearNum, monthNum - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        revenue,
        expenses,
        netProfit,
        profitMargin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get profit/loss statement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt,
  getExpenseStats,
  getProfitLossStatement
}; 