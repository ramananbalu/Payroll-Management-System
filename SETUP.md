# Payroll Management System - Setup Guide

## Overview

A comprehensive Accounts and Payroll Management System built with the MERN stack (MongoDB, Express.js, React.js, Node.js) designed for small businesses with up to 100 employees.

## Features

### Core Modules
- **Employee Management**: Add, edit, delete employee profiles with auto-generated IDs
- **Attendance Tracking**: Daily check-in/check-out with working hours calculation
- **Payroll Management**: Auto-generated salary sheets with deductions and allowances
- **Expense Tracking**: Company expenses and revenue management
- **Reports**: Comprehensive reporting with PDF/Excel export
- **Settings**: Configurable system preferences and working hours

### Key Features
- JWT Authentication with role-based permissions
- File upload support for documents and receipts
- PDF payslip generation
- Email integration for payslip delivery
- Real-time dashboard with statistics
- Responsive design with Tailwind CSS
- Export functionality (PDF, Excel)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd payroll-management-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install

# Return to root directory
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/payroll-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@company.com
FROM_NAME=Payroll System

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Database Setup

1. Start MongoDB service
2. The application will automatically create the database and collections on first run

### 5. Create Upload Directory
```bash
mkdir uploads
```

## Running the Application

### Development Mode
```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
# Backend only
npm run server

# Frontend only
npm run client
```

### Production Mode
```bash
# Build the frontend
npm run build

# Start production server
npm start
```

## Default Admin Account

After first run, create an admin account using the registration endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@company.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `POST /api/employees/:id/documents` - Upload document

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/today` - Today's attendance
- `GET /api/attendance/:employeeId` - Employee attendance
- `GET /api/attendance/report/:month` - Monthly report

### Payroll
- `POST /api/payroll/generate` - Generate payroll
- `GET /api/payroll/monthly/:month` - Monthly payroll
- `GET /api/payroll/employee/:employeeId` - Employee payroll
- `PUT /api/payroll/status/:id` - Update payment status
- `GET /api/payroll/payslip/:id` - Generate payslip
- `POST /api/payroll/send-payslip/:id` - Send payslip email

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats` - Expense statistics

### Reports
- `GET /api/reports/employees` - Employee reports
- `GET /api/reports/payroll` - Payroll reports
- `GET /api/reports/attendance` - Attendance reports
- `GET /api/reports/financial` - Financial reports

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

## File Structure

```
payroll-management-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── index.js          # Server entry point
├── uploads/              # File uploads directory
├── .env                  # Environment variables
├── package.json          # Root package.json
└── README.md
```

## Configuration Options

### Working Hours
- Default working hours per day
- Start and end times
- Break time configuration
- Overtime settings

### Deductions & Allowances
- Customizable deduction types (PF, ESI, Tax, etc.)
- Allowance types (HRA, DA, TA, Medical, etc.)
- Percentage-based calculations

### Holidays
- Add/remove company holidays
- Holiday calendar management

### Email Settings
- SMTP configuration
- Email templates for payslips
- Automated email delivery

### Security Settings
- Password requirements
- Session timeout
- Login attempt limits
- Rate limiting

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing processes on the port

3. **File Upload Issues**
   - Ensure uploads directory exists
   - Check file size limits
   - Verify file permissions

4. **Email Not Sending**
   - Verify SMTP settings
   - Check email credentials
   - Ensure proper app passwords for Gmail

### Logs
- Server logs are displayed in the console
- Check browser console for frontend errors
- MongoDB logs for database issues

## Security Considerations

1. **Environment Variables**
   - Never commit .env files
   - Use strong JWT secrets
   - Rotate secrets regularly

2. **File Uploads**
   - Validate file types
   - Implement size limits
   - Scan for malware

3. **Authentication**
   - Use HTTPS in production
   - Implement rate limiting
   - Regular password updates

4. **Data Protection**
   - Encrypt sensitive data
   - Regular backups
   - Access control

## Production Deployment

### Environment Setup
1. Set NODE_ENV=production
2. Use production MongoDB instance
3. Configure HTTPS
4. Set up proper logging

### Performance Optimization
1. Enable compression
2. Implement caching
3. Optimize database queries
4. Use CDN for static assets

### Monitoring
1. Set up error tracking
2. Monitor application metrics
3. Database performance monitoring
4. Uptime monitoring

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Verify environment configuration

## License

This project is licensed under the MIT License. 