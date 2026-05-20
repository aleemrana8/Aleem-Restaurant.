import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { Admin } from '../models/Admin';
import { Branch } from '../models/Branch';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

async function seed() {
  await connectDB();
  console.log('Seeding database...');

  // Clear
  await Admin.deleteMany({});
  await Branch.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});

  // Admin
  const password = await bcrypt.hash('aleem811', 12);
  const admin = await Admin.create({
    name: 'Aleem Admin',
    email: 'aleem811',
    password,
    role: 'super_admin',
    isActive: true,
  });
  console.log('Admin created: aleem811 / aleem811');

  // Branch
  const branch = await Branch.create({
    name: 'Aleem Restaurant Main',
    slug: 'aleem-restaurant-main',
    address: 'Main Boulevard, Lahore',
    city: 'Lahore',
    phone: '0300-1234567',
    lat: 31.5204,
    lng: 74.3587,
    deliveryRadius: 10,
    deliveryFee: 150,
    minimumOrder: 500,
    taxRate: 5,
  });

  // Categories
  const categories = await Category.insertMany([
    { name: 'Burgers', slug: 'burgers', sortOrder: 1, isActive: true },
    { name: 'Pizza', slug: 'pizza', sortOrder: 2, isActive: true },
    { name: 'Fried Chicken', slug: 'fried-chicken', sortOrder: 3, isActive: true },
    { name: 'Wraps & Rolls', slug: 'wraps-rolls', sortOrder: 4, isActive: true },
    { name: 'Beverages', slug: 'beverages', sortOrder: 5, isActive: true },
    { name: 'Desserts', slug: 'desserts', sortOrder: 6, isActive: true },
    { name: 'Deals', slug: 'deals', sortOrder: 7, isActive: true },
  ]);

  // Products
  await Product.insertMany([
    { name: 'Classic Zinger Burger', slug: 'classic-zinger-burger', description: 'Crispy chicken fillet with spicy mayo, lettuce and cheese', price: 650, category: categories[0]._id, branch: branch._id, isAvailable: true, isPublished: true, isBestSeller: true, preparationTime: 12, sizes: [{ name: 'Regular', price: 650 }, { name: 'Large', price: 850 }], spiceLevels: ['mild', 'medium', 'hot'] },
    { name: 'Double Crunch Burger', slug: 'double-crunch-burger', description: 'Two crispy chicken patties with special sauce', price: 850, category: categories[0]._id, branch: branch._id, isAvailable: true, isPublished: true, preparationTime: 15 },
    { name: 'Cheese Lovers Pizza', slug: 'cheese-lovers-pizza', description: 'Loaded with mozzarella, cheddar and parmesan', price: 1200, category: categories[1]._id, branch: branch._id, isAvailable: true, isPublished: true, isFeatured: true, preparationTime: 20, sizes: [{ name: 'Medium', price: 1200 }, { name: 'Large', price: 1600 }] },
    { name: 'Pepperoni Supreme', slug: 'pepperoni-supreme', description: 'Classic pepperoni with bell peppers and olives', price: 1400, category: categories[1]._id, branch: branch._id, isAvailable: true, isPublished: true, preparationTime: 20 },
    { name: 'Crispy Fried Chicken (3pc)', slug: 'crispy-fried-chicken-3pc', description: 'Three pieces of golden crispy fried chicken', price: 550, category: categories[2]._id, branch: branch._id, isAvailable: true, isPublished: true, isBestSeller: true, preparationTime: 10 },
    { name: 'Hot Wings (6pc)', slug: 'hot-wings-6pc', description: 'Spicy chicken wings with dipping sauce', price: 450, category: categories[2]._id, branch: branch._id, isAvailable: true, isPublished: true, preparationTime: 10 },
    { name: 'Chicken Shawarma', slug: 'chicken-shawarma', description: 'Grilled chicken wrapped in fresh pita with garlic sauce', price: 350, category: categories[3]._id, branch: branch._id, isAvailable: true, isPublished: true, preparationTime: 8 },
    { name: 'Pepsi 500ml', slug: 'pepsi-500ml', description: 'Chilled Pepsi', price: 100, category: categories[4]._id, branch: branch._id, isAvailable: true, isPublished: true, preparationTime: 1 },
    { name: 'Chocolate Brownie', slug: 'chocolate-brownie', description: 'Rich chocolate brownie with vanilla ice cream', price: 350, category: categories[5]._id, branch: branch._id, isAvailable: true, isPublished: true, preparationTime: 5 },
    { name: 'Family Deal', slug: 'family-deal', description: '4 Zingers + 1 Large Pizza + 4 Drinks + Fries', price: 3500, comparePrice: 4200, category: categories[6]._id, branch: branch._id, isAvailable: true, isPublished: true, isDeal: true, isFeatured: true, preparationTime: 25 },
  ]);

  console.log(`Seeded: 1 admin, 1 branch, ${categories.length} categories, 10 products`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
