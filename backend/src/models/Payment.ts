import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  method: string;
  amount: number;
  currency: string;
  status: string;
  transactionId?: string;
  gatewayResponse?: Record<string, any>;
  paidAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    method: { type: String, enum: ['cod', 'card', 'jazzcash', 'easypaisa', 'wallet'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'PKR' },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: { type: String },
    gatewayResponse: { type: Schema.Types.Mixed },
    paidAt: { type: Date },
    failedAt: { type: Date },
    refundedAt: { type: Date },
    refundAmount: { type: Number },
  },
  { timestamps: true }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ customer: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
