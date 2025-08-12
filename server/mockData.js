// Mock data for demonstration purposes
const mockEmployees = [
  {
    _id: 'emp001',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    department: 'IT',
    status: 'Active',
    salary: {
      basic: 50000,
      allowances: {
        hra: 20000,
        da: 5000,
        ta: 3000,
        medical: 2000,
        other: 1000
      },
      deductions: {
        pf: 6000,
        esi: 1000,
        tax: 5000,
        other: 500
      }
    }
  },
  {
    _id: 'emp002',
    employeeId: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    department: 'HR',
    status: 'Active',
    salary: {
      basic: 45000,
      allowances: {
        hra: 18000,
        da: 4500,
        ta: 2500,
        medical: 1800,
        other: 900
      },
      deductions: {
        pf: 5400,
        esi: 900,
        tax: 4500,
        other: 450
      }
    }
  },
  {
    _id: 'emp003',
    employeeId: 'EMP003',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@company.com',
    department: 'Finance',
    status: 'Active',
    salary: {
      basic: 55000,
      allowances: {
        hra: 22000,
        da: 5500,
        ta: 3500,
        medical: 2200,
        other: 1100
      },
      deductions: {
        pf: 6600,
        esi: 1100,
        tax: 5500,
        other: 550
      }
    }
  }
];

const mockPayrolls = [
  {
    _id: 'pay001',
    employeeId: mockEmployees[0],
    month: 12,
    year: 2024,
    basicSalary: 50000,
    allowances: {
      hra: 20000,
      da: 5000,
      ta: 3000,
      medical: 2000,
      other: 1000
    },
    deductions: {
      pf: 6000,
      esi: 1000,
      tax: 5000,
      lop: 0,
      other: 500
    },
    bonuses: {
      performance: 5000,
      festival: 2000,
      other: 0
    },
    attendance: {
      totalDays: 22,
      presentDays: 20,
      absentDays: 1,
      halfDays: 1,
      leaveDays: 0,
      workingHours: 160,
      overtime: 8
    },
    overtimePay: 4000,
    lopAmount: 0,
    grossSalary: 85000,
    netSalary: 67500,
    status: 'Paid',
    paymentDate: new Date('2024-12-01'),
    paymentMethod: 'Bank Transfer',
    transactionId: 'TXN001',
    totalAllowances: 31000,
    totalDeductions: 12500,
    totalBonuses: 7000
  },
  {
    _id: 'pay002',
    employeeId: mockEmployees[1],
    month: 12,
    year: 2024,
    basicSalary: 45000,
    allowances: {
      hra: 18000,
      da: 4500,
      ta: 2500,
      medical: 1800,
      other: 900
    },
    deductions: {
      pf: 5400,
      esi: 900,
      tax: 4500,
      lop: 0,
      other: 450
    },
    bonuses: {
      performance: 4000,
      festival: 1500,
      other: 0
    },
    attendance: {
      totalDays: 22,
      presentDays: 21,
      absentDays: 0,
      halfDays: 1,
      leaveDays: 0,
      workingHours: 168,
      overtime: 4
    },
    overtimePay: 2000,
    lopAmount: 0,
    grossSalary: 71700,
    netSalary: 59400,
    status: 'Pending',
    paymentDate: null,
    paymentMethod: 'Bank Transfer',
    transactionId: null,
    totalAllowances: 27700,
    totalDeductions: 11250,
    totalBonuses: 5500
  },
  {
    _id: 'pay003',
    employeeId: mockEmployees[2],
    month: 12,
    year: 2024,
    basicSalary: 55000,
    allowances: {
      hra: 22000,
      da: 5500,
      ta: 3500,
      medical: 2200,
      other: 1100
    },
    deductions: {
      pf: 6600,
      esi: 1100,
      tax: 5500,
      lop: 2500,
      other: 550
    },
    bonuses: {
      performance: 6000,
      festival: 2500,
      other: 0
    },
    attendance: {
      totalDays: 22,
      presentDays: 19,
      absentDays: 2,
      halfDays: 1,
      leaveDays: 0,
      workingHours: 152,
      overtime: 2
    },
    overtimePay: 1000,
    lopAmount: 2500,
    grossSalary: 85000,
    netSalary: 65300,
    status: 'Paid',
    paymentDate: new Date('2024-12-01'),
    paymentMethod: 'Bank Transfer',
    transactionId: 'TXN003',
    totalAllowances: 34300,
    totalDeductions: 16250,
    totalBonuses: 8500
  }
];

