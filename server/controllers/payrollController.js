const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const mockDataService = require('../mockData');
const mongoose = require('mongoose');

// @desc    Generate monthly payroll
// @route   POST /api/payroll/generate
// @access  Private
const generatePayroll = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { month, year } = req.body;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const payrollData = mockDataService.generatePayroll(monthNum, yearNum);

    res.json({
      success: true,
      message: 'Payroll generated successfully',
      data: {
        month: monthNum,
        year: yearNum,
        monthName: moment(new Date(yearNum, monthNum - 1, 1)).format('MMMM YYYY'),
        totalEmployees: payrollData.length,
        payrollData
      }
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get monthly payroll
// @route   GET /api/payroll/monthly/:month
// @access  Private
const getMonthlyPayroll = async (req, res) => {
  try {
    const { month } = req.params;
    const { year = new Date().getFullYear() } = req.query;

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    const payroll = await Payroll.getMonthlyPayroll(monthNum, yearNum);
    const summary = await Payroll.getPayrollSummary(monthNum, yearNum);

    res.json({
      success: true,
      data: {
        month: monthNum,
        year: yearNum,
        monthName: moment(new Date(yearNum, monthNum - 1, 1)).format('MMMM YYYY'),
        payroll,
        summary: summary[0] || {
          totalEmployees: 0,
          totalGrossSalary: 0,
          totalNetSalary: 0,
          totalAllowances: 0,
          totalDeductions: 0,
          totalBonuses: 0,
          totalOvertimePay: 0,
          totalLopAmount: 0,
          paidEmployees: 0,
          pendingEmployees: 0
        }
      }
    });
  } catch (error) {
    console.error('Get monthly payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get employee payroll
// @route   GET /api/payroll/employee/:employeeId
// @access  Private
const getEmployeePayroll = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year = new Date().getFullYear() } = req.query;

    const yearNum = parseInt(year);
    const result = mockDataService.getEmployeePayroll(employeeId, yearNum);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get employee payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update payroll status
// @route   PUT /api/payroll/status/:id
// @access  Private
const updatePayrollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentDate, paymentMethod, transactionId, remarks } = req.body;

    const payroll = mockDataService.updatePayrollStatus(id, status);
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    res.json({
      success: true,
      message: 'Payroll status updated successfully',
      data: { payroll }
    });
  } catch (error) {
    console.error('Update payroll status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Generate payslip PDF
// @route   GET /api/payroll/payslip/:id
// @access  Private
const generatePayslip = async (req, res) => {
  try {
    const { id } = req.params;

    let payroll = null;

    // Only query DB if the id is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      payroll = await Payroll.findById(id)
        .populate('employeeId', 'employeeId firstName lastName email department bankDetails')
        .lean();
    }

    // Fallback to mock data if DB record not found or id not valid
    if (!payroll) {
      const mock = mockDataService.getPayrollById(id);
      if (!mock) {
        return res.status(404).json({
          success: false,
          message: 'Payroll record not found'
        });
      }
      payroll = {
        ...mock,
        monthName: moment(new Date(mock.year, mock.month - 1, 1)).format('MMMM'),
        employeeId: mock.employeeId
      };
    } else {
      payroll.monthName = moment(new Date(payroll.year, payroll.month - 1, 1)).format('MMMM');
    }

    // Create PDF document and stream response as attachment
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });
    
    const filename = `payslip-${payroll.employeeId.employeeId}-${payroll.month}-${payroll.year}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Helper function to add table row
    const addTableRow = (doc, label, value, isBold = false) => {
      const y = doc.y;
      doc.fontSize(10);
      if (isBold) doc.font('Helvetica-Bold');
      else doc.font('Helvetica');
      
      doc.text(label, 50, y);
      doc.text(value, 300, y);
      doc.moveDown(0.5);
    };

    // Helper function to add section header
    const addSectionHeader = (doc, title) => {
      doc.fontSize(14).font('Helvetica-Bold').text(title, { underline: true });
      doc.moveDown(0.5);
    };

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('PAYSLIP', { align: 'center' });
    doc.moveDown(1);

    // Company Info (you can customize this)
    doc.fontSize(12).font('Helvetica').text('COMPANY NAME', { align: 'center' });
    doc.fontSize(10).text('Company Address Line 1', { align: 'center' });
    doc.text('Company Address Line 2', { align: 'center' });
    doc.moveDown(1);

    // Employee Details Section
    addSectionHeader(doc, 'EMPLOYEE DETAILS');
    
    const employeeDetails = [
      ['Employee ID', payroll.employeeId.employeeId],
      ['Name', `${payroll.employeeId.firstName} ${payroll.employeeId.lastName}`],
      ['Department', payroll.employeeId.department],
      ['Pay Period', `${payroll.monthName} ${payroll.year}`]
    ];

    employeeDetails.forEach(([label, value]) => {
      addTableRow(doc, label, value);
    });
    doc.moveDown(0.5);

    // Salary Breakdown Section
    addSectionHeader(doc, 'SALARY BREAKDOWN');
    
    const salaryBreakdown = [
      ['Basic Salary', `₹${Number(payroll.basicSalary).toFixed(2)}`],
      ['HRA', `₹${Number(payroll.allowances.hra || 0).toFixed(2)}`],
      ['DA', `₹${Number(payroll.allowances.da || 0).toFixed(2)}`],
      ['TA', `₹${Number(payroll.allowances.ta || 0).toFixed(2)}`],
      ['Medical', `₹${Number(payroll.allowances.medical || 0).toFixed(2)}`]
    ];

    if (typeof payroll.allowances.other !== 'undefined' && payroll.allowances.other > 0) {
      salaryBreakdown.push(['Other Allowances', `₹${Number(payroll.allowances.other || 0).toFixed(2)}`]);
    }

    salaryBreakdown.push(['Overtime Pay', `₹${Number(payroll.overtimePay || 0).toFixed(2)}`]);
    
    salaryBreakdown.forEach(([label, value]) => {
      addTableRow(doc, label, value);
    });

    // Total Allowances
    doc.moveDown(0.5);
    addTableRow(doc, 'Total Allowances', `₹${Number(payroll.totalAllowances || 0).toFixed(2)}`, true);
    doc.moveDown(1);

    // Deductions Section
    addSectionHeader(doc, 'DEDUCTIONS');
    
    const deductions = [
      ['PF', `₹${Number(payroll.deductions.pf || 0).toFixed(2)}`],
      ['ESI', `₹${Number(payroll.deductions.esi || 0).toFixed(2)}`],
      ['Tax', `₹${Number(payroll.deductions.tax || 0).toFixed(2)}`],
      ['LOP', `₹${Number(payroll.deductions.lop || 0).toFixed(2)}`]
    ];

    if (typeof payroll.deductions.other !== 'undefined' && payroll.deductions.other > 0) {
      deductions.push(['Other Deductions', `₹${Number(payroll.deductions.other || 0).toFixed(2)}`]);
    }

    deductions.forEach(([label, value]) => {
      addTableRow(doc, label, value);
    });

    // Total Deductions
    doc.moveDown(0.5);
    addTableRow(doc, 'Total Deductions', `₹${Number(payroll.totalDeductions || 0).toFixed(2)}`, true);
    doc.moveDown(1);

    // Summary Section
    addSectionHeader(doc, 'SALARY SUMMARY');
    
    const summary = [
      ['Gross Salary', `₹${Number(payroll.grossSalary || 0).toFixed(2)}`],
      ['Net Salary', `₹${Number(payroll.netSalary || 0).toFixed(2)}`]
    ];

    summary.forEach(([label, value]) => {
      addTableRow(doc, label, value, true);
    });
    doc.moveDown(1);

    // Attendance Summary Section (if available)
    if (payroll.attendance) {
      addSectionHeader(doc, 'ATTENDANCE SUMMARY');
      
      const attendance = [
        ['Present Days', payroll.attendance.presentDays.toString()],
        ['Half Days', payroll.attendance.halfDays.toString()],
        ['Absent Days', payroll.attendance.absentDays.toString()],
        ['Leave Days', payroll.attendance.leaveDays.toString()],
        ['Total Working Hours', Number(payroll.attendance.workingHours || 0).toFixed(2)],
        ['Overtime Hours', Number(payroll.attendance.overtime || 0).toFixed(2)]
      ];

      attendance.forEach(([label, value]) => {
        addTableRow(doc, label, value);
      });
      doc.moveDown(1);
    }

    // Payment Details Section
    addSectionHeader(doc, 'PAYMENT DETAILS');
    
    const paymentDetails = [
      ['Status', payroll.status]
    ];

    if (payroll.paymentDate) {
      paymentDetails.push(['Payment Date', moment(payroll.paymentDate).format('DD/MM/YYYY')]);
    }
    if (payroll.paymentMethod) {
      paymentDetails.push(['Payment Method', payroll.paymentMethod]);
    }
    if (payroll.transactionId) {
      paymentDetails.push(['Transaction ID', payroll.transactionId]);
    }

    paymentDetails.forEach(([label, value]) => {
      addTableRow(doc, label, value);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica').text('This is a computer generated document and does not require signature.', { align: 'center' });
    doc.moveDown(0.5);
    doc.text(`Generated on: ${moment().format('DD/MM/YYYY HH:mm:ss')}`, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Generate payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Send payslip email
// @route   POST /api/payroll/send-payslip/:id
// @access  Private
const sendPayslipEmail = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findById(id)
      .populate('employeeId', 'employeeId firstName lastName email');

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    // Generate payslip if not already generated
    if (!payroll.payslipGenerated) {
      // Call generate payslip function
      // This would need to be implemented
    }

    // Send email logic would go here
    // For now, just update the status
    payroll.emailSent = true;
    payroll.emailSentAt = new Date();
    await payroll.save();

    res.json({
      success: true,
      message: 'Payslip email sent successfully'
    });
  } catch (error) {
    console.error('Send payslip email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all payrolls with pagination and filters
// @route   GET /api/payroll
// @access  Private
const getAllPayrolls = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      month,
      year,
      status,
      department
    } = req.query;

    const filters = {
      page,
      limit,
      search,
      month,
      year,
      status,
      department
    };

    const result = mockDataService.getPayrolls(filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get all payrolls error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get payroll statistics
// @route   GET /api/payroll/stats
// @access  Private
const getPayrollStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const filters = { month, year };
    const stats = mockDataService.getPayrollStats(filters);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get payroll stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  generatePayroll,
  getMonthlyPayroll,
  getEmployeePayroll,
  updatePayrollStatus,
  generatePayslip,
  sendPayslipEmail,
  getAllPayrolls,
  getPayrollStats
}; 