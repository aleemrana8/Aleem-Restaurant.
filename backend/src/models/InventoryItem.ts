import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  costPerUnit: number;
  branch: mongoose.Types.ObjectId;
  supplier?: mongoose.Types.ObjectId;
  lastRestocked?: Date;
  expiryDate?: Date;
  isPerishable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    unit: { type: String, required: true, enum: ['kg', 'g', 'l', 'ml', 'pcs', 'dozen', 'box', 'pack'] },
    currentStock: { type: Number, required: true, default: 0 },
    minimumStock: { type: Number, required: true, default: 10 },
    maximumStock: { type: Number, default: 1000 },
    costPerUnit: { type: Number, required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    lastRestocked: { type: Date },
    expiryDate: { type: Date },
    isPerishable: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

inventoryItemSchema.index({ branch: 1, isActive: 1 });
inventoryItemSchema.index({ currentStock: 1, minimumStock: 1 });

export const InventoryItem = mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
