import React, { useState } from 'react';
import { X, Calendar, RefreshCw } from 'lucide-react';

const PayrollModal = ({ isOpen, onClose, onGenerate, generatingPayroll, currentMonth, currentYear }) => {
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(month, year);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Generate Monthly Payroll</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            This will generate payroll for all active employees for the selected month and year.
            The system will automatically calculate:
          </p>
          
          <ul className="text-sm text-gray-600 mb-6 space-y-2">
            <li>• Basic salary and allowances (HRA, DA, TA, Medical)</li>
            <li>• Deductions (PF, ESI, Tax, LOP)</li>
            <li>• Overtime pay based on attendance</li>
            <li>• Bonuses and other components</li>
            <li>• Net salary calculation</li>
          </ul>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {months.map((monthName, index) => (
                  <option key={index + 1} value={index + 1}>{monthName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={generatingPayroll}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generatingPayroll}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <RefreshCw size={16} className={generatingPayroll ? 'animate-spin' : ''} />
                <span>{generatingPayroll ? 'Generating...' : 'Generate Payroll'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PayrollModal; 