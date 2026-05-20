import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderStatusLog extends Document {
  order: mongoose.Types.ObjectId;
  fromStatus: string;
  toStatus: string;
  changedBy?: mongoose.Types.ObjectId;
  changedByRole?: string;
  note?: string;
  createdAt: Date;
}

const orderStatusLogSchema = new Schema<IOrderStatusLog>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    fromStatus: { type: String, required: true },
    toStatus: { type: String, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    changedByRole: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

orderStatusLogSchema.index({ order: 1, createdAt: 1 });

export const OrderStatusLog = mongoose.model<IOrderStatusLog>('OrderStatusLog', orderStatusLogSchema);
