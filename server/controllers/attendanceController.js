const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { validationResult } = require('express-validator');
const moment = require('moment');

// @desc    Employee check-in
// @route   POST /api/attendance/checkin
// @access  Private
const checkIn = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { employeeId, location = 'Office' } = req.body;
    const today = moment().startOf('day');

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: {
        $gte: today.toDate(),
        $lt: moment(today).endOf('day').toDate()
      }
    });

    if (existingAttendance && existingAttendance.checkIn.time) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    const checkInTime = new Date();
    const workStartTime = moment(employee.workSchedule.startTime, 'HH:mm');
    const isLate = moment(checkInTime).isAfter(workStartTime);

    let attendance;
    if (existingAttendance) {
      // Update existing record
      existingAttendance.checkIn = {
        time: checkInTime,
        location,
        isLate
      };
      attendance = await existingAttendance.save();
    } else {
      // Create new attendance record
      attendance = new Attendance({
        employeeId,
        date: today.toDate(),
        checkIn: {
          time: checkInTime,
          location,
          isLate
        }
      });
      await attendance.save();
    }

    res.json({
      success: true,
      message: 'Check-in successful',
      data: { attendance }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Employee check-out
// @route   POST /api/attendance/checkout
// @access  Private
const checkOut = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { employeeId, location = 'Office' } = req.body;
    const today = moment().startOf('day');

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      employeeId,
      date: {
        $gte: today.toDate(),
        $lt: moment(today).endOf('day').toDate()
      }
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (attendance.checkOut.time) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    const checkOutTime = new Date();
    attendance.checkOut = {
      time: checkOutTime,
      location
    };

    // Calculate working hours
    const checkInTime = new Date(attendance.checkIn.time);
    const diffMs = checkOutTime - checkInTime;
    attendance.workingHours = diffMs / (1000 * 60 * 60);

    // Calculate overtime (assuming 8 hours is standard)
    const standardHours = 8;
    attendance.overtime = Math.max(0, attendance.workingHours - standardHours);

    // Determine if it's a half day (less than 4 hours)
    attendance.isHalfDay = attendance.workingHours < 4;

    await attendance.save();

    res.json({
      success: true,
      message: 'Check-out successful',
      data: { attendance }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get employee attendance records
// @route   GET /api/attendance/:employeeId
// @access  Private
const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { page = 1, limit = 30, startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find({
      employeeId,
      ...dateFilter
    })
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('employeeId', 'employeeId firstName lastName');

    const total = await Attendance.countDocuments({
      employeeId,
      ...dateFilter
    });

    res.json({
      success: true,
      data: {
        attendance,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get monthly attendance report
// @route   GET /api/attendance/report/:month
// @access  Private
const getMonthlyAttendanceReport = async (req, res) => {
  try {
    const { month } = req.params;
    const { year = new Date().getFullYear() } = req.query;

    const [monthNum, yearNum] = [parseInt(month), parseInt(year)];
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);

    // Get all employees
    const employees = await Employee.find({ status: 'Active' });

    const attendanceData = [];

    for (const employee of employees) {
      const attendance = await Attendance.getMonthlyAttendance(employee._id, yearNum, monthNum);
      const summary = await Attendance.getAttendanceSummary(employee._id, yearNum, monthNum);

      attendanceData.push({
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          name: employee.fullName,
          department: employee.department,
          role: employee.role
        },
        attendance: summary[0] || {
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          halfDays: 0,
          leaveDays: 0,
          totalWorkingHours: 0,
          totalOvertime: 0,
          lateDays: 0
        },
        dailyAttendance: attendance
      });
    }

    res.json({
      success: true,
      data: {
        month: monthNum,
        year: yearNum,
        monthName: moment(startDate).format('MMMM YYYY'),
        totalEmployees: employees.length,
        attendanceData
      }
    });
  } catch (error) {
    console.error('Get monthly attendance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get today's attendance
// @route   GET /api/attendance/today
// @access  Private
const getTodayAttendance = async (req, res) => {
  try {
    const today = moment().startOf('day');

    const attendance = await Attendance.find({
      date: {
        $gte: today.toDate(),
        $lt: moment(today).endOf('day').toDate()
      }
    })
      .populate('employeeId', 'employeeId firstName lastName department')
      .sort({ 'employeeId.firstName': 1 });

    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    const lateCount = attendance.filter(a => a.isLate).length;

    res.json({
      success: true,
      data: {
        date: today.format('YYYY-MM-DD'),
        totalRecords: attendance.length,
        presentCount,
        absentCount,
        lateCount,
        attendance
      }
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, checkIn, checkOut } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    if (status) attendance.status = status;
    if (remarks) attendance.remarks = remarks;
    if (checkIn) attendance.checkIn = { ...attendance.checkIn, ...checkIn };
    if (checkOut) attendance.checkOut = { ...attendance.checkOut, ...checkOut };

    // Recalculate working hours if both check-in and check-out are provided
    if (attendance.checkIn.time && attendance.checkOut.time) {
      const checkInTime = new Date(attendance.checkIn.time);
      const checkOutTime = new Date(attendance.checkOut.time);
      const diffMs = checkOutTime - checkInTime;
      attendance.workingHours = diffMs / (1000 * 60 * 60);
      attendance.overtime = Math.max(0, attendance.workingHours - 8);
      attendance.isHalfDay = attendance.workingHours < 4;
    }

    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: { attendance }
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await Attendance.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getEmployeeAttendance,
  getMonthlyAttendanceReport,
  getTodayAttendance,
  updateAttendance,
  deleteAttendance
}; 