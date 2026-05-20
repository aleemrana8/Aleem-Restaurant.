export const ORDER_STATUSES = [
  'pending', 'confirmed', 'preparing', 'ready',
  'rider_assigned', 'picked_up', 'out_for_delivery',
  'delivered', 'cancelled', 'refunded',
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['rider_assigned', 'picked_up', 'delivered'],
  rider_assigned: ['picked_up'],
  picked_up: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: ['refunded'],
  refunded: [],
};

export const PAYMENT_METHODS = ['cod', 'card', 'jazzcash', 'easypaisa', 'wallet'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

export const ORDER_TYPES = ['delivery', 'pickup', 'dine_in'] as const;
export type OrderType = typeof ORDER_TYPES[number];

export const USER_ROLES = ['super_admin', 'admin', 'manager', 'kitchen_staff', 'rider', 'cashier', 'customer'] as const;
export type UserRole = typeof USER_ROLES[number];

export const RIDER_STATUSES = ['online', 'offline', 'busy', 'on_delivery'] as const;
export type RiderStatus = typeof RIDER_STATUSES[number];

export const KITCHEN_ORDER_STATUSES = ['queued', 'in_progress', 'completed', 'delayed'] as const;
export type KitchenOrderStatus = typeof KITCHEN_ORDER_STATUSES[number];

export const STOCK_MOVEMENT_TYPES = ['purchase', 'consumption', 'adjustment', 'waste', 'transfer'] as const;
export type StockMovementType = typeof STOCK_MOVEMENT_TYPES[number];

export const PERMISSIONS = {
  DASHBOARD: { VIEW: 'dashboard.view' },
  ORDERS: { VIEW: 'orders.view', UPDATE: 'orders.update', CANCEL: 'orders.cancel', REFUND: 'orders.refund' },
  PRODUCTS: { VIEW: 'products.view', CREATE: 'products.create', UPDATE: 'products.update', DELETE: 'products.delete' },
  CATEGORIES: { VIEW: 'categories.view', CREATE: 'categories.create', UPDATE: 'categories.update', DELETE: 'categories.delete' },
  BRANCHES: { VIEW: 'branches.view', CREATE: 'branches.create', UPDATE: 'branches.update', DELETE: 'branches.delete' },
  CUSTOMERS: { VIEW: 'customers.view', UPDATE: 'customers.update', BLOCK: 'customers.block' },
  EMPLOYEES: { VIEW: 'employees.view', CREATE: 'employees.create', UPDATE: 'employees.update', DELETE: 'employees.delete' },
  RIDERS: { VIEW: 'riders.view', UPDATE: 'riders.update', ASSIGN: 'riders.assign' },
  KITCHEN: { VIEW: 'kitchen.view', UPDATE: 'kitchen.update' },
  INVENTORY: { VIEW: 'inventory.view', CREATE: 'inventory.create', UPDATE: 'inventory.update' },
  CMS: { VIEW: 'cms.view', CREATE: 'cms.create', UPDATE: 'cms.update', DELETE: 'cms.delete' },
  REPORTS: { VIEW: 'reports.view', EXPORT: 'reports.export' },
  AI: { VIEW: 'ai.view', GENERATE: 'ai.generate' },
  SETTINGS: { VIEW: 'settings.view', UPDATE: 'settings.update' },
} as const;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: Object.values(PERMISSIONS).flatMap(p => Object.values(p)),
  admin: Object.values(PERMISSIONS).flatMap(p => Object.values(p)),
  manager: [
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.ORDERS.VIEW, PERMISSIONS.ORDERS.UPDATE,
    PERMISSIONS.PRODUCTS.VIEW,
    PERMISSIONS.BRANCHES.VIEW,
    PERMISSIONS.CUSTOMERS.VIEW,
    PERMISSIONS.RIDERS.VIEW, PERMISSIONS.RIDERS.ASSIGN,
    PERMISSIONS.KITCHEN.VIEW, PERMISSIONS.KITCHEN.UPDATE,
    PERMISSIONS.INVENTORY.VIEW,
    PERMISSIONS.REPORTS.VIEW,
  ],
  kitchen_staff: [PERMISSIONS.KITCHEN.VIEW, PERMISSIONS.KITCHEN.UPDATE],
  rider: [PERMISSIONS.ORDERS.VIEW],
  cashier: [PERMISSIONS.ORDERS.VIEW, PERMISSIONS.ORDERS.UPDATE, PERMISSIONS.CUSTOMERS.VIEW],
  customer: [],
};
