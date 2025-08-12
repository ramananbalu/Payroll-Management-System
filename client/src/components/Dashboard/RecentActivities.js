import React from 'react';
import { Users, DollarSign, Receipt, Clock, User } from 'lucide-react';

const RecentActivities = ({ data }) => {
  const activities = [
    ...(data?.employees || []).map(emp => ({
      type: 'employee',
      title: `New employee ${emp.firstName} ${emp.lastName} added`,
      description: `${emp.department} department`,
      time: '2 hours ago',
      icon: Users,
      color: 'primary',
    })),
    ...(data?.payroll || []).map(pay => ({
      type: 'payroll',
      title: `Payroll generated for ${pay.employeeId?.firstName} ${pay.employeeId?.lastName}`,
      description: `₹${pay.netSalary?.toLocaleString() || 0}`,
      time: '1 day ago',
      icon: DollarSign,
      color: 'success',
    })),
    ...(data?.expenses || []).map(exp => ({
      type: 'expense',
      title: `${exp.title} - ${exp.type}`,
      description: `₹${exp.amount?.toLocaleString() || 0}`,
      time: '3 days ago',
      icon: Receipt,
      color: exp.type === 'Revenue' ? 'success' : 'warning',
    })),
  ].slice(0, 10); // Limit to 10 activities

  const getIconColor = (color) => {
    const colors = {
      primary: 'text-primary-600 bg-primary-100',
      success: 'text-success-600 bg-success-100',
      warning: 'text-warning-600 bg-warning-100',
      danger: 'text-danger-600 bg-danger-100',
    };
    return colors[color] || colors.primary;
  };

  if (!activities.length) {
    return (
      <div className="empty-state">
        <User className="empty-state-icon" />
        <h3 className="empty-state-title">No recent activities</h3>
        <p className="empty-state-description">
          Activities will appear here as you use the system.
        </p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => {
          const Icon = activity.icon;
          return (
            <li key={activityIdx}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getIconColor(activity.color)}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      <time dateTime={activity.time}>{activity.time}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentActivities; 