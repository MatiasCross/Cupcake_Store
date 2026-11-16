import { get } from 'svelte/store';
import {
  ref,
  push,
  set,
  get as fbGet,
  update,
  serverTimestamp,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database';
import { db } from '../services/firebase';
import { user, cart, total, orders, view, message } from '../stores/index';
import { buildOrder } from '../models/orderModel';
import { clearCart } from './cartController';
import type { Order, OrderStatus } from '../models/types';

export async function checkout(): Promise<void> {
  const u = get(user);
  if (!u) throw new Error('Must be signed in to check out.');

  const draft = buildOrder(u, get(cart), get(total));
  const newRef = push(ref(db, 'orders'));
  await set(newRef, { ...draft, createdAt: serverTimestamp() });

  await clearCart();
  message.set('Order placed. Thank you!');
  view.set('dashboard');
}

function toOrders(raw: Record<string, Omit<Order, 'id'>> | null): Order[] {
  if (!raw) return [];
  return Object.entries(raw).map(([id, v]) => ({ id, ...v } as Order));
}

export async function loadOrders(): Promise<void> {
  const u = get(user);
  if (!u) return;

  const base = ref(db, 'orders');
  let list: Order[];

  if (u.role === 'admin') {
    const snap = await fbGet(base);
    list = toOrders(snap.val());
  } else {
    const snap = await fbGet(query(base, orderByChild('uid'), equalTo(u.uid)));
    list = toOrders(snap.val());
  }

  list.sort(
    (a, b) => (Number(b.createdAt ?? 0)) - (Number(a.createdAt ?? 0)),
  );
  orders.set(list);
}

export async function setStatus(id: string, status: OrderStatus): Promise<void> {
  await update(ref(db, `orders/${id}`), { status });
  orders.update((l) => l.map((o) => (o.id === id ? { ...o, status } : o)));
}

// Orders in these states cannot be cancelled by the customer.
const NON_CANCELLABLE: OrderStatus[] = ['cancelled', 'delivered'];

export function canCancel(order: Order): boolean {
  const u = get(user);
  if (!u) return false;
  // Customers may only cancel their own orders and only before shipping.
  if (u.role !== 'admin') {
    if (order.uid !== u.uid) return false;
    return !NON_CANCELLABLE.includes(order.status);
  }
  // Admins can cancel anything that isn't already terminal.
  return order.status !== 'cancelled' && order.status !== 'delivered';
}

export async function cancelOrder(id: string): Promise<void> {
  const u = get(user);
  if (!u) throw new Error('Must be signed in to cancel an order.');

  const current = get(orders).find((o) => o.id === id);
  if (!current) throw new Error('Order not found.');

  if (!canCancel(current)) {
    throw new Error('This order can no longer be cancelled.');
  }

  try {
    await update(ref(db, `orders/${id}`), {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
    });
    orders.update((l) =>
      l.map((o) => (o.id === id ? { ...o, status: 'cancelled' as OrderStatus } : o)),
    );
    message.set('Order cancelled.');
  } catch (e) {
    console.error('[cancelOrder] error:', e);
    message.set('Could not cancel the order. Please try again.');
    throw e;
  }
}