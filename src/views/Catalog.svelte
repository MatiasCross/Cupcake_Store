<script lang="ts">
  import { products, options, view, draftRecipe } from '../stores/index.js';
  import { addProduct } from '../controllers/cartController.js';
  import { colorsFor } from '../models/productModel.js';
  import CupcakeSvg from './CupcakeSvg.svelte';
    import type { Product } from '../models/types.js';

  function customize(p: Product): void {
    draftRecipe.set({ ...p.recipe });
    view.set('builder');
  }
</script>

<section class="wrap">
  <h1>Small cakes, deep chocolate.</h1>
  <p class="muted">Pick a house favourite, or tweak any of them to make it yours.</p>

  {#if !$products.length}
    <p class="muted">No cupcakes on the shelf yet. Run <code>npm run seed</code> to load the menu into Firebase.</p>
  {/if}

  <div class="grid">
    {#each $products as p (p.id)}
      {@const c = colorsFor(p.recipe, $options)}
      <article class="card">
        <div class="art"><CupcakeSvg {...c} /></div>
        <h3>{p.name}</h3>
        <p class="muted">{p.description}</p>
        <p class="price">${p.price.toFixed(2)}</p>
        <div class="row">
          <button class="btn" on:click={() => addProduct(p)}>Add to cart</button>
          <button class="btn ghost" on:click={() => customize(p)}>Customize</button>
        </div>
      </article>
    {/each}
  </div>
</section>

<style>
  .art { display: grid; place-items: center; background: var(--milk); border-radius: 10px; padding: 1rem; margin-bottom: .8rem; }
  .row { display: flex; gap: .5rem; flex-wrap: wrap; }
</style>