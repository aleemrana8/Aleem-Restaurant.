import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseOrderItem {
  inventoryItem: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQuantity: number;
}

export interface IPurchaseOrder extends Document {
  orderNumber: string;
  supplier: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  items: IPurchaseOrderItem[];
  status: 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled';
  totalAmount: number;
  expectedDelivery?: Date;
  receivedAt?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    items: [{
      inventoryItem: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
      quantity: { type: Number, required: true },
      unitCost: { type: Number, required: true },
      totalCost: { type: Number, required: true },
      receivedQuantity: { type: Number, default: 0 },
    }],
    status: { type: String, enum: ['draft', 'ordered', 'partially_received', 'received', 'cancelled'], default: 'draft' },
    totalAmount: { type: Number, required: true },
    expectedDelivery: { type: Date },
    receivedAt: { type: Date },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  },
  { timestamps: true }
);

purchaseOrderSchema.index({ supplier: 1, status: 1 });
purchaseOrderSchema.index({ branch: 1, createdAt: -1 });

export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);
