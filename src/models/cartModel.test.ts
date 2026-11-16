import { describe, it, expect } from 'vitest';
import { addItem, setQty, removeItem, cartTotal, cartCount, lineTotal } from './cartModel';
import type { CartItem } from './types';

const a = { key: 'a', name: 'A', productId: null, unitPrice: 7.1, colors: {} };
const b = { key: 'b', name: 'B', productId: null, unitPrice: 0.2, colors: {} };

describe('cartModel', () => {
  it('adds new items and merges duplicates by key', () => {
    let c: CartItem[] = addItem([], a);
    c = addItem(c, a);
    c = addItem(c, b, 3);
    expect(c).toHaveLength(2);
    expect(c[0].qty).toBe(2);
    expect(cartCount(c)).toBe(5);
  });

  it('computes totals without floating point drift', () => {
    const c = addItem(addItem([], a, 3), b, 3);
    expect(lineTotal(c[0])).toBe(21.3);
    expect(cartTotal(c)).toBe(21.9);
  });

  it('removes an item when quantity drops to zero', () => {
    expect(setQty(addItem([], a, 2), 'a', 0)).toEqual([]);
  });

  it('removeItem only removes the matching key', () => {
    expect(removeItem(addItem(addItem([], a), b), 'a').map((i) => i.key)).toEqual(['b']);
  });
});