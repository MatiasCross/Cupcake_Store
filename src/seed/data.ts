import type { Option, Product } from '../models/types.js';

export const options: Option[] = [
  { id: 'vanilla',   type: 'base', name: 'Vanilla',        color: '#f3d9a4', price: 4.0 },
  { id: 'chocolate', type: 'base', name: 'Dark chocolate', color: '#4a2c1a', price: 4.5 },
  { id: 'redvelvet', type: 'base', name: 'Red velvet',     color: '#a4262c', price: 4.8 },
  { id: 'matcha',    type: 'base', name: 'Matcha',         color: '#9bb36b', price: 4.8 },
  { id: 'carrot',    type: 'base', name: 'Carrot',         color: '#d98a3d', price: 4.5 },

  { id: 'f-choc',    type: 'frosting', name: 'Chocolate ganache',   color: '#6b3a22', price: 1.0 },
  { id: 'f-vanilla', type: 'frosting', name: 'Vanilla buttercream', color: '#fff1d6', price: 0.8 },
  { id: 'f-straw',   type: 'frosting', name: 'Strawberry',          color: '#f4a6b8', price: 1.0 },
  { id: 'f-pistach', type: 'frosting', name: 'Pistachio',           color: '#b9d08b', price: 1.4 },
  { id: 'f-caramel', type: 'frosting', name: 'Salted caramel',      color: '#c98b3c', price: 1.2 },

  { id: 'fi-none',  type: 'filling', name: 'No filling',     color: '#00000000', price: 0 },
  { id: 'fi-choc',  type: 'filling', name: 'Brigadeiro',     color: '#3b2012',   price: 0.9 },
  { id: 'fi-dulce', type: 'filling', name: 'Dulce de leche', color: '#b8782e',   price: 0.9 },
  { id: 'fi-berry', type: 'filling', name: 'Berry jam',      color: '#8e2a52',   price: 0.9 },

  { id: 't-none',     type: 'topping', name: 'Nothing',           color: '#00000000', shape: 'none',      price: 0 },
  { id: 't-sprinkle', type: 'topping', name: 'Rainbow sprinkles', color: '#ff7aa8',   shape: 'sprinkles', price: 0.4 },
  { id: 't-cherry',   type: 'topping', name: 'Cherry',            color: '#c0182f',   shape: 'cherry',    price: 0.6 },
  { id: 't-chips',    type: 'topping', name: 'Chocolate chips',   color: '#2e1a0f',   shape: 'chips',     price: 0.5 }
];

export const products: Product[] = [
  { id: 'midnight-cocoa', name: 'Midnight Cocoa', description: 'Dark chocolate cake, ganache and a brigadeiro heart.', price: 7.9, active: true,
    recipe: { base: 'chocolate', frosting: 'f-choc', filling: 'fi-choc', topping: 't-chips' } },
  { id: 'velvet-kiss', name: 'Velvet Kiss', description: 'Red velvet with vanilla buttercream and a cherry.', price: 7.4, active: true,
    recipe: { base: 'redvelvet', frosting: 'f-vanilla', filling: 'fi-none', topping: 't-cherry' } },
  { id: 'berry-cloud', name: 'Berry Cloud', description: 'Vanilla cake, strawberry frosting, berry jam centre.', price: 7.0, active: true,
    recipe: { base: 'vanilla', frosting: 'f-straw', filling: 'fi-berry', topping: 't-sprinkle' } },
  { id: 'green-tea-hug', name: 'Green Tea Hug', description: 'Matcha cake with pistachio frosting.', price: 7.6, active: true,
    recipe: { base: 'matcha', frosting: 'f-pistach', filling: 'fi-none', topping: 't-none' } },
  { id: 'golden-carrot', name: 'Golden Carrot', description: 'Carrot cake, salted caramel and dulce de leche.', price: 7.8, active: true,
    recipe: { base: 'carrot', frosting: 'f-caramel', filling: 'fi-dulce', topping: 't-chips' } }
];