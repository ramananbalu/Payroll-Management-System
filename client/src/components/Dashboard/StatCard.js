import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ name, value, change, changeType, icon: Icon, color = 'primary' }) => {
  const colorClasses = {
    primary: {
      icon: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    success: {
      icon: 'text-success-600',
      bg: 'bg-success-50',
    },
    warning: {
      icon: 'text-warning-600',
      bg: 'bg-warning-50',
    },
    danger: {
      icon: 'text-danger-600',
      bg: 'bg-danger-50',
    },
    secondary: {
      icon: 'text-secondary-600',
      bg: 'bg-secondary-50',
    },
  };

  const { icon: iconColor, bg } = colorClasses[color] || colorClasses.primary;

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${bg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="stat-card-title">{name}</dt>
              <dd className="stat-card-value">{value}</dd>
            </dl>
          </div>
        </div>
        <div className="mt-4">
          <div className={`stat-card-change-${changeType}`}>
            {changeType === 'positive' ? (
              <TrendingUp className="self-center flex-shrink-0 h-5 w-5" />
            ) : (
              <TrendingDown className="self-center flex-shrink-0 h-5 w-5" />
            )}
            <span className="sr-only">
              {changeType === 'positive' ? 'Increased' : 'Decreased'} by
            </span>
            <span className="ml-2">{change}</span>
            <span className="sr-only">from last month</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard; 