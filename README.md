# Accounts and Payroll Management System

A comprehensive payroll and accounts management system designed for small businesses with up to 100 employees.

## Features

### Employee Management
- Add/Edit/Delete employee profiles
- Auto-generate employee IDs
- Document upload support
- Bank details and salary management

### Attendance Management
- Daily check-in/check-out tracking
- Automatic working hours calculation
- Late entry and half-day detection
- Monthly attendance reports
- Loss of Pay (LOP) calculation

### Payroll Management
- **Monthly Salary Sheet Auto-Generation**: Automatically generates payroll for all active employees
- **Salary Components**: 
  - Basic salary calculation
  - Allowances (HRA, DA, TA, Medical, Other)
  - Deductions (PF, ESI, Tax, LOP, Other)
  - Bonuses (Performance, Festival, Other)
  - Overtime pay calculation
- **PF, ESI, LOP Support**: Automatic calculation based on attendance and salary structure
- **Payslip Generation**: PDF format with detailed salary breakdown
- **Status Management**: Paid/Unpaid toggle with payment tracking
- **Year-to-Date (YTD) Reports**: Comprehensive salary history and analytics
- **Email Integration**: Send payslips directly to employees
- **Advanced Filtering**: Search by employee, filter by month/year, department, status
- **Real-time Statistics**: Live dashboard with payroll metrics

### Accounts & Expense Tracker
- Company expense management
- Monthly profit/loss statements
- Expense categorization and filtering
- Revenue tracking

### Admin Dashboard
- Overview of employees, payroll, expenses, attendance
- Report export functionality (PDF/CSV)

### Customization Options
- Configurable deduction/allowance types
- Customizable working hours and holidays
- Flexible salary structure

### Integrations
- Email payslip to employees
- Google Sheets export
- API integration ready

## Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Reporting**: jsPDF, Excel Export
- **Email**: Nodemailer
- **File Upload**: Multer

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd payroll-management-system
```

2. Install dependencies
```bash
npm run install-all
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Configure MongoDB connection in `.env`

5. Start the development server
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/payroll-system
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Add new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/:id` - Get employee details

### Attendance
- `POST /api/attendance/checkin` - Employee check-in
- `POST /api/attendance/checkout` - Employee check-out
- `GET /api/attendance/:employeeId` - Get attendance records
- `GET /api/attendance/report/:month` - Monthly attendance report

### Payroll
- `GET /api/payroll` - Get all payrolls with pagination and filters
- `GET /api/payroll/stats` - Get payroll statistics
- `GET /api/payroll/monthly/:month` - Monthly payroll
- `POST /api/payroll/generate` - Generate payroll for all employees
- `GET /api/payroll/employee/:employeeId` - Get employee payroll history
- `GET /api/payroll/payslip/:id` - Generate payslip PDF
- `PUT /api/payroll/status/:id` - Update payment status
- `POST /api/payroll/send-payslip/:id` - Send payslip via email

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/report/:month` - Monthly expense report

### Reports
- `GET /api/reports/dashboard` - Dashboard overview
- `GET /api/reports/export/:type` - Export reports

## Project Structure

```
payroll-management-system/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── utils/
├── server/                 # Node.js backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── uploads/               # File uploads
└── docs/                 # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 