const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  company: {
    name: { type: String, required: true, default: 'Payroll Management System' },
    address: { type: String, default: '123 Business Street, City, State 12345' },
    phone: { type: String, default: '+1-555-123-4567' },
    email: { type: String, required: true, default: 'admin@company.com' },
    website: { type: String, default: 'www.company.com' },
    logo: { type: String, default: null }
  },
  payroll: {
    defaultWorkingHours: { type: Number, default: 8, min: 1, max: 24 },
    overtimeRate: { type: Number, default: 1.5, min: 1, max: 3 },
    pfPercentage: { type: Number, default: 12, min: 0, max: 100 },
    esiPercentage: { type: Number, default: 1.75, min: 0, max: 100 },
    taxSlabs: [{
      min: { type: Number, required: true },
      max: { type: Number, default: null },
      rate: { type: Number, required: true, min: 0, max: 100 }
    }]
  },
  attendance: {
    workStartTime: { type: String, default: '09:00' },
    workEndTime: { type: String, default: '18:00' },
    lateThreshold: { type: Number, default: 15, min: 0, max: 120 }, // minutes
    halfDayThreshold: { type: Number, default: 4, min: 1, max: 8 }, // hours
    holidays: [{
      date: { type: Date, required: true },
      name: { type: String, required: true }
    }]
  },
  email: {
    smtpHost: { type: String, default: 'smtp.gmail.com' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' },
    fromEmail: { type: String, default: '' },
    fromName: { type: String, default: 'Payroll System' }
  },
  notifications: {
    payslipEmail: { type: Boolean, default: true },
    attendanceReminder: { type: Boolean, default: true },
    expenseApproval: { type: Boolean, default: true },
    payrollGeneration: { type: Boolean, default: true }
  },
  customization: {
    currency: { type: String, default: 'INR', enum: ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'JPY'] },
    dateFormat: { type: String, default: 'DD/MM/YYYY', enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'] },
    timeFormat: { type: String, default: '24', enum: ['12', '24'] },
    theme: { type: String, default: 'light', enum: ['light', 'dark'] }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

// Static method to get or create default settings
settingsSchema.statics.getOrCreateDefault = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    settings = new this({
      company: {
        name: 'Payroll Management System',
        address: '123 Business Street, City, State 12345',
        phone: '+1-555-123-4567',
        email: 'admin@company.com',
        website: 'www.company.com',
        logo: null
      },
      payroll: {
        defaultWorkingHours: 8,
        overtimeRate: 1.5,
        pfPercentage: 12,
        esiPercentage: 1.75,
        taxSlabs: [
          { min: 0, max: 250000, rate: 0 },
          { min: 250001, max: 500000, rate: 5 },
          { min: 500001, max: 1000000, rate: 20 },
          { min: 1000001, max: null, rate: 30 }
        ]
      },
      attendance: {
        workStartTime: '09:00',
        workEndTime: '18:00',
        lateThreshold: 15,
        halfDayThreshold: 4,
        holidays: [
          { date: new Date('2024-01-26'), name: 'Republic Day' },
          { date: new Date('2024-08-15'), name: 'Independence Day' },
          { date: new Date('2024-10-02'), name: 'Gandhi Jayanti' }
        ]
      },
      email: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: '',
        smtpPass: '',
        fromEmail: '',
        fromName: 'Payroll System'
      },
      notifications: {
        payslipEmail: true,
        attendanceReminder: true,
        expenseApproval: true,
        payrollGeneration: true
      },
      customization: {
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24',
        theme: 'light'
      }
    });
    await settings.save();
  }
  
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema); 