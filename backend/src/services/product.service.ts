import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { AppError } from '../middleware/AppError';

export class ProductService {
  static async getProducts(filters: {
    category?: string;
    branch?: string;
    search?: string;
    isAvailable?: boolean;
    isBestSeller?: boolean;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { category, branch, search, isAvailable, isBestSeller, isFeatured, page = 1, limit = 20 } = filters;
    const query: any = {};

    if (category) query.category = category;
    if (branch) query.branch = branch;
    if (isAvailable !== undefined) query.isAvailable = isAvailable;
    if (isBestSeller) query.isBestSeller = true;
    if (isFeatured) query.isFeatured = true;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query).populate('category', 'name slug').sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    return { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async getProductById(id: string) {
    const product = await Product.findById(id).populate('category', 'name slug').populate('ingredients');
    if (!product) throw new AppError('Product not found.', 404);
    return product;
  }

  static async createProduct(data: any) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await Product.findOne({ slug });
    if (existing) data.slug = `${slug}-${Date.now()}`;
    else data.slug = slug;

    return Product.create(data);
  }

  static async updateProduct(id: string, data: any) {
    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!product) throw new AppError('Product not found.', 404);
    return product;
  }

  static async deleteProduct(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new AppError('Product not found.', 404);
    return product;
  }

  static async toggleAvailability(id: string) {
    const product = await Product.findById(id);
    if (!product) throw new AppError('Product not found.', 404);
    product.isAvailable = !product.isAvailable;
    await product.save();
    return product;
  }
}

export class CategoryService {
  static async getCategories(filters: { isActive?: boolean; branch?: string }) {
    const query: any = {};
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.branch) query.branch = filters.branch;
    return Category.find(query).sort({ sortOrder: 1 });
  }

  static async createCategory(data: any) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    data.slug = slug;
    return Category.create(data);
  }

  static async updateCategory(id: string, data: any) {
    const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!category) throw new AppError('Category not found.', 404);
    return category;
  }

  static async deleteCategory(id: string) {
    const productsCount = await Product.countDocuments({ category: id });
    if (productsCount > 0) throw new AppError('Cannot delete category with products. Reassign products first.', 400);
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new AppError('Category not found.', 404);
    return category;
  }
}
