import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ExpenseChart = ({ data }) => {
  const chartData = [
    {
      name: 'Revenue',
      amount: data?.revenue || 0,
      color: '#22c55e',
    },
    {
      name: 'Expenses',
      amount: data?.expenses || 0,
      color: '#ef4444',
    },
  ];

  const total = chartData.reduce((sum, item) => sum + item.amount, 0);

  if (total === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💰</div>
        <h3 className="empty-state-title">No financial data</h3>
        <p className="empty-state-description">
          Financial data will appear here once expenses and revenue are recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="amount" fill="#8884d8">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        {chartData.map((item) => (
          <div key={item.name}>
            <div className="text-2xl font-bold" style={{ color: item.color }}>
              ₹{item.amount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">{item.name}</div>
          </div>
        ))}
      </div>
      
      {data?.revenue && data?.expenses && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              Net: ₹{(data.revenue - data.expenses).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              {data.revenue > data.expenses ? 'Profit' : 'Loss'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart; 