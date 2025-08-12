const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'EMP' + Date.now().toString().slice(-6);
    }
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['Manager', 'Developer', 'Designer', 'HR', 'Accountant', 'Admin', 'Other']
  },
  department: {
    type: String,
    enum: ['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Other']
  },
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Terminated'],
    default: 'Active'
  },
  salary: {
    basic: {
      type: Number,
      default: 0,
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
      other: { type: Number, default: 0 }
    }
  },
  bankDetails: {
    accountNumber: {
      type: String,
      trim: true
    },
    ifscCode: {
      type: String,
      trim: true
    },
    bankName: {
      type: String,
      trim: true
    },
    branch: {
      type: String,
      trim: true
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['ID Proof', 'Salary Slip', 'Bank Statement', 'Other']
    },
    filename: String,
    originalName: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  workSchedule: {
    workingHours: {
      type: Number,
      default: 8
    },
    startTime: {
      type: String,
      default: '09:00'
    },
    endTime: {
      type: String,
      default: '18:00'
    }
  },
  customFields: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for better query performance
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for total salary
employeeSchema.virtual('totalSalary').get(function() {
  const basic = this.salary.basic || 0;
  const allowances = Object.values(this.salary.allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
  const deductions = Object.values(this.salary.deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
  return basic + allowances - deductions;
});

// Ensure virtual fields are serialized
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema); 