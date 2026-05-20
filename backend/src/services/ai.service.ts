import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { AiRecommendationLog } from '../models/AiRecommendationLog';

/**
 * AI Service - Uses data-driven logic for recommendations.
 * Designed with provider interfaces for future OpenAI/other LLM integration.
 */
export class AiService {
  /**
   * Generate product recommendations based on order history patterns
   */
  static async getRecommendations(type: 'combo' | 'upsell' | 'popular_pair', branchId?: string, customerId?: string) {
    const startTime = Date.now();

    let result: any;
    switch (type) {
      case 'combo':
        result = await this.generateComboSuggestions(branchId);
        break;
      case 'upsell':
        result = await this.generateUpsellSuggestions(branchId);
        break;
      case 'popular_pair':
        result = await this.generatePopularPairs(branchId);
        break;
      default:
        result = [];
    }

    const latencyMs = Date.now() - startTime;

    // Log recommendation
    await AiRecommendationLog.create({
      type,
      input: { branchId, customerId },
      output: result,
      model: 'internal_analytics',
      latencyMs,
      branch: branchId || undefined,
      customer: customerId || undefined,
    });

    return result;
  }

  /**
   * Suggest combo deals based on frequently ordered together items
   */
  private static async generateComboSuggestions(branchId?: string) {
    const match: any = { status: 'delivered' };
    if (branchId) match.branch = branchId;

    const pairs = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $group: { _id: '$_id', products: { $push: '$items.product' } } },
      { $match: { 'products.1': { $exists: true } } },
      { $unwind: '$products' },
      { $group: { _id: '$products', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { productId: '$_id', name: '$product.name', price: '$product.price', orderCount: '$count' } },
    ]);

    // Group top products into suggested combos of 2-3 items
    const combos = [];
    for (let i = 0; i < pairs.length - 1; i += 2) {
      if (pairs[i + 1]) {
        const comboPrice = Math.round((pairs[i].price + pairs[i + 1].price) * 0.85);
        combos.push({
          items: [pairs[i], pairs[i + 1]],
          suggestedPrice: comboPrice,
          savings: pairs[i].price + pairs[i + 1].price - comboPrice,
          confidence: Math.min(pairs[i].orderCount, pairs[i + 1].orderCount) / 10,
        });
      }
    }

    return combos;
  }

  /**
   * Generate upsell suggestions (higher-value items in same category)
   */
  private static async generateUpsellSuggestions(branchId?: string) {
    const filter: any = { isAvailable: true, isPublished: true };
    if (branchId) filter.branch = branchId;

    const products = await Product.find(filter)
      .sort({ price: -1, rating: -1 })
      .limit(10)
      .select('name price category rating isBestSeller')
      .populate('category', 'name')
      .lean();

    return products.map(p => ({
      productId: p._id,
      name: p.name,
      price: p.price,
      category: (p.category as any)?.name,
      reason: p.isBestSeller ? 'Best Seller - Higher Value' : 'Premium Choice',
    }));
  }

  /**
   * Find popular product pairs from order data
   */
  private static async generatePopularPairs(branchId?: string) {
    const match: any = { status: 'delivered', 'items.1': { $exists: true } };
    if (branchId) match.branch = branchId;

    const pairs = await Order.aggregate([
      { $match: match },
      { $project: { items: { $slice: ['$items', 2] } } },
      { $unwind: '$items' },
      { $group: { _id: { order: '$_id' }, products: { $push: { id: '$items.product', name: '$items.productName' } } } },
      { $match: { 'products.1': { $exists: true } } },
      { $project: { pair: { $slice: ['$products', 2] } } },
      { $group: { _id: '$pair', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return pairs.map(p => ({
      products: p._id,
      timesOrderedTogether: p.count,
    }));
  }

  /**
   * Sales forecast based on historical patterns
   */
  static async getSalesForecast(branchId?: string, days = 7) {
    const match: any = { paymentStatus: 'paid' };
    if (branchId) match.branch = branchId;

    // Get last 30 days of data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    match.createdAt = { $gte: thirtyDaysAgo };

    const historical = await Order.aggregate([
      { $match: match },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, avgRevenue: { $avg: '$total' }, avgOrders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const totalDays = 30;
    const avgDailyRevenue = historical.reduce((sum, d) => sum + d.avgRevenue * d.avgOrders, 0) / totalDays;

    // Simple forecast: use day-of-week patterns
    const forecast = [];
    const today = new Date();
    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay() + 1; // MongoDB uses 1-7
      const dayData = historical.find(h => h._id === dayOfWeek);
      const multiplier = dayData ? (dayData.avgRevenue * dayData.avgOrders) / avgDailyRevenue : 1;

      forecast.push({
        date: date.toISOString().split('T')[0],
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        predictedRevenue: Math.round(avgDailyRevenue * multiplier),
        confidence: Math.min(0.85, totalDays / 60),
      });
    }

    return { forecast, basedOnDays: totalDays, avgDailyRevenue: Math.round(avgDailyRevenue) };
  }

  /**
   * Demand forecast - predict which products will be popular
   */
  static async getDemandForecast(branchId?: string) {
    const match: any = { status: 'delivered' };
    if (branchId) match.branch = branchId;
    match.createdAt = { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) };

    const trending = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.productName' }, totalOrdered: { $sum: '$items.quantity' }, revenue: { $sum: '$items.totalPrice' } } },
      { $sort: { totalOrdered: -1 } },
      { $limit: 20 },
    ]);

    // Calculate growth trend (compare last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const recentMatch = { ...match, createdAt: { $gte: sevenDaysAgo } };
    const previousMatch = { ...match, createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } };

    const [recent, previous] = await Promise.all([
      Order.aggregate([{ $match: recentMatch }, { $unwind: '$items' }, { $group: { _id: '$items.product', qty: { $sum: '$items.quantity' } } }]),
      Order.aggregate([{ $match: previousMatch }, { $unwind: '$items' }, { $group: { _id: '$items.product', qty: { $sum: '$items.quantity' } } }]),
    ]);

    const recentMap = new Map(recent.map(r => [r._id.toString(), r.qty]));
    const previousMap = new Map(previous.map(r => [r._id.toString(), r.qty]));

    const withTrend = trending.map(item => {
      const recentQty = recentMap.get(item._id.toString()) || 0;
      const prevQty = previousMap.get(item._id.toString()) || 1;
      const growth = ((recentQty - prevQty) / prevQty) * 100;
      return { ...item, recentOrders: recentQty, growth: Math.round(growth), trend: growth > 10 ? 'rising' : growth < -10 ? 'falling' : 'stable' };
    });

    return withTrend;
  }

  /**
   * Simple chatbot response - returns knowledge-based answers
   */
  static async chat(message: string, _customerId?: string) {
    const lowerMsg = message.toLowerCase();

    // Knowledge base
    const responses: { keywords: string[]; answer: string }[] = [
      { keywords: ['hours', 'open', 'timing', 'close'], answer: 'Aleem Restaurant is open from 10:00 AM to 2:00 AM daily. Delivery is available during all working hours.' },
      { keywords: ['delivery', 'fee', 'charge'], answer: 'Delivery fee varies by location. Standard delivery fee is Rs 150 within 10km radius. Free delivery on orders above Rs 2000.' },
      { keywords: ['menu', 'food', 'items', 'what do you serve'], answer: 'We serve burgers, pizzas, fried chicken, wraps, beverages, and desserts. Check our full menu for deals and combos!' },
      { keywords: ['order', 'status', 'track', 'where'], answer: 'You can track your order in real-time through the app. Go to My Orders to see the current status.' },
      { keywords: ['cancel', 'refund'], answer: 'Orders can be cancelled before preparation starts. Refunds are processed within 3-5 business days for online payments.' },
      { keywords: ['payment', 'pay', 'method'], answer: 'We accept Cash on Delivery, Card payments, JazzCash, and EasyPaisa.' },
      { keywords: ['loyalty', 'points', 'reward'], answer: 'Earn 1 point for every Rs 100 spent. Redeem points for discounts on future orders. Bronze → Silver → Gold → Platinum tiers.' },
      { keywords: ['complaint', 'issue', 'problem'], answer: 'We\'re sorry for the inconvenience. Please describe your issue and our team will resolve it within 24 hours.' },
      { keywords: ['contact', 'phone', 'call'], answer: 'Contact us at 0300-1234567 or email support@aleemrestaurant.com. Our support team is available 10 AM - 12 AM.' },
    ];

    const matched = responses.find(r => r.keywords.some(k => lowerMsg.includes(k)));

    return {
      message: matched?.answer || 'Thank you for reaching out! I can help with order tracking, menu info, delivery details, and more. How can I assist you?',
      type: matched ? 'knowledge' : 'fallback',
      escalate: !matched && lowerMsg.includes('human'),
    };
  }
}
