const mongoose = require('mongoose');

// Base Asset Schema
const assetSchema = new mongoose.Schema({
  assetCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  company: { type: String },
  assignedTo: { type: String },
  serialNumber: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['Functional', 'Not Functional', 'Need Replacement'], default: 'Functional' },
  lifecycleState: { type: String, enum: ['Procured', 'Active', 'In Repair', 'Retired'], default: 'Procured' },
  warrantyStart: { type: Date },
  warrantyEnd: { type: Date },
  qrData: { type: String },
  history: [{
    date: { type: Date, default: Date.now },
    action: { type: String, required: true },
    user: { type: String },
    note: { type: String }
  }],
  checkOutHistory: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkOutDate: { type: Date, default: Date.now },
    checkInDate: { type: Date }
  }]
}, { discriminatorKey: 'type', timestamps: true });

const Asset = mongoose.model('Asset', assetSchema);

// Discriminators for specific types
const DesktopAsset = Asset.discriminator('Desktop', new mongoose.Schema({
  department: String,
  username: String,
  employeeCode: String,
  hostname: String,
  storage: String,
  ram: String,
  processor: String
}));

const PrinterAsset = Asset.discriminator('Printer', new mongoose.Schema({
  department: String,
  ipAddress: String
}));

const RouterAsset = Asset.discriminator('Router', new mongoose.Schema({
  lastPingStatus: { type: String, enum: ['Online', 'Offline'], default: 'Offline' },
  lastPingTime: { type: Date }
}));

const IoTDeviceAsset = Asset.discriminator('IoT Device', new mongoose.Schema({
  healthStatus: { type: String, default: 'Unknown' },
  lastHealthCheck: { type: Date }
}));

// License Schema mapping to assets
const licenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  assignedToAsset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }
}, { timestamps: true });

const License = mongoose.model('License', licenseSchema);

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String }, // For admin
  companyId: { type: String }, // For standard users
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  permissions: {
    canEdit: { type: Boolean, default: false },
    canView: { type: Boolean, default: true }
  }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

// Company Schema
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String },
  contactEmail: { type: String },
  logo: { type: String } // Base64 encoded image
}, { timestamps: true });
const Company = mongoose.model('Company', companySchema);

// Product (Asset Category) Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "Desktop"
  icon: { type: String, default: 'Box' } // e.g. "Monitor"
}, { timestamps: true });
const Product = mongoose.model('Product', productSchema);

// Ticket Schema
const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin assignee
  history: [{
    date: { type: Date, default: Date.now },
    action: { type: String, required: true },
    user: { type: String }, // User who performed the action
    note: { type: String }
  }]
}, { timestamps: true });
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = {
  Asset,
  DesktopAsset,
  PrinterAsset,
  RouterAsset,
  IoTDeviceAsset,
  License,
  User,
  Company,
  Product,
  Ticket
};
