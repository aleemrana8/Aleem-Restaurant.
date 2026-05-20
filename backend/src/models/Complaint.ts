import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
  customer: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  branch?: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: mongoose.Types.ObjectId;
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['food_quality', 'delivery', 'service', 'payment', 'app', 'other'], required: true },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Admin' },
    resolution: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

complaintSchema.index({ customer: 1, createdAt: -1 });
complaintSchema.index({ status: 1, priority: -1 });
complaintSchema.index({ assignedTo: 1, status: 1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema);
