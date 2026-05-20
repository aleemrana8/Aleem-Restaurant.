import mongoose, { Schema, Document } from 'mongoose';

export interface ICmsPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  author: mongoose.Types.ObjectId;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const cmsPostSchema = new Schema<ICmsPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    image: { type: String },
    category: { type: String, required: true },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    author: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cmsPostSchema.index({ isPublished: 1, publishedAt: -1 });
cmsPostSchema.index({ category: 1, isPublished: 1 });

export const CmsPost = mongoose.model<ICmsPost>('CmsPost', cmsPostSchema);
