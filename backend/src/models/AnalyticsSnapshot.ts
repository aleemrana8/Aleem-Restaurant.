import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsSnapshot extends Document {
  branch?: mongoose.Types.ObjectId;
  date: Date;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    newCustomers: number;
    cancelledOrders: number;
    avgDeliveryTime: number;
    avgPreparationTime: number;
    topProducts: { product: mongoose.Types.ObjectId; name: string; quantity: number; revenue: number }[];
    ordersByType: { delivery: number; pickup: number; dine_in: number };
    ordersByStatus: Record<string, number>;
    paymentMethods: Record<string, number>;
    peakHours: { hour: number; orders: number }[];
  };
  createdAt: Date;
}

const analyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>(
  {
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    date: { type: Date, required: true },
    period: { type: String, enum: ['hourly', 'daily', 'weekly', 'monthly'], required: true },
    metrics: {
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      avgOrderValue: { type: Number, default: 0 },
      newCustomers: { type: Number, default: 0 },
      cancelledOrders: { type: Number, default: 0 },
      avgDeliveryTime: { type: Number, default: 0 },
      avgPreparationTime: { type: Number, default: 0 },
      topProducts: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        quantity: { type: Number },
        revenue: { type: Number },
      }],
      ordersByType: {
        delivery: { type: Number, default: 0 },
        pickup: { type: Number, default: 0 },
        dine_in: { type: Number, default: 0 },
      },
      ordersByStatus: { type: Schema.Types.Mixed },
      paymentMethods: { type: Schema.Types.Mixed },
      peakHours: [{
        hour: { type: Number },
        orders: { type: Number },
      }],
    },
  },
  { timestamps: true }
);

analyticsSnapshotSchema.index({ branch: 1, date: -1, period: 1 });
analyticsSnapshotSchema.index({ date: -1, period: 1 });

export const AnalyticsSnapshot = mongoose.model<IAnalyticsSnapshot>('AnalyticsSnapshot', analyticsSnapshotSchema);
