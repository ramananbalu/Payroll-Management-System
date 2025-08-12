import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft,
  Edit,
  Download,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Building,
  CreditCard,
  MapPin,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../../services/api';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/employees/${id}`);
      setEmployee(response.data.data.employee);
    } catch (error) {
      toast.error('Failed to fetch employee details');
      console.error('Error fetching employee details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        await api.delete(`/employees/${id}`);
        toast.success('Employee deleted successfully');
        navigate('/employees');
      } catch (error) {
        toast.error('Failed to delete employee');
        console.error('Error deleting employee:', error);
      }
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
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-100';
      case 'Inactive':
        return 'text-yellow-600 bg-yellow-100';
      case 'Terminated':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'Inactive':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'Terminated':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'salary', name: 'Salary', icon: DollarSign },
    { id: 'bank', name: 'Bank Details', icon: CreditCard },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'attendance', name: 'Attendance', icon: Clock }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Employee not found</h3>
        <p className="text-gray-500">The employee you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/employees')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            <span>Back to Employees</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/employees/${id}/edit`)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit size={16} />
            <span>Edit Employee</span>
          </button>
          <button
            onClick={handleDeleteEmployee}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Employee Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-10 w-10 text-gray-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">{employee.fullName}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(employee.status)}`}>
                {employee.status}
              </span>
            </div>
            <p className="text-gray-600 mt-1">{employee.employeeId}</p>
            <div className="flex items-center space-x-6 mt-2">
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{employee.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{employee.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{employee.role} • {employee.department}</span>
              </div>
            </div>
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User size={16} className="mr-2" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Full Name</label>
                      <p className="text-sm text-gray-900">{employee.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{employee.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{employee.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Joining Date</label>
                      <p className="text-sm text-gray-900">{formatDate(employee.joiningDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Building size={16} className="mr-2" />
                    Employment Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <p className="text-sm text-gray-900">{employee.role}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Department</label>
                      <p className="text-sm text-gray-900">{employee.department}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(employee.status)}
                        <span className="text-sm text-gray-900">{employee.status}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Employee ID</label>
                      <p className="text-sm text-gray-900">{employee.employeeId}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin size={16} className="mr-2" />
                  Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Street</label>
                    <p className="text-sm text-gray-900">{employee.address?.street || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <p className="text-sm text-gray-900">{employee.address?.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">State</label>
                    <p className="text-sm text-gray-900">{employee.address?.state || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Pincode</label>
                    <p className="text-sm text-gray-900">{employee.address?.pincode || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {employee.emergencyContact?.name && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Phone size={16} className="mr-2" />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Contact Name</label>
                      <p className="text-sm text-gray-900">{employee.emergencyContact.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Relationship</label>
                      <p className="text-sm text-gray-900">{employee.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Contact Phone</label>
                      <p className="text-sm text-gray-900">{employee.emergencyContact.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Salary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Salary</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(employee.salary?.basic || 0)}
                  </p>
                </div>

                {/* Total Salary */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-4">Total Salary</h3>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(employee.totalSalary || 0)}
                  </p>
                </div>
              </div>

              {/* Allowances */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Allowances</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">HRA</label>
                    <p className="text-sm text-gray-900">{formatCurrency(employee.salary?.allowances?.hra || 0)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">DA</label>
                    <p className="text-sm text-gray-900">{formatCurrency(employee.salary?.allowances?.da || 0)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Transport Allowance</label>
                    <p className="text-sm text-gray-900">{formatCurrency(employee.salary?.allowances?.ta || 0)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Medical Allowance</label>
                    <p className="text-sm text-gray-900">{formatCurrency(employee.salary?.allowances?.medical || 0)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Other Allowances</label>
                    <p className="text-sm text-gray-900">{formatCurrency(employee.salary?.allowances?.other || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Deductions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">PF</label>
                    <p className="text-sm text-gray-900">{formatCurrency(employee.salary?.deductions?.pf || 0)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">ESI</label>
                    <p className="text-sm text-gray-900">{formatCurrency(employee.salary?.deductions?.esi || 0)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tax</label>
                    <p className="text-sm text-gray-900">{formatCurrency(employee.salary?.deductions?.tax || 0)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Other Deductions</label>
                    <p className="text-sm text-gray-900">{formatCurrency(employee.salary?.deductions?.other || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CreditCard size={16} className="mr-2" />
                  Bank Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account Number</label>
                    <p className="text-sm text-gray-900">{employee.bankDetails?.accountNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">IFSC Code</label>
                    <p className="text-sm text-gray-900">{employee.bankDetails?.ifscCode || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bank Name</label>
                    <p className="text-sm text-gray-900">{employee.bankDetails?.bankName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Branch</label>
                    <p className="text-sm text-gray-900">{employee.bankDetails?.branch || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText size={16} className="mr-2" />
                  Documents
                </h3>
                {employee.documents && employee.documents.length > 0 ? (
                  <div className="space-y-3">
                    {employee.documents.map((doc) => (
                      <div key={doc._id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <FileText size={16} className="text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.originalName}</p>
                            <p className="text-xs text-gray-500">{doc.type} • {formatDate(doc.uploadDate)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Download functionality
                            toast.success('Download feature coming soon!');
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No documents uploaded</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Clock size={16} className="mr-2" />
                  Work Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Working Hours</label>
                    <p className="text-sm text-gray-900">{employee.workSchedule?.workingHours || 8} hours/day</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Time</label>
                    <p className="text-sm text-gray-900">{employee.workSchedule?.startTime || '09:00'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">End Time</label>
                    <p className="text-sm text-gray-900">{employee.workSchedule?.endTime || '18:00'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Records</h3>
                <p className="text-gray-500 text-center py-8">Attendance records will be displayed here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails; 