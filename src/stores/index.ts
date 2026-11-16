import { writable, derived, type Writable } from 'svelte/store';

import { cartCount } from '../models/cartModel.js';
import type { AppUser, CartItem, Product, Option, Recipe, Order } from '../models/types.js';
import type { ComponentType } from 'svelte';

export type View = 'catalog' | 'builder' | 'cart' | 'auth' | 'dashboard';

export const user: Writable<AppUser | null> = writable(null);
export const authReady: Writable<boolean> = writable(false);
export const cart: Writable<CartItem[]> = writable([]);
export const products: Writable<Product[]> = writable([]);
export const options: Writable<Option[]> = writable([]);
export const orders: Writable<Order[]> = writable([]);
export const view: Writable<View> = writable('catalog');
export const message: Writable<string | null> = writable(null);
export const draftRecipe: Writable<Recipe | null> = writable(null);
export const count = derived(cart, ($cart) => cartCount($cart));
export const total = derived(cart, ($cart) =>
  $cart.reduce((s, i) => s + Math.round(i.unitPrice * 100) * i.qty, 0) / 100
);

export const screens: Record<View, ComponentType> = {
  catalog: null as any, // filled in App.svelte — see below
  builder: null as any,
  cart: null as any,
  auth: null as any,
  dashboard: null as any
};