const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    time: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      default: 'Office'
    },
    isLate: {
      type: Boolean,
      default: false
    }
  },
  checkOut: {
    time: {
      type: Date
    },
    location: {
      type: String,
      default: 'Office'
    }
  },
  workingHours: {
    type: Number,
    default: 0
  },
  overtime: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday'],
    default: 'Present'
  },
  isHalfDay: {
    type: Boolean,
    default: false
  },
  isLate: {
    type: Boolean,
    default: false
  },
  remarks: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for employee and date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Virtual for check-in time string
attendanceSchema.virtual('checkInTime').get(function() {
  return this.checkIn.time ? this.checkIn.time.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }) : null;
});

// Virtual for check-out time string
attendanceSchema.virtual('checkOutTime').get(function() {
  return this.checkOut.time ? this.checkOut.time.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }) : null;
});

// Virtual for total working hours formatted
attendanceSchema.virtual('formattedWorkingHours').get(function() {
  if (!this.workingHours) return '0h 0m';
  const hours = Math.floor(this.workingHours);
  const minutes = Math.round((this.workingHours - hours) * 60);
  return `${hours}h ${minutes}m`;
});

// Pre-save middleware to calculate working hours
attendanceSchema.pre('save', function(next) {
  if (this.checkIn.time && this.checkOut.time) {
    const checkInTime = new Date(this.checkIn.time);
    const checkOutTime = new Date(this.checkOut.time);
    
    // Calculate working hours in decimal format
    const diffMs = checkOutTime - checkInTime;
    this.workingHours = diffMs / (1000 * 60 * 60); // Convert to hours
    
    // Calculate overtime (assuming 8 hours is standard)
    const standardHours = 8;
    this.overtime = Math.max(0, this.workingHours - standardHours);
    
    // Determine if it's a half day (less than 4 hours)
    this.isHalfDay = this.workingHours < 4;
  }
  
  next();
});

// Static method to get monthly attendance for an employee
attendanceSchema.statics.getMonthlyAttendance = function(employeeId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return this.find({
    employeeId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

// Static method to get attendance summary
attendanceSchema.statics.getAttendanceSummary = function(employeeId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return this.aggregate([
    {
      $match: {
        employeeId: mongoose.Types.ObjectId(employeeId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Present'] }, 1, 0]
          }
        },
        absentDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0]
          }
        },
        halfDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Half Day'] }, 1, 0]
          }
        },
        leaveDays: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Leave'] }, 1, 0]
          }
        },
        totalWorkingHours: { $sum: '$workingHours' },
        totalOvertime: { $sum: '$overtime' },
        lateDays: {
          $sum: {
            $cond: ['$isLate', 1, 0]
          }
        }
      }
    }
  ]);
};

// Ensure virtual fields are serialized
attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Attendance', attendanceSchema); 