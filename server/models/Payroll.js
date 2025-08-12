const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true,
    min: 0
  },
  allowances: {
    hra: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    ta: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  deductions: {
    pf: { type: Number, default: 0 },
    esi: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    lop: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  bonuses: {
    performance: { type: Number, default: 0 },
    festival: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  attendance: {
    totalDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    workingHours: { type: Number, default: 0 },
    overtime: { type: Number, default: 0 }
  },
  overtimePay: {
    type: Number,
    default: 0
  },
  lopAmount: {
    type: Number,
    default: 0
  },
  grossSalary: {
    type: Number,
    required: true,
    min: 0
  },
  netSalary: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Cancelled'],
    default: 'Pending'
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Cash', 'Check'],
    default: 'Bank Transfer'
  },
  transactionId: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  payslipGenerated: {
    type: Boolean,
    default: false
  },
  payslipPath: {
    type: String
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound index for employee, month, and year
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });
payrollSchema.index({ status: 1 });
payrollSchema.index({ month: 1, year: 1 });

// Virtual for total allowances
payrollSchema.virtual('totalAllowances').get(function() {
  return Object.values(this.allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
});

// Virtual for total deductions
payrollSchema.virtual('totalDeductions').get(function() {
  return Object.values(this.deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
});

// Virtual for total bonuses
payrollSchema.virtual('totalBonuses').get(function() {
  return Object.values(this.bonuses || {}).reduce((sum, val) => sum + (val || 0), 0);
});

// Virtual for month name
payrollSchema.virtual('monthName').get(function() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[this.month - 1];
});

// Pre-save middleware to calculate salary
payrollSchema.pre('save', function(next) {
  // Calculate gross salary
  this.grossSalary = this.basicSalary + this.totalAllowances + this.totalBonuses + this.overtimePay;
  
  // Calculate net salary
  this.netSalary = this.grossSalary - this.totalDeductions;
  
  next();
});

// Static method to get monthly payroll for all employees
payrollSchema.statics.getMonthlyPayroll = function(month, year) {
  return this.find({ month, year })
    .populate('employeeId', 'employeeId firstName lastName email department')
    .sort({ 'employeeId.firstName': 1 });
};

// Static method to get payroll summary
payrollSchema.statics.getPayrollSummary = function(month, year) {
  return this.aggregate([
    {
      $match: { month, year }
    },
    {
      $addFields: {
        totalAllowances: {
          $add: [
            { $ifNull: ['$allowances.hra', 0] },
            { $ifNull: ['$allowances.da', 0] },
            { $ifNull: ['$allowances.ta', 0] },
            { $ifNull: ['$allowances.medical', 0] },
            { $ifNull: ['$allowances.other', 0] }
          ]
        },
        totalDeductions: {
          $add: [
            { $ifNull: ['$deductions.pf', 0] },
            { $ifNull: ['$deductions.esi', 0] },
            { $ifNull: ['$deductions.tax', 0] },
            { $ifNull: ['$deductions.lop', 0] },
            { $ifNull: ['$deductions.other', 0] }
          ]
        },
        totalBonuses: {
          $add: [
            { $ifNull: ['$bonuses.performance', 0] },
            { $ifNull: ['$bonuses.festival', 0] },
            { $ifNull: ['$bonuses.other', 0] }
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        totalEmployees: { $sum: 1 },
        totalGrossSalary: { $sum: '$grossSalary' },
        totalNetSalary: { $sum: '$netSalary' },
        totalAllowances: { $sum: '$totalAllowances' },
        totalDeductions: { $sum: '$totalDeductions' },
        totalBonuses: { $sum: '$totalBonuses' },
        totalOvertimePay: { $sum: '$overtimePay' },
        totalLopAmount: { $sum: '$lopAmount' },
        paidEmployees: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0]
          }
        },
        pendingEmployees: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// Static method to get year-to-date salary
payrollSchema.statics.getYearToDateSalary = function(employeeId, year) {
  return this.aggregate([
    {
      $match: {
        employeeId: mongoose.Types.ObjectId(employeeId),
        year
      }
    },
    {
      $group: {
        _id: null,
        totalGrossSalary: { $sum: '$grossSalary' },
        totalNetSalary: { $sum: '$netSalary' },
        totalAllowances: { $sum: '$totalAllowances' },
        totalDeductions: { $sum: '$totalDeductions' },
        totalBonuses: { $sum: '$totalBonuses' },
        totalOvertimePay: { $sum: '$overtimePay' },
        totalLopAmount: { $sum: '$lopAmount' },
        monthsPaid: { $sum: 1 }
      }
    }
  ]);
};

// Ensure virtual fields are serialized
payrollSchema.set('toJSON', { virtuals: true });
payrollSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payroll', payrollSchema); 