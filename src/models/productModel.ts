import type { CartItem, CartColors, Option, OptionType, Product, Recipe } from './types';
import { TYPES } from './types';

export { TYPES };

export const TYPE_LABELS: Record<OptionType, string> = {
  base: 'Cake',
  frosting: 'Frosting',
  filling: 'Filling',
  topping: 'Topping',
};

const find = (options: Option[], id: string | undefined): Option | undefined =>
  id === undefined ? undefined : options.find((o) => o.id === id);

export function isValidRecipe(recipe: Partial<Recipe> | undefined, options: Option[]): boolean {
  return TYPES.every((t) => {
    const o = find(options, recipe?.[t]);
    return !!o && o.type === t;
  });
}

export function colorsFor(recipe: Recipe, options: Option[]): CartColors {
  return {
    cake: find(options, recipe.base)?.color,
    filling: find(options, recipe.filling)?.color,
    frosting: find(options, recipe.frosting)?.color,
    topping: find(options, recipe.topping)?.color,
    shape: find(options, recipe.topping)?.shape ?? 'none',
  };
}

export function customPrice(recipe: Recipe, options: Option[]): number {
  const c = TYPES.reduce(
    (s, t) => s + Math.round((find(options, recipe[t])?.price ?? 0) * 100),
    0,
  );
  return c / 100;
}

export function describeRecipe(recipe: Recipe, options: Option[]): string {
  return TYPES.map((t) => find(options, recipe[t])?.name ?? '?').join(' · ');
}

export const recipeKey = (recipe: Recipe): string =>
  'custom:' + TYPES.map((t) => recipe[t]).join('|');

/** Builds a cart item without `qty` — `addItem` attaches it. */
export function toCartItem(
  product: Product,
  options: Option[],
): Omit<CartItem, 'qty'> {
  return {
    key: product.id,
    productId: product.id,
    name: product.name,
    unitPrice: product.price,
    colors: colorsFor(product.recipe, options),
    recipe: { ...product.recipe },
  };
}

export function customToCartItem(
  recipe: Recipe,
  options: Option[],
): Omit<CartItem, 'qty'> {
  return {
    key: recipeKey(recipe),
    productId: null,
    name: 'Custom cupcake',
    detail: describeRecipe(recipe, options),
    unitPrice: customPrice(recipe, options),
    colors: colorsFor(recipe, options),
    recipe: { ...recipe },
  };
}
/**
 * Recovers the recipe behind a cart line so it can be edited.
 * Falls back for carts saved before `recipe` was stored on the item.
 */
export function recipeOf(item: CartItem, products: Product[]): Recipe | undefined {
  if (item.recipe) return item.recipe;

  const fromProduct = item.productId
    ? products.find((p) => p.id === item.productId)?.recipe
    : undefined;
  if (fromProduct) return fromProduct;

  if (item.key.startsWith('custom:')) {
    const ids = item.key.slice('custom:'.length).split('|');
    if (ids.length === TYPES.length && ids.every(Boolean)) {
      const recipe = {} as Recipe;
      TYPES.forEach((t, i) => {
        recipe[t] = ids[i];
      });
      return recipe;
    }
  }
  return undefined;
}