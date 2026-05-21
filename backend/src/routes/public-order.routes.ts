import { Router } from 'express';
import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Customer } from '../models/Customer';
import { Branch } from '../models/Branch';
import { OrderStatusLog } from '../models/OrderStatusLog';
import { asyncHandler } from '../middleware/asyncHandler';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Public: Place order from customer-facing menu (no auth required)
router.post(
  '/place',
  asyncHandler(async (req: Request, res: Response) => {
    const { customerName, customerPhone, orderType, deliveryAddress, deliveryArea, orderNote, items } = req.body;

    // Validation
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Name, phone, and items are required.' });
    }
    if (orderType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Delivery address is required for delivery orders.' });
    }

    // Find or create customer by phone
    let customer = await Customer.findOne({ phone: customerPhone });
    if (!customer) {
      customer = await Customer.create({
        name: customerName,
        phone: customerPhone,
        email: `${customerPhone.replace(/[^0-9]/g, '')}@guest.aleemrestaurant.com`,
        password: uuidv4(), // placeholder, not used for guest
        isVerified: false,
        addresses: orderType === 'delivery' ? [{
          label: 'Delivery',
          fullAddress: deliveryAddress,
          area: deliveryArea || '',
          city: 'Lahore',
          isDefault: true,
        }] : [],
      });
    } else {
      // Update name if provided
      customer.name = customerName;
      if (orderType === 'delivery' && deliveryAddress) {
        const existingAddr = customer.addresses.find((a: any) => a.fullAddress === deliveryAddress);
        if (!existingAddr) {
          customer.addresses.push({
            label: 'Delivery',
            fullAddress: deliveryAddress,
            area: deliveryArea || '',
            city: 'Lahore',
            isDefault: true,
          } as any);
        }
      }
      await customer.save();
    }

    // Get default branch (first active one)
    let branch = await Branch.findOne({ isActive: true });
    if (!branch) {
      // Create a default branch if none exists
      branch = await Branch.create({
        name: 'Aleem Restaurant - Main',
        slug: 'main',
        address: 'Lahore',
        city: 'Lahore',
        phone: '0300-0000000',
        lat: 31.5204,
        lng: 74.3587,
        deliveryRadius: 15,
        deliveryFee: 150,
        minimumOrder: 0,
        taxRate: 0,
        isOpen: true,
        isActive: true,
        openTime: '10:00',
        closeTime: '23:00',
        estimatedDeliveryTime: 30,
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
    const deliveryFee = orderType === 'delivery' ? 150 : 0;
    const total = subtotal + deliveryFee;

    // Generate order number
    const date = new Date();
    const prefix = `ALM${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const suffix = uuidv4().slice(0, 6).toUpperCase();
    const orderNumber = `${prefix}-${suffix}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      customer: customer._id,
      branch: branch._id,
      items: items.map((item: any) => ({
        product: item._id,
        productName: item.name,
        productImage: item.images?.[0] || '',
        quantity: item.qty,
        unitPrice: item.price,
        totalPrice: item.price * item.qty,
        addons: [],
      })),
      orderType: orderType === 'takeaway' ? 'pickup' : 'delivery',
      status: 'pending',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      subtotal,
      deliveryFee,
      total,
      deliveryAddress: orderType === 'delivery' ? `${deliveryAddress}${deliveryArea ? ' (' + deliveryArea + ')' : ''}` : undefined,
      notes: orderNote || undefined,
    });

    // Update customer stats
    customer.totalOrders = (customer.totalOrders || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + total;
    customer.lastOrderAt = new Date();
    await customer.save();

    // Log initial status
    await OrderStatusLog.create({
      order: order._id,
      fromStatus: 'new',
      toStatus: 'pending',
      note: 'Order placed by customer',
    });

    res.status(201).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        estimatedTime: orderType === 'delivery' ? '30-45 min' : '15-20 min',
      },
    });
  })
);

// Public: Track order by order number
router.get(
  '/track/:orderNumber',
  asyncHandler(async (req: Request, res: Response) => {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('customer', 'name phone')
      .select('orderNumber status orderType total deliveryAddress createdAt items');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, data: order });
  })
);

export default router;
