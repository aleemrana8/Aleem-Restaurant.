import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ProductService, CategoryService } from '../services/product.service';
import { asyncHandler } from '../middleware/asyncHandler';

export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = await ProductService.getProducts({
    category: req.query.category as string,
    branch: req.query.branch as string,
    search: req.query.search as string,
    isAvailable: req.query.isAvailable === 'true' ? true : req.query.isAvailable === 'false' ? false : undefined,
    isBestSeller: req.query.isBestSeller === 'true',
    isFeatured: req.query.isFeatured === 'true',
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  });
  res.json({ success: true, ...data });
});

export const getProductById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await ProductService.getProductById(req.params.id);
  res.json({ success: true, data: product });
});

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await ProductService.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await ProductService.updateProduct(req.params.id, req.body);
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  await ProductService.deleteProduct(req.params.id);
  res.json({ success: true, message: 'Product deleted.' });
});

export const toggleAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await ProductService.toggleAvailability(req.params.id);
  res.json({ success: true, data: product });
});

// Categories
export const getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const categories = await CategoryService.getCategories({
    isActive: req.query.isActive === 'true' ? true : undefined,
    branch: req.query.branch as string,
  });
  res.json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await CategoryService.createCategory(req.body);
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await CategoryService.updateCategory(req.params.id, req.body);
  res.json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  await CategoryService.deleteCategory(req.params.id);
  res.json({ success: true, message: 'Category deleted.' });
});
