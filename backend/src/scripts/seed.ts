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
  await Admin.create({
    name: 'Aleem Admin',
    email: 'aleem811',
    password,
    role: 'super_admin',
    isActive: true,
  });
  console.log('Admin created: aleem811 / aleem811');

  // Branches
  const branch = await Branch.create({
    name: 'Aleem Restaurant - Gulberg',
    slug: 'aleem-restaurant-gulberg',
    address: 'Main Boulevard, Gulberg III, Lahore',
    city: 'Lahore',
    phone: '042-3578-1234',
    lat: 31.5204,
    lng: 74.3587,
    deliveryRadius: 12,
    deliveryFee: 100,
    minimumOrder: 400,
    taxRate: 5,
    isOpen: true,
    openTime: '10:00',
    closeTime: '02:00',
  });

  await Branch.create({
    name: 'Aleem Restaurant - DHA',
    slug: 'aleem-restaurant-dha',
    address: 'Y Block, Phase 3, DHA, Lahore',
    city: 'Lahore',
    phone: '042-3578-5678',
    lat: 31.4697,
    lng: 74.3762,
    deliveryRadius: 10,
    deliveryFee: 120,
    minimumOrder: 500,
    taxRate: 5,
    isOpen: true,
    openTime: '10:00',
    closeTime: '02:00',
  });

  // Categories
  const categories = await Category.insertMany([
    { name: 'Everyday Value', slug: 'everyday-value', description: 'Budget-friendly meals packed with flavor', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', sortOrder: 1, isActive: true },
    { name: 'Burgers', slug: 'burgers', description: 'Signature crispy chicken burgers', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', sortOrder: 2, isActive: true },
    { name: 'Fried Chicken', slug: 'fried-chicken', description: 'Hot & crispy hand-breaded chicken', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', sortOrder: 3, isActive: true },
    { name: 'Wraps & Rolls', slug: 'wraps-rolls', description: 'Freshly wrapped with premium fillings', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', sortOrder: 4, isActive: true },
    { name: 'Signature Boxes', slug: 'signature-boxes', description: 'Complete meal boxes for max satisfaction', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400', sortOrder: 5, isActive: true },
    { name: 'Family Sharing', slug: 'family-sharing', description: 'Feast together with family deals', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', sortOrder: 6, isActive: true },
    { name: 'Snacks & Sides', slug: 'snacks-sides', description: 'Fries, wings, nuggets & more', image: 'https://images.unsplash.com/photo-1630384060421-cb20asd12312?w=400', sortOrder: 7, isActive: true },
    { name: 'Beverages', slug: 'beverages', description: 'Cold drinks and refreshments', image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400', sortOrder: 8, isActive: true },
    { name: 'Desserts', slug: 'desserts', description: 'Sweet treats to end your meal', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', sortOrder: 9, isActive: true },
    { name: 'Midnight Deals', slug: 'midnight-deals', description: 'Special deals starting at 12 AM', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400', sortOrder: 10, isActive: true },
  ]);

  const [everyday, burgers, chicken, wraps, boxes, family, snacks, beverages, desserts, midnight] = categories;

  // Products - Rich data inspired by KFC Pakistan
  await Product.insertMany([
    // Everyday Value
    { name: 'Krunch Burger', slug: 'krunch-burger', description: 'Crispy chicken fillet, spicy mayo, fresh lettuce, sandwiched in a sesame seed bun', price: 310, category: everyday._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'], isAvailable: true, isPublished: true, isBestSeller: true, preparationTime: 8 },
    { name: 'Zingeratha', slug: 'zingeratha', description: 'Tender boneless strips, sliced onions, tangy imli chutney, mint mayo wrapped in soft paratha', price: 390, category: everyday._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500'], isAvailable: true, isPublished: true, preparationTime: 10 },
    { name: 'Rice & Spice', slug: 'rice-spice', description: 'Spiced buttery rice with 6 pcs Hot Shots topped with signature Vietnamese sauce', price: 390, category: everyday._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500'], isAvailable: true, isPublished: true, preparationTime: 12 },
    { name: 'Boneless Strips', slug: 'boneless-strips', description: '3 crispy chicken strips for a hassle-free boneless experience', price: 440, category: everyday._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1562967914-608f82629710?w=500'], isAvailable: true, isPublished: true, preparationTime: 8 },
    { name: 'Chicken & Chips', slug: 'chicken-chips', description: '2 pcs Hot & Crispy Fried Chicken + Fries + Dinner Roll + Vietnamese Sauce', price: 650, category: everyday._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500'], isAvailable: true, isPublished: true, isBestSeller: true, preparationTime: 10 },
    { name: 'Krunch Combo', slug: 'krunch-combo', description: '1 Krunch burger + 1 Regular fries + 1 Regular drink', price: 590, category: everyday._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500'], isAvailable: true, isPublished: true, isFeatured: true, preparationTime: 10 },

    // Burgers
    { name: 'Zinger Burger', slug: 'zinger-burger', description: 'Crispy Zinger fillet, signature mayo and lettuce sandwiched in a sesame seed bun', price: 600, category: burgers._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500'], isAvailable: true, isPublished: true, isBestSeller: true, preparationTime: 10 },
    { name: 'Mighty Zinger', slug: 'mighty-zinger', description: 'Double Zinger fillet with spicy and plain mayo, lettuce and cheese in sesame bun', price: 770, category: burgers._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500'], isAvailable: true, isPublished: true, isBestSeller: true, preparationTime: 12 },
    { name: 'Zinger Stacker', slug: 'zinger-stacker', description: 'Double krunch fillet, jalapenos, spicy mayo, lettuce, cheese with Vietnamese sauce', price: 660, category: burgers._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500'], isAvailable: true, isPublished: true, preparationTime: 12 },
    { name: 'Kentucky Burger', slug: 'kentucky-burger', description: 'Zinger fillet with beef pepperoni, crispy fried onions, cheese and smokey BBQ sauce', price: 660, category: burgers._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1550547660-d9450f859349?w=500'], isAvailable: true, isPublished: true, isFeatured: true, preparationTime: 12 },
    { name: 'Zinger Combo', slug: 'zinger-combo', description: 'Zinger burger + 1 Regular fries + 1 Regular drink', price: 910, category: burgers._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500'], isAvailable: true, isPublished: true, preparationTime: 12 },
    { name: 'Mighty Zinger Combo', slug: 'mighty-zinger-combo', description: 'Mighty Zinger + 1 Regular fries + 1 Regular drink', price: 1050, category: burgers._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500'], isAvailable: true, isPublished: true, preparationTime: 14 },

    // Fried Chicken
    { name: '1 Pc Chicken', slug: '1-pc-chicken', description: '1 piece of our signature Hot & Crispy Fried Chicken', price: 320, category: chicken._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500'], isAvailable: true, isPublished: true, preparationTime: 5 },
    { name: '3 Pcs Chicken', slug: '3-pcs-chicken', description: '3 pieces of Hot and Crispy Fried Chicken', price: 720, category: chicken._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500'], isAvailable: true, isPublished: true, isBestSeller: true, preparationTime: 8 },
    { name: 'Hot Wings Bucket', slug: 'hot-wings-bucket', description: '10 pcs of our Signature Hot & Crispy Wings, packed with flavor and heat', price: 670, category: chicken._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500'], isAvailable: true, isPublished: true, isBestSeller: true, preparationTime: 10 },
    { name: 'Buffalo Wings', slug: 'buffalo-wings', description: '8 pcs Hot Wings coated in spicy Buffalo sauce, topped with chili flakes', price: 640, category: chicken._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1608039829572-9b0e4c4a4b5c?w=500'], isAvailable: true, isPublished: true, preparationTime: 10 },

    // Wraps & Rolls
    { name: 'Twister', slug: 'twister', description: 'Tender boneless strips, black pepper mayo, diced tomatoes and lettuce wrapped in tortilla', price: 440, category: wraps._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500'], isAvailable: true, isPublished: true, preparationTime: 8 },
    { name: 'Twister Combo', slug: 'twister-combo', description: 'Twister + 1 Regular fries + 1 Regular drink', price: 710, category: wraps._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1551782450-17144efb9c50?w=500'], isAvailable: true, isPublished: true, preparationTime: 10 },

    // Signature Boxes
    { name: 'Crispy Box', slug: 'crispy-box', description: '2 pcs Hot & Crispy Chicken + Regular fries + Regular drink + Coleslaw', price: 750, category: boxes._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1562967914-608f82629710?w=500'], isAvailable: true, isPublished: true, preparationTime: 12 },
    { name: 'Wow Box', slug: 'wow-box', description: '1 Zinger + 1 pc Hot & Crispy Chicken + Regular fries + Regular drink + Coleslaw', price: 1050, category: boxes._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500'], isAvailable: true, isPublished: true, isFeatured: true, preparationTime: 14 },
    { name: 'Xtreme Duo Box', slug: 'xtreme-duo-box', description: '2 Zingers + 2 pcs Hot & Crispy Chicken + Large fries + 2 Regular drinks', price: 1560, category: boxes._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500'], isAvailable: true, isPublished: true, isBestSeller: true, preparationTime: 16 },
    { name: 'Strips Chips N Dips', slug: 'strips-chips-n-dips', description: '4 Boneless Strips, Regular Fries, 2 Dips (Smoke Show & Ranch) and a Drink', price: 750, category: boxes._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1562967914-608f82629710?w=500'], isAvailable: true, isPublished: true, preparationTime: 10 },

    // Family Sharing
    { name: 'Value Bucket', slug: 'value-bucket', description: '9 pcs of Signature Crispy Fried Chicken, hand-breaded in-house', price: 2090, category: family._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500'], isAvailable: true, isPublished: true, isDeal: true, preparationTime: 18 },
    { name: 'Family Festival 1', slug: 'family-festival-1', description: '4 Krunch burgers + 4 pcs Hot & Crispy Chicken + 2 Dinner Rolls + 1.5L drink', price: 2190, category: family._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500'], isAvailable: true, isPublished: true, isDeal: true, isFeatured: true, preparationTime: 20 },
    { name: 'Family Festival 2', slug: 'family-festival-2', description: '2 Zinger + 2 Krunch burgers + 4 pcs Chicken + 2 Dinner Rolls + 1.5L drink', price: 2390, category: family._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500'], isAvailable: true, isPublished: true, isDeal: true, preparationTime: 22 },
    { name: 'Family Festival 3', slug: 'family-festival-3', description: '4 Zinger burgers + 4 pcs Hot & Crispy Chicken + 2 Dinner rolls + 1.5L drink', price: 2590, category: family._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500'], isAvailable: true, isPublished: true, isDeal: true, isBestSeller: true, preparationTime: 25 },

    // Snacks & Sides
    { name: 'Regular Fries', slug: 'regular-fries', description: 'Crispy golden fries, the perfect side for your meal', price: 340, category: snacks._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500'], isAvailable: true, isPublished: true, preparationTime: 5 },
    { name: 'Fries Bucket with Dip', slug: 'fries-bucket-dip', description: 'Generous serving of golden crispy fries with dipping sauce', price: 470, category: snacks._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=500'], isAvailable: true, isPublished: true, preparationTime: 6 },
    { name: 'Hot Shots', slug: 'hot-shots', description: '9 pcs of hand-breaded crispy Hot Shots', price: 480, category: snacks._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1562967914-608f82629710?w=500'], isAvailable: true, isPublished: true, preparationTime: 7 },
    { name: 'Nuggets (6 Pcs)', slug: 'nuggets-6', description: '6 pieces of tender and delicious chicken nuggets', price: 580, category: snacks._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1562967914-608f82629710?w=500'], isAvailable: true, isPublished: true, preparationTime: 7 },
    { name: 'Cheesy Loaded Fries', slug: 'cheesy-loaded-fries', description: 'Crispy fries topped with hot shots, cheese sauce and spicy jalapenos', price: 650, category: snacks._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500'], isAvailable: true, isPublished: true, isFeatured: true, preparationTime: 8 },
    { name: 'Coleslaw', slug: 'coleslaw', description: 'Freshly sliced cabbage and carrots tossed in creamy mayo dressing', price: 150, category: snacks._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1607532941433-304659e8198a?w=500'], isAvailable: true, isPublished: true, preparationTime: 2 },
    { name: 'Corn on the Cob', slug: 'corn-on-the-cob', description: 'Boiled sweet corn brushed with butter', price: 290, category: snacks._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500'], isAvailable: true, isPublished: true, preparationTime: 3 },
    { name: 'Dinner Roll', slug: 'dinner-roll', description: 'Soft and fluffy, complements any meal perfectly', price: 50, category: snacks._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500'], isAvailable: true, isPublished: true, preparationTime: 1 },

    // Beverages
    { name: 'Pepsi Regular', slug: 'pepsi-regular', description: 'Classic taste of Pepsi 345ml', price: 180, category: beverages._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=500'], isAvailable: true, isPublished: true, preparationTime: 1 },
    { name: '7UP Regular', slug: '7up-regular', description: 'Crisp and refreshing 7UP 345ml', price: 180, category: beverages._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500'], isAvailable: true, isPublished: true, preparationTime: 1 },
    { name: 'Mineral Water 500ml', slug: 'mineral-water', description: 'Pure refreshing mineral water', price: 90, category: beverages._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500'], isAvailable: true, isPublished: true, preparationTime: 1 },
    { name: 'Mountain Dew', slug: 'mountain-dew', description: 'Bold and exhilarating taste 345ml', price: 180, category: beverages._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500'], isAvailable: true, isPublished: true, preparationTime: 1 },

    // Desserts
    { name: 'Chocolate Lava Cake', slug: 'chocolate-lava-cake', description: 'Warm chocolate cake with molten center, served with vanilla ice cream', price: 450, category: desserts._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500'], isAvailable: true, isPublished: true, isFeatured: true, preparationTime: 8 },
    { name: 'Brownie Sundae', slug: 'brownie-sundae', description: 'Rich chocolate brownie topped with ice cream and chocolate sauce', price: 380, category: desserts._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500'], isAvailable: true, isPublished: true, preparationTime: 5 },
    { name: 'Cookie Box (6 Pcs)', slug: 'cookie-box', description: '6 freshly baked chocolate chip cookies', price: 320, category: desserts._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500'], isAvailable: true, isPublished: true, preparationTime: 3 },

    // Midnight Deals
    { name: 'Midnight Deal 1', slug: 'midnight-deal-1', description: '1 Zinger burger + 1 Regular drink (available after 12 AM)', price: 520, category: midnight._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500'], isAvailable: true, isPublished: true, isDeal: true, preparationTime: 10 },
    { name: 'Midnight Deal 2', slug: 'midnight-deal-2', description: '2 Krunch burgers + 2 Regular drinks (available after 12 AM)', price: 610, category: midnight._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'], isAvailable: true, isPublished: true, isDeal: true, preparationTime: 12 },
    { name: 'Midnight Deal 3', slug: 'midnight-deal-3', description: 'Mighty Zinger + Regular drink (available after 12 AM)', price: 710, category: midnight._id, branch: branch._id, images: ['https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500'], isAvailable: true, isPublished: true, isDeal: true, preparationTime: 12 },
  ]);

  console.log('Seeded: 1 admin, 2 branches, 10 categories, 40+ products');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
