import mongoose, { Schema, Document } from 'mongoose';

export interface IAiRecommendationLog extends Document {
  type: 'combo' | 'upsell' | 'personalized' | 'popular_pair' | 'forecast';
  input: Record<string, any>;
  output: Record<string, any>;
  model?: string;
  latencyMs?: number;
  branch?: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  accepted?: boolean;
  createdAt: Date;
}

const aiRecommendationLogSchema = new Schema<IAiRecommendationLog>(
  {
    type: { type: String, enum: ['combo', 'upsell', 'personalized', 'popular_pair', 'forecast'], required: true },
    input: { type: Schema.Types.Mixed, required: true },
    output: { type: Schema.Types.Mixed, required: true },
    model: { type: String },
    latencyMs: { type: Number },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    accepted: { type: Boolean },
  },
  { timestamps: true }
);

aiRecommendationLogSchema.index({ type: 1, createdAt: -1 });
aiRecommendationLogSchema.index({ customer: 1, type: 1 });

export const AiRecommendationLog = mongoose.model<IAiRecommendationLog>('AiRecommendationLog', aiRecommendationLogSchema);
