import mongoose, { Schema, Document } from 'mongoose';

export interface ILoyaltyTransaction extends Document {
  customer: mongoose.Types.ObjectId;
  type: 'earn' | 'redeem' | 'expire' | 'bonus';
  points: number;
  balance: number;
  order?: mongoose.Types.ObjectId;
  description: string;
  createdAt: Date;
}

const loyaltyTransactionSchema = new Schema<ILoyaltyTransaction>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    type: { type: String, enum: ['earn', 'redeem', 'expire', 'bonus'], required: true },
    points: { type: Number, required: true },
    balance: { type: Number, required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

loyaltyTransactionSchema.index({ customer: 1, createdAt: -1 });

export const LoyaltyTransaction = mongoose.model<ILoyaltyTransaction>('LoyaltyTransaction', loyaltyTransactionSchema);
