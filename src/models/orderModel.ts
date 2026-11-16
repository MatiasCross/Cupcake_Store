import type { AppUser, CartItem, Order, OrderItem, OrderStatus } from './types';
import { STATUSES } from './types';

export { STATUSES };
export type { OrderStatus };

export function buildOrder(
  user: AppUser | null,
  items: CartItem[],
  total: number,
): Omit<Order, 'id' | 'createdAt'> {
  if (!user) throw new Error('Sign in to place an order');
  if (!items.length) throw new Error('Your cart is empty');

  const orderItems: OrderItem[] = items.map(({ key, name, detail, unitPrice, qty }) => ({
    key,
    name,
    detail: detail ?? null,
    unitPrice,
    qty,
  }));

  return {
    uid: user.uid,
    customer: user.name,
    email: user.email,
    items: orderItems,
    total,
    status: 'pending',
  };
}

export interface OrderStats {
  count: number;
  revenue: number;
  cupcakes: number;
  byStatus: Record<OrderStatus, number>;
}

export function orderStats(orders: Order[]): OrderStats {
  const active = orders.filter((o) => o.status !== 'cancelled');
  const byStatus = Object.fromEntries(
    STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length]),
  ) as Record<OrderStatus, number>;

  const revenue = active.reduce((s, o) => s + Math.round(o.total * 100), 0) / 100;
  const cupcakes = active.reduce(
    (s, o) => s + o.items.reduce((n, i) => n + i.qty, 0),
    0,
  );

  return { count: orders.length, revenue, cupcakes, byStatus };
}