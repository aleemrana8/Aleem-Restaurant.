import mongoose, { Schema, Document } from 'mongoose';

export interface IIngredientMapping extends Document {
  product: mongoose.Types.ObjectId;
  inventoryItem: mongoose.Types.ObjectId;
  quantityPerUnit: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

const ingredientMappingSchema = new Schema<IIngredientMapping>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    inventoryItem: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    quantityPerUnit: { type: Number, required: true },
    unit: { type: String, required: true },
  },
  { timestamps: true }
);

ingredientMappingSchema.index({ product: 1 });
ingredientMappingSchema.index({ inventoryItem: 1 });

export const IngredientMapping = mongoose.model<IIngredientMapping>('IngredientMapping', ingredientMappingSchema);
