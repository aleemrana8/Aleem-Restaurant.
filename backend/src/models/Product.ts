import mongoose, { Schema, Document } from 'mongoose';

export interface IProductVariant {
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface IProductAddon {
  name: string;
  price: number;
  isAvailable: boolean;
  category?: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: mongoose.Types.ObjectId;
  branch?: mongoose.Types.ObjectId;
  images: string[];
  variants: IProductVariant[];
  addons: IProductAddon[];
  sizes: { name: string; price: number }[];
  spiceLevels: string[];
  tags: string[];
  isAvailable: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isDeal: boolean;
  isPublished: boolean;
  stock: number;
  preparationTime: number;
  calories?: number;
  sortOrder: number;
  rating: number;
  reviewCount: number;
  ingredients: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    images: [{ type: String }],
    variants: [{
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      isAvailable: { type: Boolean, default: true },
    }],
    addons: [{
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      isAvailable: { type: Boolean, default: true },
      category: { type: String },
    }],
    sizes: [{
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
    }],
    spiceLevels: [{ type: String }],
    tags: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    isBestSeller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isDeal: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    stock: { type: Number, default: -1 },
    preparationTime: { type: Number, default: 15 },
    calories: { type: Number },
    sortOrder: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    ingredients: [{ type: Schema.Types.ObjectId, ref: 'InventoryItem' }],
  },
  { timestamps: true }
);

productSchema.index({ category: 1, isAvailable: 1, isPublished: 1 });
productSchema.index({ branch: 1, isAvailable: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ isBestSeller: 1, isFeatured: 1, isDeal: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
