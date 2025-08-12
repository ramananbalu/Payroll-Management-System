import axios from 'axios';

// Create axios instance
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

export const employeesAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (employeeData) => api.post('/employees', employeeData),
  update: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
  delete: (id) => api.delete(`/employees/${id}`),
  uploadDocument: (id, formData) => api.post(`/employees/${id}/documents`, formData),
  getStats: () => api.get('/employees/stats'),
};

export const attendanceAPI = {
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: (data) => api.post('/attendance/checkout', data),
  getEmployeeAttendance: (employeeId, params) => api.get(`/attendance/${employeeId}`, { params }),
  getMonthlyReport: (month, params) => api.get(`/attendance/report/${month}`, { params }),
  getTodayAttendance: () => api.get('/attendance/today'),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
};

export const payrollAPI = {
  generate: (data) => api.post('/payroll/generate', data),
  getMonthly: (month, params) => api.get(`/payroll/monthly/${month}`, { params }),
  getEmployeePayroll: (employeeId, params) => api.get(`/payroll/employee/${employeeId}`, { params }),
  updateStatus: (id, data) => api.put(`/payroll/status/${id}`, data),
  generatePayslip: (id) => api.get(`/payroll/payslip/${id}`),
  sendPayslip: (id) => api.post(`/payroll/send-payslip/${id}`),
};

export const expensesAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (expenseData) => api.post('/expenses', expenseData),
  update: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),
  delete: (id) => api.delete(`/expenses/${id}`),
  uploadReceipt: (id, formData) => api.post(`/expenses/${id}/receipt`, formData),
  getStats: (params) => api.get('/expenses/stats', { params }),
  getProfitLoss: (params) => api.get('/expenses/profit-loss', { params }),
};

export const reportsAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  exportEmployees: () => api.get('/reports/export/employees', { responseType: 'blob' }),
  exportPayroll: (params) => api.get('/reports/export/payroll', { params, responseType: 'blob' }),
  exportExpenses: (params) => api.get('/reports/export/expenses', { params, responseType: 'blob' }),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (settings) => api.put('/settings', { settings }),
  getPayrollConfig: () => api.get('/settings/payroll-config'),
  getExpenseCategories: () => api.get('/settings/expense-categories'),
  getEmployeeConfig: () => api.get('/settings/employee-config'),
};

// Utility functions
export const downloadFile = (response, filename) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api; 