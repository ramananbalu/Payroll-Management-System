const express = require('express');
const { auth, checkPermission } = require('../middleware/auth');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Expense = require('../models/Expense');
const ExcelJS = require('exceljs');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const mockDataService = require('../mockData');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @desc    Get employee reports
// @route   GET /api/reports/employees
// @access  Private
const getEmployeeReports = async (req, res) => {
  try {
    console.log('=== GET EMPLOYEE REPORTS ===');
    console.log('Query params:', req.query);
    console.log('User:', req.user);

    const { startDate, endDate, department, status } = req.query;

    let filter = {};
    if (department && department !== 'all') filter.department = department;
    if (status && status !== 'all') filter.status = status;
    if (startDate && endDate) {
      filter.joiningDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    console.log('Applied filter:', filter);

    const employees = await Employee.find(filter).select('-documents');

    console.log('Found employees count:', employees.length);
    console.log('Sample employee:', employees[0]);

    // Calculate statistics
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
    const newHires = employees.filter(emp => {
      const joiningDate = new Date(emp.joiningDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return joiningDate >= thirtyDaysAgo;
    }).length;
    const avgSalary = employees.length > 0 ? 
      employees.reduce((sum, emp) => sum + (emp.salary?.basic || 0), 0) / employees.length : 0;

    console.log('Calculated stats:', {
      totalEmployees,
      activeEmployees,
      newHires,
      avgSalary
    });

    // Format employee data for frontend
    const formattedEmployees = employees.map(emp => ({
      _id: emp._id,
      fullName: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      department: emp.department,
      role: emp.role,
      joiningDate: emp.joiningDate,
      status: emp.status,
      totalSalary: emp.salary?.basic || 0
    }));

    console.log('Formatted employees count:', formattedEmployees.length);

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        newHires,
        avgSalary,
        employees: formattedEmployees
      }
    });
  } catch (error) {
    console.error('Get employee reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get payroll reports
// @route   GET /api/reports/payroll
// @access  Private
const getPayrollReports = async (req, res) => {
  try {
    const { startDate, endDate, department, status } = req.query;

    // Build filter for payroll data
    let filter = {};
    if (status && status !== 'all') filter.status = status;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get payroll data from database
    const payrolls = await Payroll.find(filter)
      .populate('employeeId', 'firstName lastName employeeId department')
      .sort({ createdAt: -1 });

    // Apply department filter if specified
    let filteredPayrolls = payrolls;
    if (department && department !== 'all') {
      filteredPayrolls = payrolls.filter(p => p.employeeId?.department === department);
    }

    // Calculate statistics
    const totalPayroll = filteredPayrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const paidAmount = filteredPayrolls.filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const pendingAmount = filteredPayrolls.filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const employeesPaid = filteredPayrolls.filter(p => p.status === 'Paid').length;

    // Format payroll data for frontend
    const formattedPayrolls = filteredPayrolls.map(p => ({
      _id: p._id,
      employee: {
        fullName: p.employeeId ? `${p.employeeId.firstName} ${p.employeeId.lastName}` : 'Unknown Employee'
      },
      month: p.month,
      year: p.year,
      grossSalary: p.grossSalary || 0,
      netSalary: p.netSalary || 0,
      status: p.status,
      paymentDate: p.paymentDate
    }));

    res.json({
      success: true,
      data: {
        totalPayroll,
        paidAmount,
        pendingAmount,
        employeesPaid,
        payrolls: formattedPayrolls
      }
    });
  } catch (error) {
    console.error('Get payroll reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get attendance reports
// @route   GET /api/reports/attendance
// @access  Private
const getAttendanceReports = async (req, res) => {
  try {
    const { startDate, endDate, department, status } = req.query;

    let filter = {};
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (status && status !== 'all') filter.status = status;

    const attendance = await Attendance.find(filter)
      .populate('employeeId', 'firstName lastName department')
      .sort({ date: -1 });

    // Apply department filter if specified
    let filteredAttendance = attendance;
    if (department && department !== 'all') {
      filteredAttendance = attendance.filter(a => a.employeeId?.department === department);
    }

    // Calculate statistics
    const totalDays = filteredAttendance.length;
    const presentDays = filteredAttendance.filter(a => a.status === 'Present').length;
    const absentDays = filteredAttendance.filter(a => a.status === 'Absent').length;
    const halfDays = filteredAttendance.filter(a => a.status === 'Half Day').length;

    // Format attendance data for frontend
    const formattedAttendance = filteredAttendance.map(a => ({
      _id: a._id,
      employee: {
        fullName: a.employeeId ? `${a.employeeId.firstName} ${a.employeeId.lastName}` : 'Unknown Employee'
      },
      date: a.date,
      checkIn: a.checkIn,
      checkOut: a.checkOut,
      workingHours: a.workingHours || 0,
      status: a.status
    }));

    res.json({
      success: true,
      data: {
        totalDays,
        presentDays,
        absentDays,
        halfDays,
        attendance: formattedAttendance
      }
    });
  } catch (error) {
    console.error('Get attendance reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get expense reports
// @route   GET /api/reports/expenses
// @access  Private
const getExpenseReports = async (req, res) => {
  try {
    const { startDate, endDate, category, type, status } = req.query;

    let filter = {};
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (category && category !== 'all') filter.category = category;
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;

    const expenses = await Expense.find(filter).sort({ date: -1 });

    // Calculate statistics
    const totalExpenses = expenses.filter(e => e.type === 'Expense')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = expenses.filter(e => e.type === 'Revenue')
      .reduce((sum, e) => sum + e.amount, 0);
    const expenseCount = expenses.filter(e => e.type === 'Expense').length;
    const revenueCount = expenses.filter(e => e.type === 'Revenue').length;

    // Group expenses by category
    const expenseBreakdown = {};
    expenses.filter(e => e.type === 'Expense').forEach(e => {
      expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + e.amount;
    });

    // Group revenue by category
    const revenueBreakdown = {};
    expenses.filter(e => e.type === 'Revenue').forEach(e => {
      revenueBreakdown[e.category] = (revenueBreakdown[e.category] || 0) + e.amount;
    });

    // Format expense data for frontend
    const formattedExpenses = expenses.map(e => ({
      _id: e._id,
      title: e.title,
      description: e.description,
      amount: e.amount,
      type: e.type,
      category: e.category,
      vendor: e.vendor?.name || '',
      date: e.date,
      paymentMethod: e.paymentMethod,
      status: e.status
    }));

    res.json({
      success: true,
      data: {
        totalExpenses,
        totalRevenue,
        expenseCount,
        revenueCount,
        expenseBreakdown,
        revenueBreakdown,
        expenses: formattedExpenses
      }
    });
  } catch (error) {
    console.error('Get expense reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get financial reports
// @route   GET /api/reports/financial
// @access  Private
const getFinancialReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await Expense.find(dateFilter);

    // Calculate financial statistics
    const totalRevenue = expenses.filter(e => e.type === 'Revenue')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = expenses.filter(e => e.type === 'Expense')
      .reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    // Get payroll expenses from database
    const payrolls = await Payroll.find({});
    const payrollExpenses = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);

    // Group expenses by category
    const expenseBreakdown = {};
    expenses.filter(e => e.type === 'Expense').forEach(e => {
      expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + e.amount;
    });

    // Group revenue by category
    const revenueBreakdown = {};
    expenses.filter(e => e.type === 'Revenue').forEach(e => {
      revenueBreakdown[e.category] = (revenueBreakdown[e.category] || 0) + e.amount;
    });

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netProfit,
        payrollExpenses,
        financialSummary: {
          revenue: revenueBreakdown,
          expenses: expenseBreakdown
        }
      }
    });
  } catch (error) {
    console.error('Get financial reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get dashboard overview
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardOverview = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Employee statistics
    const employeeStats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          totalSalary: { $sum: '$salary.basic' }
        }
      }
    ]);

    // Today's attendance
    const today = moment().startOf('day');
    const todayAttendance = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: today.toDate(),
            $lt: moment(today).endOf('day').toDate()
          }
        }
      },
      {
        $group: {
          _id: null,
          presentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          },
          lateCount: {
            $sum: { $cond: ['$isLate', 1, 0] }
          }
        }
      }
    ]);

    // Current month payroll
    const currentMonthPayroll = await Payroll.aggregate([
      {
        $match: {
          month: currentMonth,
          year: currentYear
        }
      },
      {
        $group: {
          _id: null,
          totalPayroll: { $sum: '$netSalary' },
          paidEmployees: {
            $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] }
          },
          pendingEmployees: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          }
        }
      }
    ]);

    // Current month expenses
    const currentMonthExpenses = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lte: new Date(currentYear, currentMonth, 0)
          }
        }
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent activities
    const recentEmployees = await Employee.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('employeeId firstName lastName department status');

    const recentPayroll = await Payroll.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employeeId', 'employeeId firstName lastName');

    const recentExpenses = await Expense.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title amount type category date');

    res.json({
      success: true,
      data: {
        employeeStats: employeeStats[0] || {
          totalEmployees: 0,
          activeEmployees: 0,
          totalSalary: 0
        },
        todayAttendance: todayAttendance[0] || {
          presentCount: 0,
          absentCount: 0,
          lateCount: 0
        },
        currentMonthPayroll: currentMonthPayroll[0] || {
          totalPayroll: 0,
          paidEmployees: 0,
          pendingEmployees: 0
        },
        currentMonthExpenses: {
          expenses: currentMonthExpenses.find(e => e._id === 'Expense')?.totalAmount || 0,
          revenue: currentMonthExpenses.find(e => e._id === 'Revenue')?.totalAmount || 0
        },
        recentActivities: {
          employees: recentEmployees,
          payroll: recentPayroll,
          expenses: recentExpenses
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export employee data
// @route   GET /api/reports/export/employees
// @access  Private
const exportEmployees = async (req, res) => {
  try {
    console.log('=== EXPORT EMPLOYEES ===');
    console.log('Request query:', req.query);
    console.log('User:', req.user);

    const employees = await Employee.find().select('-documents');
    console.log('Found employees count:', employees.length);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    // Add headers
    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Joining Date', key: 'joiningDate', width: 15 },
      { header: 'Basic Salary', key: 'basicSalary', width: 15 },
      { header: 'Total Salary', key: 'totalSalary', width: 15 }
    ];

    // Add data
    employees.forEach(employee => {
      worksheet.addRow({
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        department: employee.department,
        status: employee.status,
        joiningDate: moment(employee.joiningDate).format('DD/MM/YYYY'),
        basicSalary: employee.salary?.basic || 0,
        totalSalary: employee.totalSalary || 0
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export payroll data
// @route   GET /api/reports/export/payroll
// @access  Private
const exportPayroll = async (req, res) => {
  try {
    console.log('=== EXPORT PAYROLL ===');
    console.log('Request query:', req.query);
    console.log('User:', req.user);

    const { month, year } = req.query;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    console.log('Month:', monthNum, 'Year:', yearNum);

    const payroll = await Payroll.find({
      month: monthNum,
      year: yearNum
    }).populate('employeeId', 'employeeId firstName lastName');
    console.log('Found payroll count:', payroll.length);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll');

    // Add headers
    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Basic Salary', key: 'basicSalary', width: 15 },
      { header: 'Total Allowances', key: 'totalAllowances', width: 15 },
      { header: 'Total Deductions', key: 'totalDeductions', width: 15 },
      { header: 'Overtime Pay', key: 'overtimePay', width: 15 },
      { header: 'LOP Amount', key: 'lopAmount', width: 15 },
      { header: 'Gross Salary', key: 'grossSalary', width: 15 },
      { header: 'Net Salary', key: 'netSalary', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Present Days', key: 'presentDays', width: 15 },
      { header: 'Absent Days', key: 'absentDays', width: 15 }
    ];

    // Add data
    payroll.forEach(pay => {
      worksheet.addRow({
        employeeId: pay.employeeId?.employeeId || 'N/A',
        name: pay.employeeId ? `${pay.employeeId.firstName} ${pay.employeeId.lastName}` : 'N/A',
        basicSalary: pay.basicSalary || 0,
        totalAllowances: pay.totalAllowances || 0,
        totalDeductions: pay.totalDeductions || 0,
        overtimePay: pay.overtimePay || 0,
        lopAmount: pay.lopAmount || 0,
        grossSalary: pay.grossSalary || 0,
        netSalary: pay.netSalary || 0,
        status: pay.status || 'Pending',
        presentDays: pay.attendance?.presentDays || 0,
        absentDays: pay.attendance?.absentDays || 0
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=payroll-${monthNum}-${yearNum}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export expense data
// @route   GET /api/reports/export/expenses
// @access  Private
const exportExpenses = async (req, res) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    let dateFilter = {};
    if (month && year) {
      dateFilter = {
        date: {
          $gte: new Date(yearNum, monthNum - 1, 1),
          $lte: new Date(yearNum, monthNum, 0)
        }
      };
    }

    const expenses = await Expense.find(dateFilter).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expenses');

    // Add headers
    worksheet.columns = [
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Vendor', key: 'vendor', width: 25 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
      { header: 'Status', key: 'status', width: 10 }
    ];

    // Add data
    expenses.forEach(expense => {
      worksheet.addRow({
        title: expense.title || '',
        description: expense.description || '',
        amount: expense.amount || 0,
        type: expense.type || '',
        category: expense.category || '',
        vendor: expense.vendor?.name || '',
        date: moment(expense.date).format('DD/MM/YYYY'),
        paymentMethod: expense.paymentMethod || '',
        status: expense.status || ''
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=expenses-${monthNum}-${yearNum}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export attendance data
// @route   GET /api/reports/export/attendance
// @access  Private
const exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    let filter = {};
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(filter)
      .populate('employeeId', 'employeeId firstName lastName department')
      .sort({ date: -1 });

    // Apply department filter if specified
    let filteredAttendance = attendance;
    if (department && department !== 'all') {
      filteredAttendance = attendance.filter(a => a.employeeId?.department === department);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // Add headers
    worksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Check In', key: 'checkIn', width: 15 },
      { header: 'Check Out', key: 'checkOut', width: 15 },
      { header: 'Working Hours', key: 'workingHours', width: 15 },
      { header: 'Overtime Hours', key: 'overtimeHours', width: 15 },
      { header: 'Is Late', key: 'isLate', width: 10 },
      { header: 'Notes', key: 'notes', width: 30 }
    ];

    // Add data
    filteredAttendance.forEach(att => {
      worksheet.addRow({
        employeeId: att.employeeId?.employeeId || 'N/A',
        name: att.employeeId ? `${att.employeeId.firstName} ${att.employeeId.lastName}` : 'N/A',
        department: att.employeeId?.department || 'N/A',
        date: moment(att.date).format('DD/MM/YYYY'),
        status: att.status,
        checkIn: att.checkIn || 'N/A',
        checkOut: att.checkOut || 'N/A',
        workingHours: att.workingHours || 0,
        overtimeHours: att.overtimeHours || 0,
        isLate: att.isLate ? 'Yes' : 'No',
        notes: att.notes || ''
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export financial data
// @route   GET /api/reports/export/financial
// @access  Private
const exportFinancial = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await Expense.find(dateFilter).sort({ date: -1 });
    const payrolls = await Payroll.find({}).populate('employeeId', 'employeeId firstName lastName');

    const workbook = new ExcelJS.Workbook();
    
    // Expenses worksheet
    const expensesWorksheet = workbook.addWorksheet('Expenses');
    expensesWorksheet.columns = [
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Status', key: 'status', width: 10 }
    ];

    expenses.forEach(expense => {
      expensesWorksheet.addRow({
        title: expense.title,
        description: expense.description || '',
        amount: expense.amount,
        type: expense.type,
        category: expense.category,
        date: moment(expense.date).format('DD/MM/YYYY'),
        status: expense.status
      });
    });

    // Payroll worksheet
    const payrollWorksheet = workbook.addWorksheet('Payroll');
    payrollWorksheet.columns = [
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Month', key: 'month', width: 10 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Basic Salary', key: 'basicSalary', width: 15 },
      { header: 'Net Salary', key: 'netSalary', width: 15 },
      { header: 'Status', key: 'status', width: 10 }
    ];

    payrolls.forEach(pay => {
      payrollWorksheet.addRow({
        employeeId: pay.employeeId?.employeeId || 'N/A',
        name: pay.employeeId ? `${pay.employeeId.firstName} ${pay.employeeId.lastName}` : 'N/A',
        month: pay.month,
        year: pay.year,
        basicSalary: pay.basicSalary || 0,
        netSalary: pay.netSalary || 0,
        status: pay.status
      });
    });

    // Style headers for both worksheets
    [expensesWorksheet, payrollWorksheet].forEach(worksheet => {
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export financial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export employees as PDF
// @route   GET /api/reports/employees/export?format=pdf
// @access  Private
const exportEmployeesPDF = async (req, res) => {
  try {
    const employees = await Employee.find().select('-documents');

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Employee Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Generated on: ${moment().format('DD/MM/YYYY HH:mm')}`, { align: 'center' });
    doc.moveDown(2);

    // Table headers
    const headers = ['ID', 'Name', 'Department', 'Role', 'Status', 'Salary'];
    const colWidths = [60, 120, 80, 80, 60, 80];
    let yPos = doc.y;

    headers.forEach((header, i) => {
      doc.fontSize(10).font('Helvetica-Bold').text(header, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos);
    });

    doc.moveDown();
    yPos = doc.y;

    // Add data rows
    employees.forEach((employee, index) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      const rowData = [
        employee.employeeId,
        `${employee.firstName} ${employee.lastName}`,
        employee.department,
        employee.role,
        employee.status,
        `₹${employee.totalSalary || 0}`
      ];

      rowData.forEach((text, i) => {
        doc.fontSize(9).font('Helvetica').text(text || '', 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos);
      });

      yPos += 20;
      doc.y = yPos;
    });

    doc.end();
  } catch (error) {
    console.error('Export employees PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export payroll as PDF
// @route   GET /api/reports/payroll/export?format=pdf
// @access  Private
const exportPayrollPDF = async (req, res) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const payroll = await Payroll.find({
      month: monthNum,
      year: yearNum
    }).populate('employeeId', 'employeeId firstName lastName');

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payroll-${monthNum}-${yearNum}.pdf`);

    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Payroll Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`${moment().month(monthNum - 1).format('MMMM')} ${yearNum}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${moment().format('DD/MM/YYYY HH:mm')}`, { align: 'center' });
    doc.moveDown(2);

    // Table headers
    const headers = ['ID', 'Name', 'Basic', 'Allowances', 'Deductions', 'Net Salary', 'Status'];
    const colWidths = [60, 100, 60, 70, 70, 80, 60];
    let yPos = doc.y;

    headers.forEach((header, i) => {
      doc.fontSize(9).font('Helvetica-Bold').text(header, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos);
    });

    doc.moveDown();
    yPos = doc.y;

    // Add data rows
    payroll.forEach((pay, index) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      const rowData = [
        pay.employeeId?.employeeId || 'N/A',
        pay.employeeId ? `${pay.employeeId.firstName} ${pay.employeeId.lastName}` : 'N/A',
        `₹${pay.basicSalary || 0}`,
        `₹${pay.totalAllowances || 0}`,
        `₹${pay.totalDeductions || 0}`,
        `₹${pay.netSalary || 0}`,
        pay.status || 'Pending'
      ];

      rowData.forEach((text, i) => {
        doc.fontSize(8).font('Helvetica').text(text, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos);
      });

      yPos += 18;
      doc.y = yPos;
    });

    doc.end();
  } catch (error) {
    console.error('Export payroll PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export attendance as PDF
// @route   GET /api/reports/attendance/export?format=pdf
// @access  Private
const exportAttendancePDF = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    let filter = {};
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(filter)
      .populate('employeeId', 'employeeId firstName lastName department')
      .sort({ date: -1 });

    // Apply department filter if specified
    let filteredAttendance = attendance;
    if (department && department !== 'all') {
      filteredAttendance = attendance.filter(a => a.employeeId?.department === department);
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Attendance Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${moment().format('DD/MM/YYYY HH:mm')}`, { align: 'center' });
    doc.moveDown(2);

    // Table headers
    const headers = ['ID', 'Name', 'Date', 'Status', 'Hours', 'Overtime'];
    const colWidths = [60, 100, 80, 60, 60, 60];
    let yPos = doc.y;

    headers.forEach((header, i) => {
      doc.fontSize(9).font('Helvetica-Bold').text(header, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos);
    });

    doc.moveDown();
    yPos = doc.y;

    // Add data rows
    filteredAttendance.forEach((att, index) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      const rowData = [
        att.employeeId?.employeeId || 'N/A',
        att.employeeId ? `${att.employeeId.firstName} ${att.employeeId.lastName}` : 'N/A',
        moment(att.date).format('DD/MM/YYYY'),
        att.status,
        att.workingHours || 0,
        att.overtimeHours || 0
      ];

      rowData.forEach((text, i) => {
        doc.fontSize(8).font('Helvetica').text(text, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos);
      });

      yPos += 18;
      doc.y = yPos;
    });

    doc.end();
  } catch (error) {
    console.error('Export attendance PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export expenses as PDF
// @route   GET /api/reports/expenses/export?format=pdf
// @access  Private
const exportExpensesPDF = async (req, res) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    let dateFilter = {};
    if (month && year) {
      dateFilter.date = {
        $gte: new Date(yearNum, monthNum - 1, 1),
        $lte: new Date(yearNum, monthNum, 0)
      };
    }

    const expenses = await Expense.find(dateFilter).sort({ date: -1 });

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=expenses-${monthNum}-${yearNum}.pdf`);

    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Expenses Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${moment().format('DD/MM/YYYY HH:mm')}`, { align: 'center' });
    doc.moveDown(2);

    // Table headers
    const headers = ['Title', 'Amount', 'Type', 'Category', 'Date', 'Status'];
    const colWidths = [120, 60, 60, 80, 80, 60];
    let yPos = doc.y;

    headers.forEach((header, i) => {
      doc.fontSize(9).font('Helvetica-Bold').text(header, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos);
    });

    doc.moveDown();
    yPos = doc.y;

    // Add data rows
    expenses.forEach((expense, index) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      const rowData = [
        expense.title || '',
        `₹${expense.amount || 0}`,
        expense.type || '',
        expense.category || '',
        moment(expense.date).format('DD/MM/YYYY'),
        expense.status || ''
      ];

      rowData.forEach((text, i) => {
        doc.fontSize(8).font('Helvetica').text(text, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos);
      });

      yPos += 18;
      doc.y = yPos;
    });

    doc.end();
  } catch (error) {
    console.error('Export expenses PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Export financial as PDF
// @route   GET /api/reports/financial/export?format=pdf
// @access  Private
const exportFinancialPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await Expense.find(dateFilter).sort({ date: -1 });
    const payrolls = await Payroll.find({}).populate('employeeId', 'employeeId firstName lastName');

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${moment().format('DD/MM/YYYY HH:mm')}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    const totalExpenses = expenses.filter(e => e.type === 'Expense').reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = expenses.filter(e => e.type === 'Revenue').reduce((sum, e) => sum + e.amount, 0);
    const totalPayroll = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);

    doc.fontSize(12).font('Helvetica-Bold').text('Summary:', 50);
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Total Expenses: ₹${totalExpenses}`, 70);
    doc.fontSize(10).font('Helvetica').text(`Total Revenue: ₹${totalRevenue}`, 70);
    doc.fontSize(10).font('Helvetica').text(`Total Payroll: ₹${totalPayroll}`, 70);
    doc.fontSize(10).font('Helvetica').text(`Net Profit: ₹${totalRevenue - totalExpenses}`, 70);
    doc.moveDown(2);

    // Expenses table
    doc.fontSize(14).font('Helvetica-Bold').text('Recent Expenses:', 50);
    doc.moveDown();

    const headers = ['Title', 'Amount', 'Type', 'Category', 'Date'];
    const colWidths = [120, 60, 60, 80, 80];
    let yPos = doc.y;

    headers.forEach((header, i) => {
      doc.fontSize(9).font('Helvetica-Bold').text(header, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos);
    });

    doc.moveDown();
    yPos = doc.y;

    // Add data rows (limit to first 20 for PDF)
    expenses.slice(0, 20).forEach((expense, index) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      const rowData = [
        expense.title || '',
        `₹${expense.amount || 0}`,
        expense.type || '',
        expense.category || '',
        moment(expense.date).format('DD/MM/YYYY')
      ];

      rowData.forEach((text, i) => {
        doc.fontSize(8).font('Helvetica').text(text, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), yPos);
      });

      yPos += 18;
      doc.y = yPos;
    });

    doc.end();
  } catch (error) {
    console.error('Export financial PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Routes
router.get('/employees', checkPermission('reports', 'view'), getEmployeeReports);
router.get('/payroll', checkPermission('reports', 'view'), getPayrollReports);
router.get('/attendance', checkPermission('reports', 'view'), getAttendanceReports);
router.get('/expenses', checkPermission('reports', 'view'), getExpenseReports);
router.get('/financial', checkPermission('reports', 'view'), getFinancialReports);
router.get('/dashboard', checkPermission('reports', 'view'), getDashboardOverview);

// Export routes - using the URL patterns the frontend expects
router.get('/employees/export', checkPermission('reports', 'export'), exportEmployees);
router.get('/payroll/export', checkPermission('reports', 'export'), exportPayroll);
router.get('/attendance/export', checkPermission('reports', 'export'), exportAttendance);
router.get('/expenses/export', checkPermission('reports', 'export'), exportExpenses);
router.get('/financial/export', checkPermission('reports', 'export'), exportFinancial);

// PDF Export routes
router.get('/employees/export/pdf', checkPermission('reports', 'export'), exportEmployeesPDF);
router.get('/payroll/export/pdf', checkPermission('reports', 'export'), exportPayrollPDF);
router.get('/attendance/export/pdf', checkPermission('reports', 'export'), exportAttendancePDF);
router.get('/expenses/export/pdf', checkPermission('reports', 'export'), exportExpensesPDF);
router.get('/financial/export/pdf', checkPermission('reports', 'export'), exportFinancialPDF);

// Legacy export routes (keeping for backward compatibility)
router.get('/export/employees', checkPermission('reports', 'export'), exportEmployees);
router.get('/export/payroll', checkPermission('reports', 'export'), exportPayroll);
router.get('/export/expenses', checkPermission('reports', 'export'), exportExpenses);
router.get('/export/attendance', checkPermission('reports', 'export'), exportAttendance);
router.get('/export/financial', checkPermission('reports', 'export'), exportFinancial);

module.exports = router; 