// Mock data service functions
const mockDataService = {
  // Get all payrolls with pagination and filters
  getPayrolls: (filters = {}) => {
    let filteredPayrolls = [...mockPayrolls];
    
    // Apply filters
    if (filters.month) {
      filteredPayrolls = filteredPayrolls.filter(p => p.month === parseInt(filters.month));
    }
    if (filters.year) {
      filteredPayrolls = filteredPayrolls.filter(p => p.year === parseInt(filters.year));
    }
    if (filters.status && filters.status !== 'all') {
      filteredPayrolls = filteredPayrolls.filter(p => p.status === filters.status);
    }
    if (filters.department && filters.department !== 'all') {
      filteredPayrolls = filteredPayrolls.filter(p => p.employeeId.department === filters.department);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPayrolls = filteredPayrolls.filter(p => 
        p.employeeId.firstName.toLowerCase().includes(searchTerm) ||
        p.employeeId.lastName.toLowerCase().includes(searchTerm) ||
        p.employeeId.employeeId.toLowerCase().includes(searchTerm)
      );
    }
    
    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;
    
    const total = filteredPayrolls.length;
    const paginatedPayrolls = filteredPayrolls.slice(skip, skip + limit);
    
    return {
      payrolls: paginatedPayrolls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  },

  // Get payroll statistics
  getPayrollStats: (filters = {}) => {
    let filteredPayrolls = [...mockPayrolls];
    
    if (filters.month) {
      filteredPayrolls = filteredPayrolls.filter(p => p.month === parseInt(filters.month));
    }
    if (filters.year) {
      filteredPayrolls = filteredPayrolls.filter(p => p.year === parseInt(filters.year));
    }
    
    const stats = {
      totalEmployees: filteredPayrolls.length,
      totalGrossSalary: filteredPayrolls.reduce((sum, p) => sum + p.grossSalary, 0),
      totalNetSalary: filteredPayrolls.reduce((sum, p) => sum + p.netSalary, 0),
      totalAllowances: filteredPayrolls.reduce((sum, p) => sum + p.totalAllowances, 0),
      totalDeductions: filteredPayrolls.reduce((sum, p) => sum + p.totalDeductions, 0),
      totalBonuses: filteredPayrolls.reduce((sum, p) => sum + p.totalBonuses, 0),
      totalOvertimePay: filteredPayrolls.reduce((sum, p) => sum + p.overtimePay, 0),
      totalLopAmount: filteredPayrolls.reduce((sum, p) => sum + p.lopAmount, 0),
      paidEmployees: filteredPayrolls.filter(p => p.status === 'Paid').length,
      pendingEmployees: filteredPayrolls.filter(p => p.status === 'Pending').length
    };
    
    return stats;
  },

  // Get employee payroll history
  getEmployeePayroll: (employeeId, year) => {
    const employee = mockEmployees.find(emp => emp._id === employeeId);
    if (!employee) return null;
    
    const payrolls = mockPayrolls.filter(p => 
      p.employeeId._id === employeeId && p.year === parseInt(year)
    );
    
    const ytdSummary = {
      totalGrossSalary: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
      totalNetSalary: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
      totalAllowances: payrolls.reduce((sum, p) => sum + p.totalAllowances, 0),
      totalDeductions: payrolls.reduce((sum, p) => sum + p.totalDeductions, 0),
      totalBonuses: payrolls.reduce((sum, p) => sum + p.totalBonuses, 0),
      totalOvertimePay: payrolls.reduce((sum, p) => sum + p.overtimePay, 0),
      totalLopAmount: payrolls.reduce((sum, p) => sum + p.lopAmount, 0),
      monthsPaid: payrolls.length
    };
    
    return {
      employeeId: employee,
      year: parseInt(year),
      payroll: payrolls,
      ytdSummary
    };
  },

  // Update payroll status
  updatePayrollStatus: (payrollId, status) => {
    const payroll = mockPayrolls.find(p => p._id === payrollId);
    if (payroll) {
      payroll.status = status;
      if (status === 'Paid' && !payroll.paymentDate) {
        payroll.paymentDate = new Date();
        payroll.transactionId = `TXN${Date.now()}`;
      }
      return payroll;
    }
    return null;
  },

  // Generate payroll
  generatePayroll: (month, year) => {
    // Simulate payroll generation
    const newPayrolls = mockEmployees.map(emp => ({
      _id: `pay${Date.now()}_${emp._id}`,
      employeeId: emp,
      month: parseInt(month),
      year: parseInt(year),
      basicSalary: emp.salary.basic,
      allowances: emp.salary.allowances,
      deductions: emp.salary.deductions,
      bonuses: {
        performance: Math.floor(Math.random() * 5000) + 2000,
        festival: Math.floor(Math.random() * 2000) + 1000,
        other: 0
      },
      attendance: {
        totalDays: 22,
        presentDays: Math.floor(Math.random() * 5) + 18,
        absentDays: Math.floor(Math.random() * 3),
        halfDays: Math.floor(Math.random() * 2),
        leaveDays: 0,
        workingHours: 160,
        overtime: Math.floor(Math.random() * 10)
      },
      overtimePay: Math.floor(Math.random() * 3000) + 1000,
      lopAmount: 0,
      grossSalary: emp.salary.basic + Object.values(emp.salary.allowances).reduce((sum, val) => sum + val, 0),
      netSalary: emp.salary.basic + Object.values(emp.salary.allowances).reduce((sum, val) => sum + val, 0) - Object.values(emp.salary.deductions).reduce((sum, val) => sum + val, 0),
      status: 'Pending',
      paymentDate: null,
      paymentMethod: 'Bank Transfer',
      transactionId: null,
      totalAllowances: Object.values(emp.salary.allowances).reduce((sum, val) => sum + val, 0),
      totalDeductions: Object.values(emp.salary.deductions).reduce((sum, val) => sum + val, 0),
      totalBonuses: 0
    }));
    
    mockPayrolls.push(...newPayrolls);
    return newPayrolls;
  },

  // Get a single payroll by ID (helper for mock payslip)
  getPayrollById: (payrollId) => {
    return mockPayrolls.find(p => p._id === payrollId) || null;
  }
};

module.exports = mockDataService; 