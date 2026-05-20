import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: string;
  permissions: string[];
  branch?: mongoose.Types.ObjectId;
  isActive: boolean;
  lastLogin?: Date;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, required: true, enum: ['super_admin', 'admin', 'manager', 'kitchen_staff', 'rider', 'cashier'], default: 'admin' },
    permissions: [{ type: String }],
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

adminSchema.index({ role: 1, isActive: 1 });
adminSchema.index({ branch: 1 });

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema);
