import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  lat: number;
  lng: number;
  deliveryRadius: number;
  deliveryFee: number;
  minimumOrder: number;
  taxRate: number;
  isOpen: boolean;
  isActive: boolean;
  openTime: string;
  closeTime: string;
  estimatedDeliveryTime: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    deliveryRadius: { type: Number, default: 10 },
    deliveryFee: { type: Number, default: 150 },
    minimumOrder: { type: Number, default: 500 },
    taxRate: { type: Number, default: 5 },
    isOpen: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    openTime: { type: String, default: '10:00' },
    closeTime: { type: String, default: '02:00' },
    estimatedDeliveryTime: { type: Number, default: 35 },
    image: { type: String },
  },
  { timestamps: true }
);

branchSchema.index({ city: 1, isActive: 1 });

export const Branch = mongoose.model<IBranch>('Branch', branchSchema);
