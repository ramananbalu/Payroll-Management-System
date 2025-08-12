import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  FileText,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Settings,
  Printer
} from 'lucide-react';
import api from '../../services/api';
import PayrollModal from './PayrollModal';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPayroll, setGeneratingPayroll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showYTDModal, setShowYTDModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [ytdEmployeeId, setYtdEmployeeId] = useState(null);
  const [ytdLoading, setYtdLoading] = useState(false);
  const [ytdData, setYtdData] = useState(null);
  const [stats, setStats] = useState({
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
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchPayrolls();
    fetchStats();
  }, [currentPage, searchTerm, filterMonth, filterYear, filterStatus, filterDepartment]);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        month: filterMonth,
        year: filterYear,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        department: filterDepartment !== 'all' ? filterDepartment : undefined
      };

      const response = await api.get('/payroll', { params });
      setPayrolls(response.data.data.payrolls);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to fetch payrolls');
      console.error('Error fetching payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/payroll/stats?month=${filterMonth}&year=${filterYear}`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleGeneratePayroll = async (month, year) => {
    try {
      setGeneratingPayroll(true);
      const resp = await api.post('/payroll/generate', {
        month,
        year
      });
      toast.success(`Generated salary sheet for ${months[month - 1]} ${year} for ${resp.data.data.totalEmployees} employees`);
      await fetchPayrolls();
      await fetchStats();
      setShowGenerateModal(false);
    } catch (error) {
      toast.error('Failed to generate payroll');
      console.error('Error generating payroll:', error);
    } finally {
      setGeneratingPayroll(false);
    }
  };

  const handleUpdateStatus = async (payrollId, status) => {
    try {
      await api.put(`/payroll/status/${payrollId}`, { status });
      toast.success('Payroll status updated successfully');
      fetchPayrolls();
      fetchStats();
    } catch (error) {
      toast.error('Failed to update payroll status');
      console.error('Error updating status:', error);
    }
  };

  const handleGeneratePayslip = async (payrollId) => {
    try {
      const response = await api.get(`/payroll/payslip/${payrollId}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${payrollId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Payslip generated successfully');
    } catch (error) {
      toast.error('Failed to generate payslip');
      console.error('Error generating payslip:', error);
    }
  };

  const handleSendEmail = async (payrollId) => {
    try {
      await api.post(`/payroll/send-payslip/${payrollId}`);
      toast.success('Payslip sent via email');
    } catch (error) {
      toast.error('Failed to send payslip via email');
      console.error('Error sending payslip:', error);
    }
  };

  const handleViewYTD = async (employeeId) => {
    try {
      setYtdLoading(true);
      const response = await api.get(`/payroll/employee/${employeeId}?year=${filterYear}`);
      setYtdData(response.data.data);
      setSelectedEmployee(response.data.data.employeeId);
      setShowYTDModal(true);
    } catch (error) {
      toast.error('Failed to fetch YTD data');
      console.error('Error fetching YTD data:', error);
    } finally {
      setYtdLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'text-green-600 bg-green-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle size={16} />;
      case 'Pending':
        return <AlertCircle size={16} />;
      case 'Cancelled':
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const openYtdModal = () => {
    setShowYTDModal(true);
    setYtdData(null);
    setSelectedEmployee(null);
    setYtdEmployeeId(payrolls[0]?.employeeId?._id || null);
  };

  const closeYtdModal = () => {
    setShowYTDModal(false);
    setYtdData(null);
    setSelectedEmployee(null);
    setYtdEmployeeId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600">Generate and manage employee payroll and salary processing</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGenerateModal(true)}
            disabled={generatingPayroll}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={generatingPayroll ? 'animate-spin' : ''} />
            <span>{generatingPayroll ? 'Generating...' : 'Generate Payroll'}</span>
          </button>
          
          <button
            onClick={openYtdModal}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <BarChart3 size={16} />
            <span>YTD Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-xl font-semibold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Gross Salary</p>
              <p className="text-xl font-semibold text-gray-900">{formatCurrency(stats.totalGrossSalary)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="text-purple-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Net Salary</p>
              <p className="text-xl font-semibold text-gray-900">{formatCurrency(stats.totalNetSalary)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CheckCircle className="text-yellow-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-xl font-semibold text-gray-900">{stats.paidEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-semibold text-gray-900">{stats.pendingEmployees}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Month Filter */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {months.map((month, index) => (
              <option key={index + 1} value={index + 1}>{month}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Basic Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allowances
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No payroll records found
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => (
                  <tr key={payroll._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payroll.employeeId?.firstName} {payroll.employeeId?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{payroll.employeeId?.employeeId}</div>
                        <div className="text-sm text-gray-500">{payroll.employeeId?.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(payroll.basicSalary)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>HRA: {formatCurrency(payroll.allowances.hra)}</div>
                        <div>DA: {formatCurrency(payroll.allowances.da)}</div>
                        <div>TA: {formatCurrency(payroll.allowances.ta)}</div>
                        <div>Medical: {formatCurrency(payroll.allowances.medical)}</div>
                        <div className="font-medium">Total: {formatCurrency(payroll.totalAllowances)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>PF: {formatCurrency(payroll.deductions.pf)}</div>
                        <div>ESI: {formatCurrency(payroll.deductions.esi)}</div>
                        <div>Tax: {formatCurrency(payroll.deductions.tax)}</div>
                        <div>LOP: {formatCurrency(payroll.deductions.lop)}</div>
                        <div className="font-medium">Total: {formatCurrency(payroll.totalDeductions)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(payroll.netSalary)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payroll.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payroll.status)}`}>
                          {payroll.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewYTD(payroll.employeeId._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View YTD"
                        >
                          <BarChart3 size={16} />
                        </button>
                        <button
                          onClick={() => handleGeneratePayslip(payroll._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Generate Payslip"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={() => handleSendEmail(payroll._id)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Send Email"
                        >
                          <Mail size={16} />
                        </button>
                        <select
                          value={payroll.status}
                          onChange={(e) => handleUpdateStatus(payroll._id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Payroll Modal */}
      <PayrollModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGeneratePayroll}
        generatingPayroll={generatingPayroll}
        currentMonth={filterMonth}
        currentYear={filterYear}
      />

      {/* YTD Modal */}
      {showYTDModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Year-to-Date Report {selectedEmployee ? `- ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}` : ''}
                </h3>
                <button
                  onClick={closeYtdModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {!ytdData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                      <select
                        value={ytdEmployeeId || ''}
                        onChange={(e) => setYtdEmployeeId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="" disabled>
                          {payrolls.length ? 'Choose an employee' : 'No employees available'}
                        </option>
                        {payrolls.map((p) => (
                          <option key={p.employeeId?._id} value={p.employeeId?._id}>
                            {p.employeeId?.firstName} {p.employeeId?.lastName} ({p.employeeId?.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <input
                        type="text"
                        value={filterYear}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeYtdModal}
                      className="px-4 py-2 border rounded-lg text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => ytdEmployeeId && handleViewYTD(ytdEmployeeId)}
                      disabled={!ytdEmployeeId || ytdLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {ytdLoading ? 'Loading...' : 'View Report'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600">Total Gross Salary</p>
                      <p className="text-xl font-semibold text-blue-900">{formatCurrency(ytdData.ytdSummary.totalGrossSalary)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600">Total Net Salary</p>
                      <p className="text-xl font-semibold text-green-900">{formatCurrency(ytdData.ytdSummary.totalNetSalary)}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600">Total Allowances</p>
                      <p className="text-xl font-semibold text-purple-900">{formatCurrency(ytdData.ytdSummary.totalAllowances)}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-600">Total Deductions</p>
                      <p className="text-xl font-semibold text-red-900">{formatCurrency(ytdData.ytdSummary.totalDeductions)}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic Salary</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allowances</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ytdData.payroll.map((payroll) => (
                          <tr key={payroll._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payroll.monthName} {payroll.year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(payroll.basicSalary)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(payroll.totalAllowances)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(payroll.totalDeductions)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(payroll.netSalary)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payroll.status)}`}>
                                {payroll.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll; 