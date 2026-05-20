import mongoose, { Schema, Document } from 'mongoose';

export interface ICmsBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: 'hero' | 'sidebar' | 'popup' | 'footer';
  sortOrder: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  branch?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cmsBannerSchema = new Schema<ICmsBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    link: { type: String },
    position: { type: String, enum: ['hero', 'sidebar', 'popup', 'footer'], default: 'hero' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
  },
  { timestamps: true }
);

cmsBannerSchema.index({ position: 1, isActive: 1, sortOrder: 1 });

export const CmsBanner = mongoose.model<ICmsBanner>('CmsBanner', cmsBannerSchema);
