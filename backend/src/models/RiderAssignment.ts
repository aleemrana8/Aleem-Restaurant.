import mongoose, { Schema, Document } from 'mongoose';

export interface IRiderAssignment extends Document {
  order: mongoose.Types.ObjectId;
  rider: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  status: 'assigned' | 'accepted' | 'rejected' | 'picked_up' | 'delivered' | 'cancelled';
  assignedAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  rejectionReason?: string;
  distanceKm?: number;
  earnings?: number;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const riderAssignmentSchema = new Schema<IRiderAssignment>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rider: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    status: { type: String, enum: ['assigned', 'accepted', 'rejected', 'picked_up', 'delivered', 'cancelled'], default: 'assigned' },
    assignedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    rejectionReason: { type: String },
    distanceKm: { type: Number },
    earnings: { type: Number },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
  },
  { timestamps: true }
);

riderAssignmentSchema.index({ rider: 1, status: 1, createdAt: -1 });
riderAssignmentSchema.index({ order: 1 });
riderAssignmentSchema.index({ branch: 1, createdAt: -1 });

export const RiderAssignment = mongoose.model<IRiderAssignment>('RiderAssignment', riderAssignmentSchema);
