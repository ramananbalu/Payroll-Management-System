import React, { useEffect, useState } from 'react';
import { Clock, Calendar, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
// import { api } from '../../services/api'; // Uncomment if real API is available

// Configurable thresholds
const LATE_THRESHOLD = '09:15'; // 9:15 AM
const HALFDAY_HOURS = 4;
const EXPECTED_WORKING_DAYS = 22;

// Helper functions
function getTimeString(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function getDateString(date) {
  return date.toISOString().split('T')[0];
}
function parseTime(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}
function minutesToHrsMins(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

// Mock API data for monthly report
function getMockMonthlyAttendance() {
  // Generate 30 days of mock data
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const arr = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), d);
    // Randomize attendance
    let status = 'Present';
    let checkIn = '09:0' + (Math.floor(Math.random() * 3) + 1); // 09:01-09:03
    let checkOut = '18:00';
    let workingMinutes = 540; // 9h
    let flags = [];
    if (Math.random() < 0.1) {
      status = 'Absent';
      checkIn = '';
      checkOut = '';
      workingMinutes = 0;
    } else if (Math.random() < 0.15) {
      status = 'Late';
      checkIn = '09:30';
      checkOut = '18:00';
      workingMinutes = 510;
      flags.push('Late');
    } else if (Math.random() < 0.1) {
      status = 'Half-day';
      checkIn = '09:10';
      checkOut = '13:00';
      workingMinutes = 230;
      flags.push('Half-day');
    }
    arr.push({
      date: getDateString(date),
      checkIn,
      checkOut,
      workingMinutes,
      status,
      flags,
    });
  }
  return arr;
}

