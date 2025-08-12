# Payroll Management System - Feature Documentation

## Overview

The Payroll Management System provides comprehensive payroll processing capabilities for organizations with up to 100 employees. It automates salary calculation, generates payslips, and provides detailed reporting.

## Key Features

### 1. Monthly Salary Sheet Auto-Generation

**Functionality:**
- Automatically generates payroll for all active employees
- Calculates salary components based on employee data and attendance
- Supports bulk processing for entire organization

**Components Calculated:**
- **Basic Salary**: Employee's base salary
- **Allowances**: HRA, DA, TA, Medical, Other allowances
- **Deductions**: PF, ESI, Tax, LOP, Other deductions
- **Bonuses**: Performance, Festival, Other bonuses
- **Overtime Pay**: Calculated based on attendance records

**Process:**
1. Select month and year for payroll generation
2. System fetches all active employees
3. Retrieves attendance data for the selected period
4. Calculates LOP (Loss of Pay) based on attendance
5. Applies salary structure and allowances
6. Calculates deductions and taxes
7. Generates final net salary

### 2. Salary Components

#### Basic Salary
- Foundation salary amount for each employee
- Configurable per employee
- Used as base for other calculations

#### Allowances
- **HRA (House Rent Allowance)**: Housing allowance
- **DA (Dearness Allowance)**: Cost of living adjustment
- **TA (Transport Allowance)**: Transportation expenses
- **Medical Allowance**: Healthcare expenses
- **Other Allowances**: Additional benefits

#### Deductions
- **PF (Provident Fund)**: Retirement savings
- **ESI (Employee State Insurance)**: Health insurance
- **Tax**: Income tax deductions
- **LOP (Loss of Pay)**: Salary deduction for absences
- **Other Deductions**: Additional deductions

#### Bonuses
- **Performance Bonus**: Based on performance metrics
- **Festival Bonus**: Seasonal bonuses
- **Other Bonuses**: Additional incentives

### 3. PF, ESI, LOP Support

#### Provident Fund (PF)
- Automatic calculation based on basic salary
- Configurable percentage (typically 12% of basic)
- Employee and employer contributions tracked

#### Employee State Insurance (ESI)
- Health insurance coverage
- Calculated on gross salary
- Automatic deduction and tracking

#### Loss of Pay (LOP)
- Calculated based on attendance records
- Formula: (Basic Salary / Total Days) × Absent Days
- Supports half-day calculations
- Automatic deduction from salary

### 4. Payslip Generation

#### PDF Format
- Professional payslip layout
- Company branding and logo
- Detailed salary breakdown
- Employee and payment information

#### Content Includes:
- Employee details (ID, name, department)
- Pay period information
- Salary components breakdown
- Attendance summary
- Payment details
- Net payable amount

#### Features:
- Download functionality
- Email integration
- Digital signature support
- Archive and retrieval

### 5. Status Management

#### Payment Status
- **Pending**: Payroll generated, payment not processed
- **Paid**: Payment completed
- **Cancelled**: Payroll cancelled

#### Status Updates
- Real-time status tracking
- Payment date recording
- Payment method tracking
- Transaction ID storage
- Remarks and notes

### 6. Year-to-Date (YTD) Reports

#### Comprehensive Analytics
- Total earnings for the year
- Cumulative allowances and deductions
- Performance tracking
- Tax liability assessment

#### Report Features:
- Monthly breakdown
- Comparison with previous years
- Department-wise analysis
- Employee-specific reports
- Export capabilities

### 7. Advanced Features

#### Search and Filtering
- Employee name search
- Department filtering
- Status-based filtering
- Date range selection
- Advanced search options

#### Real-time Statistics
- Total employees count
- Gross salary summary
- Net salary summary
- Payment status distribution
- Department-wise metrics

#### Email Integration
- Automatic payslip delivery
- Bulk email functionality
- Email tracking
- Delivery confirmation

## Technical Implementation

