import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Calendar, 
  DollarSign, 
  Clock, 
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const PayrollDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPayslip, setGeneratingPayslip] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchPayrollDetails();
  }, [id]);

  const fetchPayrollDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/payroll/${id}`);
      setPayroll(response.data);
    } catch (error) {
      toast.error('Failed to fetch payroll details');
      console.error('Error fetching payroll details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslip = async () => {
    try {
      setGeneratingPayslip(true);
      const response = await api.get(`/payroll/payslip/${id}`);
      
      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${payroll.employeeId}-${payroll.month}-${payroll.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Payslip generated successfully');
    } catch (error) {
      toast.error('Failed to generate payslip');
      console.error('Error generating payslip:', error);
    } finally {
      setGeneratingPayslip(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
      await api.post(`/payroll/send-payslip/${id}`);
      toast.success('Payslip sent via email');
    } catch (error) {
      toast.error('Failed to send payslip via email');
      console.error('Error sending payslip:', error);
    } finally {
      setSendingEmail(false);
    }
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Payroll not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll Details</h1>
            <p className="text-gray-600">
              {payroll.employee?.fullName} - {new Date(payroll.year, payroll.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleGeneratePayslip}
            disabled={generatingPayslip}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Download size={16} />
            <span>{generatingPayslip ? 'Generating...' : 'Download Payslip'}</span>
          </button>
          
          <button
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Mail size={16} />
            <span>{sendingEmail ? 'Sending...' : 'Send Email'}</span>
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Payment Status</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payroll.status)}`}>
            {payroll.status}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-600">Payment Date</p>
              <p className="font-medium">
                {payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString() : 'Not paid yet'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <DollarSign className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium">{payroll.paymentMethod}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <FileText className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-600">Transaction ID</p>
              <p className="font-medium">{payroll.transactionId || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="text-green-600 mr-2" size={20} />
            Earnings
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Basic Salary</span>
              <span className="font-medium">{formatCurrency(payroll.basicSalary)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">HRA</span>
              <span className="font-medium">{formatCurrency(payroll.allowances.hra)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">DA</span>
              <span className="font-medium">{formatCurrency(payroll.allowances.da)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">TA</span>
              <span className="font-medium">{formatCurrency(payroll.allowances.ta)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Medical Allowance</span>
              <span className="font-medium">{formatCurrency(payroll.allowances.medical)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Other Allowances</span>
              <span className="font-medium">{formatCurrency(payroll.allowances.other)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Overtime Pay</span>
              <span className="font-medium">{formatCurrency(payroll.overtimePay)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Performance Bonus</span>
              <span className="font-medium">{formatCurrency(payroll.bonuses.performance)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Festival Bonus</span>
              <span className="font-medium">{formatCurrency(payroll.bonuses.festival)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Other Bonuses</span>
              <span className="font-medium">{formatCurrency(payroll.bonuses.other)}</span>
            </div>
            
            <hr className="my-3" />
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Gross Salary</span>
              <span className="text-green-600">{formatCurrency(payroll.grossSalary)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <XCircle className="text-red-600 mr-2" size={20} />
            Deductions
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">PF</span>
              <span className="font-medium">{formatCurrency(payroll.deductions.pf)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">ESI</span>
              <span className="font-medium">{formatCurrency(payroll.deductions.esi)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">{formatCurrency(payroll.deductions.tax)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">LOP Amount</span>
              <span className="font-medium">{formatCurrency(payroll.deductions.lop)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Other Deductions</span>
              <span className="font-medium">{formatCurrency(payroll.deductions.other)}</span>
            </div>
            
            <hr className="my-3" />
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Deductions</span>
              <span className="text-red-600">
                {formatCurrency(
                  payroll.deductions.pf + 
                  payroll.deductions.esi + 
                  payroll.deductions.tax + 
                  payroll.deductions.lop + 
                  payroll.deductions.other
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="text-blue-600 mr-2" size={20} />
          Attendance Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{payroll.attendance.presentDays}</p>
            <p className="text-sm text-gray-600">Present Days</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{payroll.attendance.absentDays}</p>
            <p className="text-sm text-gray-600">Absent Days</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{payroll.attendance.halfDays}</p>
            <p className="text-sm text-gray-600">Half Days</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{payroll.attendance.workingHours}</p>
            <p className="text-sm text-gray-600">Working Hours</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Overtime Hours</span>
            <span className="font-medium">{payroll.attendance.overtime} hours</span>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Leave Days</span>
            <span className="font-medium">{payroll.attendance.leaveDays} days</span>
          </div>
        </div>
      </div>

      {/* Remarks */}
      {payroll.remarks && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="text-orange-600 mr-2" size={20} />
            Remarks
          </h3>
          <p className="text-gray-700">{payroll.remarks}</p>
        </div>
      )}
    </div>
  );
};

export default PayrollDetails; 