const Attendance = () => {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [checking, setChecking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Simulate fetching today's attendance and monthly report
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const today = getDateString(new Date());
      const monthData = getMockMonthlyAttendance();
      setMonthlyAttendance(monthData);
      setTodayAttendance(monthData.find((d) => d.date === today));
    }, 500);
  }, []);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check-in handler
  const handleCheckIn = () => {
    console.log('Check In clicked!');
    setChecking(true);
    setTimeout(() => {
      const now = new Date();
      const checkInTime = getTimeString(now);
      const late = parseTime(checkInTime) > parseTime(LATE_THRESHOLD);
      const newToday = {
        date: getDateString(now),
        checkIn: checkInTime,
        checkOut: '',
        workingMinutes: 0,
        status: late ? 'Late' : 'Present',
        flags: late ? ['Late'] : [],
      };
      console.log('New today attendance:', newToday);
      setTodayAttendance(newToday);
      setMonthlyAttendance((prev) =>
        prev.map((d) => (d.date === newToday.date ? newToday : d))
      );
      toast.success('Checked in!');
      setChecking(false);
    }, 800);
  };

  // Check-out handler
  const handleCheckOut = () => {
    console.log('Check Out clicked!');
    setChecking(true);
    setTimeout(() => {
      const now = new Date();
      const checkOutTime = getTimeString(now);
      let workingMinutes = 0;
      let status = 'Present';
      let flags = [];
      if (todayAttendance && todayAttendance.checkIn) {
        const [h1, m1] = todayAttendance.checkIn.split(':').map(Number);
        const [h2, m2] = checkOutTime.split(':').map(Number);
        workingMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (workingMinutes < HALFDAY_HOURS * 60) {
          status = 'Half-day';
          flags.push('Half-day');
        } else if (parseTime(todayAttendance.checkIn) > parseTime(LATE_THRESHOLD)) {
          status = 'Late';
          flags.push('Late');
        }
      }
      const newToday = {
        ...todayAttendance,
        checkOut: checkOutTime,
        workingMinutes,
        status,
        flags,
      };
      console.log('New today attendance:', newToday);
      setTodayAttendance(newToday);
      setMonthlyAttendance((prev) =>
        prev.map((d) => (d.date === newToday.date ? newToday : d))
      );
      toast.success('Checked out!');
      setChecking(false);
    }, 800);
  };

  // Monthly summary stats
  const presentDays = monthlyAttendance.filter((d) => d.status === 'Present').length;
  const lateDays = monthlyAttendance.filter((d) => d.status === 'Late').length;
  const halfDays = monthlyAttendance.filter((d) => d.status === 'Half-day').length;
  const absentDays = monthlyAttendance.filter((d) => d.status === 'Absent').length;
  const lopDays = Math.max(0, EXPECTED_WORKING_DAYS - (presentDays + lateDays + halfDays));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="page-title flex items-center gap-2"><Clock className="inline-block mr-2" /> Attendance</h1>
          <p className="page-subtitle">Track employee attendance and manage check-ins/check-outs.</p>
        </div>
      </div>

      {/* Today Panel */}
      <div className="card">
        <div className="card-body flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="text-lg font-semibold">Today: {getDateString(currentTime)}</div>
            <div className="text-2xl font-mono mt-1">{getTimeString(currentTime)}</div>
            <div className="mt-2">
              {todayAttendance?.checkIn ? (
                <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-medium mr-2">
                  Checked in: {todayAttendance.checkIn}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-medium mr-2">
                  Not checked in
                </span>
              )}
              {todayAttendance?.checkOut ? (
                <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                  Checked out: {todayAttendance.checkOut}
                </span>
              ) : null}
            </div>
            <div className="mt-2">
              {todayAttendance?.workingMinutes ? (
                <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">
                  Worked: {minutesToHrsMins(todayAttendance.workingMinutes)}
                </span>
              ) : null}
              {todayAttendance?.flags?.map((flag) => (
                <span key={flag} className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-medium ml-2">
                  {flag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={!!todayAttendance?.checkIn || checking}
              onClick={handleCheckIn}
            >
              <ArrowDownCircle className="mr-2" size={18} /> Check In
            </button>
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={!todayAttendance?.checkIn || !!todayAttendance?.checkOut || checking}
              onClick={handleCheckOut}
            >
              <ArrowUpCircle className="mr-2" size={18} /> Check Out
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="stat-card bg-green-50">
          <div className="stat-title">Present</div>
          <div className="stat-value text-green-700">{presentDays}</div>
        </div>
        <div className="stat-card bg-blue-50">
          <div className="stat-title">Late</div>
          <div className="stat-value text-blue-700">{lateDays}</div>
        </div>
        <div className="stat-card bg-yellow-50">
          <div className="stat-title">Half-day</div>
          <div className="stat-value text-yellow-700">{halfDays}</div>
        </div>
        <div className="stat-card bg-gray-50">
          <div className="stat-title">Absent</div>
          <div className="stat-value text-gray-700">{absentDays}</div>
        </div>
        <div className="stat-card bg-red-50">
          <div className="stat-title">LOP</div>
          <div className="stat-value text-red-700">{lopDays}</div>
        </div>
      </div>

      {/* Monthly Attendance Table */}
      <div className="card">
        <div className="card-body overflow-x-auto">
          <div className="flex items-center mb-2">
            <Calendar className="mr-2" />
            <span className="font-semibold">Monthly Attendance Report</span>
          </div>
          <table className="min-w-full text-xs md:text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">Date</th>
                <th className="px-2 py-1 border">Check In</th>
                <th className="px-2 py-1 border">Check Out</th>
                <th className="px-2 py-1 border">Hours</th>
                <th className="px-2 py-1 border">Status</th>
                <th className="px-2 py-1 border">Flags</th>
              </tr>
            </thead>
            <tbody>
              {monthlyAttendance.map((d) => (
                <tr key={d.date} className={d.date === getDateString(currentTime) ? 'bg-blue-50' : ''}>
                  <td className="px-2 py-1 border font-mono">{d.date}</td>
                  <td className="px-2 py-1 border">{d.checkIn || '-'}</td>
                  <td className="px-2 py-1 border">{d.checkOut || '-'}</td>
                  <td className="px-2 py-1 border">{d.workingMinutes ? minutesToHrsMins(d.workingMinutes) : '-'}</td>
                  <td className="px-2 py-1 border">
                    {d.status === 'Present' && <span className="text-green-700 font-semibold">Present</span>}
                    {d.status === 'Late' && <span className="text-blue-700 font-semibold">Late</span>}
                    {d.status === 'Half-day' && <span className="text-yellow-700 font-semibold">Half-day</span>}
                    {d.status === 'Absent' && <span className="text-gray-700 font-semibold">Absent</span>}
                  </td>
                  <td className="px-2 py-1 border">
                    {d.flags && d.flags.length > 0 ? d.flags.map(f => (
                      <span key={f} className="inline-block bg-red-100 text-red-700 rounded px-2 py-0.5 mr-1 text-xs">{f}</span>
                    )) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance; 