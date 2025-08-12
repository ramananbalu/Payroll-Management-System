import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const AttendanceChart = ({ data }) => {
  const chartData = [
    {
      name: 'Present',
      value: data?.presentCount || 0,
      color: '#22c55e',
    },
    {
      name: 'Absent',
      value: data?.absentCount || 0,
      color: '#ef4444',
    },
    {
      name: 'Late',
      value: data?.lateCount || 0,
      color: '#f59e0b',
    },
  ].filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <h3 className="empty-state-title">No attendance data</h3>
        <p className="empty-state-description">
          Attendance data will appear here once employees start checking in.
        </p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [value, name]}
            labelFormatter={(label) => `${label}: ${((chartData.find(item => item.name === label)?.value / total) * 100).toFixed(1)}%`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        {chartData.map((item) => (
          <div key={item.name}>
            <div className="text-2xl font-bold" style={{ color: item.color }}>
              {item.value}
            </div>
            <div className="text-sm text-gray-500">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceChart; 