### Frontend Components

#### Payroll.js
- Main payroll management interface
- Table view with all payroll records
- Action buttons for each record
- Filter and search functionality

#### PayrollModal.js
- Payroll generation modal
- Month/year selection
- Generation progress tracking
- User-friendly interface

#### PayrollDetails.js
- Detailed payroll view
- Salary breakdown display
- Action buttons (download, email)
- Status management

### Backend API

#### Controllers
- `payrollController.js`: Main business logic
- Payroll generation algorithms
- PDF generation
- Email functionality

#### Models
- `Payroll.js`: Data structure
- Virtual fields for calculations
- Aggregation methods
- Validation rules

#### Routes
- RESTful API endpoints
- Authentication and authorization
- Input validation
- Error handling

### Database Schema

#### Payroll Collection
```javascript
{
  employeeId: ObjectId,
  month: Number,
  year: Number,
  basicSalary: Number,
  allowances: {
    hra: Number,
    da: Number,
    ta: Number,
    medical: Number,
    other: Number
  },
  deductions: {
    pf: Number,
    esi: Number,
    tax: Number,
    lop: Number,
    other: Number
  },
  bonuses: {
    performance: Number,
    festival: Number,
    other: Number
  },
  attendance: {
    totalDays: Number,
    presentDays: Number,
    absentDays: Number,
    halfDays: Number,
    leaveDays: Number,
    workingHours: Number,
    overtime: Number
  },
  overtimePay: Number,
  lopAmount: Number,
  grossSalary: Number,
  netSalary: Number,
  status: String,
  paymentDate: Date,
  paymentMethod: String,
  transactionId: String,
  remarks: String,
  payslipGenerated: Boolean,
  payslipPath: String,
  emailSent: Boolean,
  emailSentAt: Date
}
```

## Usage Guide

### Generating Payroll

1. **Navigate to Payroll Management**
   - Access the payroll section from the main menu

2. **Select Payroll Period**
   - Choose month and year for payroll generation
   - Click "Generate Payroll" button

3. **Review Generated Payroll**
   - System displays all employee payrolls
   - Review calculations and adjustments

4. **Process Payments**
   - Update status to "Paid" for processed payments
   - Add payment details and transaction IDs

### Managing Payslips

1. **Generate Payslip**
   - Click the document icon for any payroll record
   - System generates PDF payslip
   - Download automatically starts

2. **Send via Email**
   - Click the email icon
   - System sends payslip to employee's email
   - Delivery confirmation provided

3. **View YTD Report**
   - Click the chart icon for any employee
   - View comprehensive year-to-date summary
   - Export or print reports

### Status Management

1. **Update Payment Status**
   - Use the dropdown in the Actions column
   - Select appropriate status
   - Add payment details if required

2. **Track Payment Progress**
   - Monitor pending vs paid payrolls
   - View payment statistics
   - Generate payment reports

## Configuration

### Salary Structure
- Configure allowances and deductions
- Set up tax brackets
- Define bonus structures
- Customize working hours

### Email Settings
- Configure SMTP settings
- Set up email templates
- Define sender information
- Test email functionality

### PDF Settings
- Customize payslip layout
- Add company branding
- Configure font and styling
- Set up digital signatures

## Security Features

- Role-based access control
- Audit trail for all changes
- Secure file storage
- Data encryption
- Session management

## Performance Optimization

- Pagination for large datasets
- Efficient database queries
- Caching mechanisms
- Background processing
- Optimized PDF generation

## Troubleshooting

### Common Issues

1. **Payroll Generation Fails**
   - Check employee data completeness
   - Verify attendance records
   - Ensure salary structure is configured

2. **PDF Generation Issues**
   - Check file permissions
   - Verify PDF library installation
   - Review error logs

3. **Email Delivery Problems**
   - Verify SMTP settings
   - Check email credentials
   - Review spam filters

### Support

For technical support or feature requests, please contact the development team or create an issue in the project repository. 