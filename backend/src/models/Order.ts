import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  productImage?: string;
  quantity: number;
  size?: string;
  variant?: string;
  addons: string[];
  spiceLevel?: string;
  specialInstructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  items: IOrderItem[];
  orderType: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  deliveryAddress?: string;
  rider?: mongoose.Types.ObjectId;
  riderAssignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  estimatedDelivery?: Date;
  scheduledAt?: Date;
  notes?: string;
  adminNotes?: string;
  idempotencyKey?: string;
  preparationStartedAt?: Date;
  preparationCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    items: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true },
      productImage: { type: String },
      quantity: { type: Number, required: true, min: 1 },
      size: { type: String },
      variant: { type: String },
      addons: [{ type: String }],
      spiceLevel: { type: String },
      specialInstructions: { type: String },
      unitPrice: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
    }],
    orderType: { type: String, enum: ['delivery', 'pickup', 'dine_in'], required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'rider_assigned', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cod', 'card', 'jazzcash', 'easypaisa', 'wallet'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    total: { type: Number, required: true },
    deliveryAddress: { type: String },
    rider: { type: Schema.Types.ObjectId, ref: 'Admin' },
    riderAssignedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    estimatedDelivery: { type: Date },
    scheduledAt: { type: Date },
    notes: { type: String },
    adminNotes: { type: String },
    idempotencyKey: { type: String, unique: true, sparse: true },
    preparationStartedAt: { type: Date },
    preparationCompletedAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ branch: 1, status: 1, createdAt: -1 });
orderSchema.index({ rider: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
