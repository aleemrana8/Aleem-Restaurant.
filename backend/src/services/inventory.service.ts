import { InventoryItem } from '../models/InventoryItem';
import { StockMovement } from '../models/StockMovement';
import { AppError } from '../middleware/AppError';

export class InventoryService {
  static async getItems(filters: { branch?: string; category?: string; lowStock?: boolean; search?: string; page?: number; limit?: number }) {
    const { branch, category, lowStock, search, page = 1, limit = 20 } = filters;
    const query: any = { isActive: true };

    if (branch) query.branch = branch;
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (lowStock) query.$expr = { $lte: ['$currentStock', '$minimumStock'] };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      InventoryItem.find(query).populate('branch', 'name').populate('supplier', 'name').sort({ name: 1 }).skip(skip).limit(limit).lean(),
      InventoryItem.countDocuments(query),
    ]);

    return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async getItemById(id: string) {
    const item = await InventoryItem.findById(id).populate('branch', 'name').populate('supplier', 'name');
    if (!item) throw new AppError('Inventory item not found.', 404);
    return item;
  }

  static async createItem(data: any) {
    return InventoryItem.create(data);
  }

  static async updateItem(id: string, data: any) {
    const item = await InventoryItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!item) throw new AppError('Inventory item not found.', 404);
    return item;
  }

  static async adjustStock(itemId: string, type: string, quantity: number, reason: string, userId: string) {
    const item = await InventoryItem.findById(itemId);
    if (!item) throw new AppError('Inventory item not found.', 404);

    const previousStock = item.currentStock;
    let newStock: number;

    if (type === 'purchase') {
      newStock = previousStock + quantity;
      item.lastRestocked = new Date();
    } else if (type === 'consumption' || type === 'waste') {
      newStock = previousStock - quantity;
      if (newStock < 0) throw new AppError('Insufficient stock.', 400);
    } else if (type === 'adjustment') {
      newStock = quantity; // absolute set
    } else {
      throw new AppError('Invalid movement type.', 400);
    }

    item.currentStock = newStock;
    await item.save();

    await StockMovement.create({
      inventoryItem: item._id,
      branch: item.branch,
      type,
      quantity,
      previousStock,
      newStock,
      costPerUnit: item.costPerUnit,
      totalCost: item.costPerUnit * quantity,
      reason,
      performedBy: userId,
    });

    return item;
  }

  static async getMovements(itemId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [movements, total] = await Promise.all([
      StockMovement.find({ inventoryItem: itemId }).populate('performedBy', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      StockMovement.countDocuments({ inventoryItem: itemId }),
    ]);
    return { movements, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async getLowStockAlerts(branchId?: string) {
    const query: any = { isActive: true, $expr: { $lte: ['$currentStock', '$minimumStock'] } };
    if (branchId) query.branch = branchId;
    return InventoryItem.find(query).populate('branch', 'name').sort({ currentStock: 1 });
  }
}
