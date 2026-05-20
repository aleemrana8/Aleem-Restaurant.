import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'combo';
  value: number;
  image?: string;
  products: mongoose.Types.ObjectId[];
  categories: mongoose.Types.ObjectId[];
  branches: mongoose.Types.ObjectId[];
  minimumOrder?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['percentage', 'fixed', 'bogo', 'combo'], required: true },
    value: { type: Number, required: true },
    image: { type: String },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    branches: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
    minimumOrder: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: -1 },
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

offerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

export const Offer = mongoose.model<IOffer>('Offer', offerSchema);
