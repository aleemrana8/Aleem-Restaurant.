import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  categories: string[];
  paymentTerms?: string;
  rating: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    categories: [{ type: String }],
    paymentTerms: { type: String },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

supplierSchema.index({ isActive: 1 });

export const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);
