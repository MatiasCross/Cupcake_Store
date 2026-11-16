import type { CartItem } from './types';

const cents = (n: number): number => Math.round(n * 100);

export function addItem(items: CartItem[], item: Omit<CartItem, 'qty'>, qty = 1): CartItem[] {
  const found = items.find((i) => i.key === item.key);
  if (found) {
    return items.map((i) => (i.key === item.key ? { ...i, qty: i.qty + qty } : i));
  }
  return [...items, { ...item, qty }];
}

export function setQty(items: CartItem[], key: string, qty: number): CartItem[] {
  if (qty <= 0) return removeItem(items, key);
  return items.map((i) => (i.key === key ? { ...i, qty } : i));
}

/**
 * Swaps the line `oldKey` for `item`, keeping its quantity and position.
 * If the new item matches another line already in the cart, they are merged.
 */
export function replaceItem(
  items: CartItem[],
  oldKey: string,
  item: Omit<CartItem, 'qty'>,
): CartItem[] {
  const old = items.find((i) => i.key === oldKey);
  if (!old) return items;
  const rest = items.filter((i) => i.key !== oldKey);
  if (rest.some((i) => i.key === item.key)) return addItem(rest, item, old.qty);
  return items.map((i) => (i.key === oldKey ? { ...item, qty: old.qty } : i));
}

export const removeItem = (items: CartItem[], key: string): CartItem[] =>
  items.filter((i) => i.key !== key);

export const lineTotal = (i: CartItem): number => (cents(i.unitPrice) * i.qty) / 100;

export const cartTotal = (items: CartItem[]): number =>
  items.reduce((s, i) => s + cents(i.unitPrice) * i.qty, 0) / 100;

export const cartCount = (items: CartItem[]): number =>
  items.reduce((s, i) => s + i.qty, 0);