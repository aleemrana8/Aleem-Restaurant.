import mongoose, { Schema, Document } from 'mongoose';

export interface ILoyaltyAccount extends Document {
  customer: mongoose.Types.ObjectId;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalEarned: number;
  totalRedeemed: number;
  createdAt: Date;
  updatedAt: Date;
}

const loyaltyAccountSchema = new Schema<ILoyaltyAccount>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, unique: true },
    points: { type: Number, default: 0 },
    tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
    totalEarned: { type: Number, default: 0 },
    totalRedeemed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LoyaltyAccount = mongoose.model<ILoyaltyAccount>('LoyaltyAccount', loyaltyAccountSchema);
