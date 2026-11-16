import { describe, it, expect } from 'vitest';
import { options, products } from '../seed/data';
import {
  isValidRecipe,
  customPrice,
  colorsFor,
  recipeKey,
  customToCartItem,
  toCartItem,
} from './productModel';
import type { Recipe } from './types';

const recipe: Recipe = {
  base: 'chocolate',
  frosting: 'f-straw',
  filling: 'fi-dulce',
  topping: 't-cherry',
};

describe('productModel', () => {
  it('every seeded suggestion is a valid recipe', () => {
    for (const p of products) expect(isValidRecipe(p.recipe, options), p.id).toBe(true);
  });

  it('rejects recipes with a wrong or missing slot', () => {
    expect(isValidRecipe({ ...recipe, topping: 'chocolate' }, options)).toBe(false);
    expect(isValidRecipe({ base: 'vanilla' }, options)).toBe(false);
  });

  it('prices a custom cupcake as the sum of its parts', () => {
    expect(customPrice(recipe, options)).toBe(7);
  });

  it('resolves SVG colours from options', () => {
    expect(colorsFor(recipe, options)).toMatchObject({ cake: '#4a2c1a', shape: 'cherry' });
  });

  it('gives different combinations different cart keys', () => {
    expect(recipeKey(recipe)).not.toBe(recipeKey({ ...recipe, topping: 't-none' }));
  });

  it('builds cart items for custom and suggested cupcakes', () => {
    const c = customToCartItem(recipe, options);
    expect(c.unitPrice).toBe(7);
    expect(c.detail).toContain('Dark chocolate');
    expect(toCartItem(products[0], options).key).toBe(products[0].id);
  });
});