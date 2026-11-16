import { get } from 'svelte/store';
import { ref, get as fbGet, set } from 'firebase/database';
import { db, auth } from '../services/firebase';
import { cart, options, message } from '../stores/index';
import { addItem, removeItem, replaceItem, setQty } from '../models/cartModel';
import { toCartItem, customToCartItem } from '../models/productModel';
import type { CartItem, Product, Recipe } from '../models/types';

async function commit(items: CartItem[]): Promise<void> {
  cart.set(items);
  const u = auth.currentUser;
  if (u) await set(ref(db, `carts/${u.uid}/items`), items);
}

export async function loadCart(uid: string): Promise<void> {
  const snap = await fbGet(ref(db, `carts/${uid}/items`));
  const raw = snap.val();
  // RTDB may return arrays as objects with numeric keys; normalise:
  const saved: CartItem[] = Array.isArray(raw)
    ? raw
    : raw
      ? Object.values(raw as Record<string, CartItem>)
      : [];

  // merge anything added while signed out
  await commit(get(cart).reduce((acc, i) => addItem(acc, i, i.qty), saved));
}

export const addProduct = (product: Product): Promise<void> => {
  message.set(`${product.name} added to cart`);
  return commit(addItem(get(cart), toCartItem(product, get(options))));
};

export const addCustom = (recipe: Recipe): Promise<void> => {
  message.set('Custom cupcake added to cart');
  return commit(addItem(get(cart), customToCartItem(recipe, get(options))));
};

/** Replaces a cart line with a custom cupcake built from `recipe` (qty is kept). */
export const editCustom = (oldKey: string, recipe: Recipe): Promise<void> => {
  message.set('Cart item updated');
  return commit(replaceItem(get(cart), oldKey, customToCartItem(recipe, get(options))));
};

export const changeQty = (key: string, qty: number): Promise<void> =>
  commit(setQty(get(cart), key, qty));

export const remove = (key: string): Promise<void> =>
  commit(removeItem(get(cart), key));

export const clearCart = (): Promise<void> => commit([]);