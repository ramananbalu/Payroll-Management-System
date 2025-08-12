import React from 'react';
import { useQuery } from 'react-query';
import { reportsAPI } from '../../services/api';
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';
import StatCard from '../../components/Dashboard/StatCard';
import RecentActivities from '../../components/Dashboard/RecentActivities';
import AttendanceChart from '../../components/Dashboard/AttendanceChart';
import ExpenseChart from '../../components/Dashboard/ExpenseChart';

const Dashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard',
    reportsAPI.getDashboard,
    {
      refetchInterval: 300000, // Refetch every 5 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Error loading dashboard
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {error.message || 'Something went wrong'}
        </p>
      </div>
    );
  }

  const data = dashboardData?.data || {};

  const stats = [
    {
      name: 'Total Employees',
      value: data.employeeStats?.totalEmployees || 0,
      change: '+2.5%',
      changeType: 'positive',
      icon: Users,
      color: 'primary',
    },
    {
      name: 'Active Employees',
      value: data.employeeStats?.activeEmployees || 0,
      change: '+1.2%',
      changeType: 'positive',
      icon: Users,
      color: 'success',
    },
    {
      name: 'Present Today',
      value: data.todayAttendance?.presentCount || 0,
      change: '-0.5%',
      changeType: 'negative',
      icon: Clock,
      color: 'warning',
    },
    {
      name: 'Monthly Payroll',
      value: `₹${(data.currentMonthPayroll?.totalPayroll || 0).toLocaleString()}`,
      change: '+8.1%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back! Here's what's happening with your payroll system.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Today's Attendance
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Current attendance status
            </p>
          </div>
          <div className="card-body">
            <AttendanceChart data={data.todayAttendance} />
          </div>
        </div>

        {/* Expense Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Monthly Overview
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Revenue vs Expenses
            </p>
          </div>
          <div className="card-body">
            <ExpenseChart data={data.currentMonthExpenses} />
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Activities
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Latest updates from your system
          </p>
        </div>
        <div className="card-body">
          <RecentActivities data={data.recentActivities} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="card hover:shadow-md transition-shadow duration-200">
          <div className="card-body text-center">
            <Users className="mx-auto h-8 w-8 text-primary-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Add Employee
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Register new employee
            </p>
          </div>
        </button>

        <button className="card hover:shadow-md transition-shadow duration-200">
          <div className="card-body text-center">
            <Clock className="mx-auto h-8 w-8 text-warning-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Mark Attendance
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Record attendance
            </p>
          </div>
        </button>

        <button className="card hover:shadow-md transition-shadow duration-200">
          <div className="card-body text-center">
            <DollarSign className="mx-auto h-8 w-8 text-success-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Generate Payroll
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Process monthly payroll
            </p>
          </div>
        </button>

        <button className="card hover:shadow-md transition-shadow duration-200">
          <div className="card-body text-center">
            <Activity className="mx-auto h-8 w-8 text-secondary-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              View Reports
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Access detailed reports
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard; 