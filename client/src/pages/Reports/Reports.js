import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Download, 
  FileText, 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart,
  Filter,
  Receipt
} from 'lucide-react';
import api from '../../services/api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    department: 'all',
    status: 'all'
  });
  const [reportData, setReportData] = useState({});

  useEffect(() => {
    fetchReportData();
  }, [activeTab, filters]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        department: filters.department !== 'all' ? filters.department : undefined,
        status: filters.status !== 'all' ? filters.status : undefined
      };

      let response;
      switch (activeTab) {
        case 'employee':
          response = await api.get('/reports/employees', { params });
          break;
        case 'payroll':
          response = await api.get('/reports/payroll', { params });
          break;
        case 'attendance':
          response = await api.get('/reports/attendance', { params });
          break;
        case 'expenses':
          response = await api.get('/reports/expenses', { params });
          break;
        case 'financial':
          response = await api.get('/reports/financial', { params });
          break;
        default:
          return;
      }

      setReportData(response.data);
    } catch (error) {
      toast.error('Failed to fetch report data');
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      setLoading(true);
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        department: filters.department !== 'all' ? filters.department : undefined,
        status: filters.status !== 'all' ? filters.status : undefined
      };

      // Add month and year for payroll and expenses
      if (activeTab === 'payroll' || activeTab === 'expenses') {
        const currentDate = new Date();
        params.month = currentDate.getMonth() + 1;
        params.year = currentDate.getFullYear();
      }

      let response;
      let endpoint;
      
      if (format === 'pdf') {
        endpoint = `/reports/${activeTab}/export/pdf`;
      } else {
        endpoint = `/reports/${activeTab}/export`;
      }

      response = await api.get(endpoint, { 
        params, 
        responseType: 'blob' 
      });

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on format and report type
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${activeTab}-report-${timestamp}.${format}`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error(`Failed to export report as ${format.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'employee', name: 'Employee Reports', icon: Users },
    { id: 'payroll', name: 'Payroll Reports', icon: DollarSign },
    { id: 'attendance', name: 'Attendance Reports', icon: Clock },
    { id: 'financial', name: 'Financial Reports', icon: TrendingUp },
    { id: 'expenses', name: 'Expenses Reports', icon: Receipt }
  ];

  const departments = [
    'IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Other'
  ];

  const statuses = ['Active', 'Inactive', 'Terminated'];

  const renderEmployeeReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="text-blue-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.totalEmployees || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="text-green-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.activeEmployees || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="text-yellow-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">New Hires</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.newHires || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="text-purple-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Salary</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.avgSalary || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      {reportData.employees && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Employee Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joining Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.employees.map((employee) => (
                  <tr key={employee._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(employee.joiningDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        employee.status === 'Active' ? 'text-green-600 bg-green-100' : 
                        employee.status === 'Inactive' ? 'text-yellow-600 bg-yellow-100' : 
                        'text-red-600 bg-red-100'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(employee.totalSalary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderPayrollReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="text-blue-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Payroll</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalPayroll || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="text-green-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.paidAmount || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="text-yellow-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.pendingAmount || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="text-purple-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Employees Paid</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.employeesPaid || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll List */}
      {reportData.payrolls && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Payroll Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.payrolls.map((payroll) => (
                  <tr key={payroll._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payroll.employee?.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payroll.year, payroll.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(payroll.grossSalary)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(payroll.netSalary)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payroll.status === 'Paid' ? 'text-green-600 bg-green-100' : 
                        payroll.status === 'Pending' ? 'text-yellow-600 bg-yellow-100' : 
                        'text-red-600 bg-red-100'
                      }`}>
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payroll.paymentDate ? formatDate(payroll.paymentDate) : 'Not paid'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderAttendanceReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="text-blue-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.totalDays || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="text-green-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Present Days</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.presentDays || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="text-red-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Absent Days</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.absentDays || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="text-yellow-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Half Days</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.halfDays || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      {reportData.attendance && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Working Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.attendance.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.employee?.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString() : 'Not checked in'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString() : 'Not checked out'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.workingHours} hours</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        record.status === 'Present' ? 'text-green-600 bg-green-100' : 
                        record.status === 'Absent' ? 'text-red-600 bg-red-100' : 
                        record.status === 'Half Day' ? 'text-yellow-600 bg-yellow-100' : 
                        'text-gray-600 bg-gray-100'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderExpenseReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Receipt className="text-red-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalExpenses || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="text-green-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="text-blue-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Expense Count</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.expenseCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="text-purple-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Revenue Count</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.revenueCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      {(reportData.expenseBreakdown || reportData.revenueBreakdown) && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Expense & Revenue Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Expense Breakdown</h4>
                {reportData.expenseBreakdown && Object.entries(reportData.expenseBreakdown).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">{category}</span>
                    <span className="text-sm font-medium text-red-600">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Revenue Breakdown</h4>
                {reportData.revenueBreakdown && Object.entries(reportData.revenueBreakdown).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">{category}</span>
                    <span className="text-sm font-medium text-green-600">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense List */}
      {reportData.expenses && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Expense Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{expense.title}</div>
                      <div className="text-sm text-gray-500">{expense.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`font-medium ${expense.type === 'Expense' ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(expense.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        expense.type === 'Expense' ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'
                      }`}>
                        {expense.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(expense.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        expense.status === 'Approved' ? 'text-green-600 bg-green-100' : 
                        expense.status === 'Pending' ? 'text-yellow-600 bg-yellow-100' : 
                        'text-red-600 bg-red-100'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderFinancialReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="text-green-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="text-red-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalExpenses || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="text-blue-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className={`text-2xl font-bold ${(reportData.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(reportData.netProfit || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="text-purple-600" size={24} />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Payroll Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.payrollExpenses || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      {reportData.financialSummary && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Revenue Breakdown</h4>
                {reportData.financialSummary.revenue && Object.entries(reportData.financialSummary.revenue).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">{category}</span>
                    <span className="text-sm font-medium text-green-600">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Expense Breakdown</h4>
                {reportData.financialSummary.expenses && Object.entries(reportData.financialSummary.expenses).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">{category}</span>
                    <span className="text-sm font-medium text-red-600">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and export various reports</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport('pdf')}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <Download size={16} />
            <span>Export PDF</span>
          </button>
          
          <button
            onClick={() => handleExport('excel')}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Download size={16} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'employee' && renderEmployeeReport()}
              {activeTab === 'payroll' && renderPayrollReport()}
              {activeTab === 'attendance' && renderAttendanceReport()}
              {activeTab === 'financial' && renderFinancialReport()}
              {activeTab === 'expenses' && renderExpenseReport()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports; 