// ── User ────────────────────────────────────────────────────────────
export type Role = 'customer' | 'admin';

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  role: Role;
}

// ── Catalog ─────────────────────────────────────────────────────────
export const TYPES = ['base', 'frosting', 'filling', 'topping'] as const;
export type OptionType = (typeof TYPES)[number];

export interface Option {
  id: string;
  type: OptionType;
  name: string;
  color: string;
  shape?: string;
  price: number;
  /** Admin can hide a flavour. Missing means available (older records). */
  active?: boolean;
}

export interface Recipe {
  base: string;
  frosting: string;
  filling: string;
  topping: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  recipe: Recipe;
}

// ── Cart ────────────────────────────────────────────────────────────
/** SVG colours resolved from a recipe — UI only, stripped before saving. */
export interface CartColors {
  cake?: string;
  filling?: string;
  frosting?: string;
  topping?: string;
  shape?: string;
}

export interface CartItem {
  key: string;
  productId: string | null;
  name: string;
  detail?: string;
  unitPrice: number;
  qty: number;
  colors: CartColors;
  /** Needed to edit the item later. Older saved carts may not have it. */
  recipe?: Recipe;
}

// ── Orders ──────────────────────────────────────────────────────────
export const STATUSES = ['pending', 'baking', 'ready', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof STATUSES)[number];

/** What is persisted in an order — UI-only fields (colors) stripped. */
export interface OrderItem {
  key: string;
  name: string;
  detail: string | null;
  unitPrice: number;
  qty: number;
}

export interface Order {
  id: string;
  uid: string;
  customer: string;
  email: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt?: number;
  cancelledAt?: number;
}