import { describe, it, expect } from 'vitest';
import { buildOrder, orderStats } from './orderModel';
import type { AppUser, CartItem, Order } from './types';

const user: AppUser = { uid: 'u1', email: 'ana@x.com', name: 'Ana', role: 'customer' };

const items: CartItem[] = [
  { key: 'a', name: 'A', productId: null, unitPrice: 7, qty: 2, colors: {} },
];

describe('orderModel', () => {
  it('builds a pending order and strips UI-only fields', () => {
    const o = buildOrder(user, items, 14);
    expect(o).toMatchObject({ uid: 'u1', total: 14, status: 'pending' });
    expect(o.items[0]).not.toHaveProperty('colors');
  });

  it('requires a user and a non-empty cart', () => {
    expect(() => buildOrder(null, items, 14)).toThrow();
    expect(() => buildOrder(user, [], 0)).toThrow();
  });

  it('computes dashboard stats and ignores cancelled orders in revenue', () => {
    const fake = [
      { status: 'pending', total: 14.5, items: [{ qty: 2 }] },
      { status: 'delivered', total: 7, items: [{ qty: 1 }] },
      { status: 'cancelled', total: 99, items: [{ qty: 9 }] },
    ] as unknown as Order[];

    const s = orderStats(fake);
    expect(s).toMatchObject({ count: 3, revenue: 21.5, cupcakes: 3 });
    expect(s.byStatus.cancelled).toBe(1);
  });
});