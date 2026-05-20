import mongoose, { Schema, Document } from 'mongoose';

export interface IKitchenQueue extends Document {
  order: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    variant?: string;
    size?: string;
    addons: string[];
    spiceLevel?: string;
    specialInstructions?: string;
    status: string;
    startedAt?: Date;
    completedAt?: Date;
  }[];
  priority: number;
  status: string;
  assignedTo?: mongoose.Types.ObjectId;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletion?: Date;
  delayReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const kitchenQueueSchema = new Schema<IKitchenQueue>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    items: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      variant: { type: String },
      size: { type: String },
      addons: [{ type: String }],
      spiceLevel: { type: String },
      specialInstructions: { type: String },
      status: { type: String, enum: ['queued', 'in_progress', 'completed'], default: 'queued' },
      startedAt: { type: Date },
      completedAt: { type: Date },
    }],
    priority: { type: Number, default: 0 },
    status: { type: String, enum: ['queued', 'in_progress', 'completed', 'delayed'], default: 'queued' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Admin' },
    startedAt: { type: Date },
    completedAt: { type: Date },
    estimatedCompletion: { type: Date },
    delayReason: { type: String },
  },
  { timestamps: true }
);

kitchenQueueSchema.index({ branch: 1, status: 1, priority: -1, createdAt: 1 });
kitchenQueueSchema.index({ order: 1 });
kitchenQueueSchema.index({ assignedTo: 1, status: 1 });

export const KitchenQueue = mongoose.model<IKitchenQueue>('KitchenQueue', kitchenQueueSchema);
