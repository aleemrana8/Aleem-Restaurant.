import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  isBlocked: boolean;
  isActive: boolean;
  addresses: {
    label: string;
    fullAddress: string;
    area?: string;
    city: string;
    lat?: number;
    lng?: number;
    isDefault: boolean;
  }[];
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: Date;
  notes?: string;
  blockedReason?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    addresses: [{
      label: { type: String, default: 'Home' },
      fullAddress: { type: String, required: true },
      area: { type: String },
      city: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number },
      isDefault: { type: Boolean, default: false },
    }],
    loyaltyPoints: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderAt: { type: Date },
    notes: { type: String },
    blockedReason: { type: String },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

customerSchema.index({ phone: 1 });
customerSchema.index({ isBlocked: 1, isActive: 1 });
customerSchema.index({ totalOrders: -1 });

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
