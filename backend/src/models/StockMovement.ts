import mongoose, { Schema, Document } from 'mongoose';

export interface IStockMovement extends Document {
  inventoryItem: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  costPerUnit?: number;
  totalCost?: number;
  reason?: string;
  reference?: string;
  referenceModel?: string;
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>(
  {
    inventoryItem: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    type: { type: String, enum: ['purchase', 'consumption', 'adjustment', 'waste', 'transfer'], required: true },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    costPerUnit: { type: Number },
    totalCost: { type: Number },
    reason: { type: String },
    reference: { type: Schema.Types.ObjectId },
    referenceModel: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  },
  { timestamps: true }
);

stockMovementSchema.index({ inventoryItem: 1, createdAt: -1 });
stockMovementSchema.index({ branch: 1, type: 1, createdAt: -1 });
stockMovementSchema.index({ performedBy: 1 });

export const StockMovement = mongoose.model<IStockMovement>('StockMovement', stockMovementSchema);
