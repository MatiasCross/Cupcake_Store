import { ref, get, update } from 'firebase/database';
import { db } from '../services/firebase';
import { products, options } from '../stores/index';
import { TYPES } from '../models/productModel';
import type { Product, Option } from '../models/types';

function toList<T>(raw: Record<string, Omit<T, 'id'>> | null): T[] {
  if (!raw) return [];
  return Object.entries(raw).map(([id, v]) => ({ id, ...(v as object) } as T));
}

/** Options saved before the `active` flag existed count as available. */
const isAvailable = (o: Option): boolean => o.active !== false;

async function fetchOptions(): Promise<Option[]> {
  const snap = await get(ref(db, 'options'));
  return toList<Option>(snap.val()).sort((a, b) => a.price - b.price);
}

export async function loadCatalog(): Promise<void> {
  const [allOpts, prodsSnap] = await Promise.all([
    fetchOptions(),
    get(ref(db, 'products')),
  ]);

  const opts = allOpts.filter(isAvailable);
  const availableIds = new Set(opts.map((o) => o.id));

  // A pre-made cupcake is only offered if every flavour in it is available.
  const prods = toList<Product>(prodsSnap.val()).filter(
    (p) => p.active === true && TYPES.every((t) => availableIds.has(p.recipe[t])),
  );

  options.set(opts);
  products.set(prods);
}

/** Admin only: includes hidden products. */
export async function loadAllProducts(): Promise<void> {
  const snap = await get(ref(db, 'products'));
  products.set(toList<Product>(snap.val()));
}

export async function setProductActive(id: string, active: boolean): Promise<void> {
  await update(ref(db, `products/${id}`), { active });
  products.update((list) =>
    list.map((p) => (p.id === id ? { ...p, active } : p)),
  );
}

/** Admin only: every flavour, including hidden ones. Doesn't touch the shop's store. */
export const loadAllOptions = (): Promise<Option[]> => fetchOptions();

/**
 * Admin only: show/hide a single flavour (cake, frosting, filling or topping).
 * It is a soft delete on purpose — pre-made cupcakes and carts still point at
 * the option id, so removing the record would break them.
 * Returns the full, updated list (hidden ones included).
 */
export async function setOptionActive(id: string, active: boolean): Promise<Option[]> {
  await update(ref(db, `options/${id}`), { active });
  const all = await fetchOptions();
  options.set(all.filter(isAvailable)); // keep the builder in sync for this session
  return all;
}