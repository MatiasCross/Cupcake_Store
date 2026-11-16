<script lang="ts">
  import { options, draftRecipe } from '../stores/index.js';
  import { addCustom } from '../controllers/cartController.js';
  import {
    TYPES, TYPE_LABELS, colorsFor, customPrice, isValidRecipe
  } from '../models/productModel.js';
  import CupcakeSvg from './CupcakeSvg.svelte';
    import type { OptionType, Recipe } from '../models/types.js';

  const first = (t: OptionType): string | undefined =>
    $options.find((o) => o.type === t)?.id;

  // draftRecipe may be null; build a fallback from the first available option of each type
  let recipe: Recipe = $draftRecipe ?? (Object.fromEntries(
    TYPES.map((t) => [t, first(t) ?? ''])
  ) as Record<OptionType, string> as unknown as Recipe);

  $: colors = colorsFor(recipe, $options);
  $: price = customPrice(recipe, $options);
  $: valid = isValidRecipe(recipe, $options);
</script>

<section class="wrap layout">
  <div class="preview card">
    <CupcakeSvg {...colors} size={220} />
    <p class="price">${price.toFixed(2)}</p>
    <button class="btn" disabled={!valid} on:click={() => addCustom(recipe)}>Add to cart</button>
  </div>

  <div>
    <h1>Build your own</h1>
    {#each TYPES as t}
      <h3>{TYPE_LABELS[t]}</h3>
      <div class="chips">
        {#each $options.filter((o) => o.type === t) as o (o.id)}
          <label class="chip" class:on={recipe[t] === o.id}>
            <input type="radio" name={t} value={o.id} bind:group={recipe[t]} />
            <span
              class="dot"
              style:background={o.color?.endsWith('00') ? 'transparent' : (o.color ?? 'transparent')}
            ></span>
            {o.name}
            {#if o.price}<small>+${o.price.toFixed(2)}</small>{/if}
          </label>
        {/each}
      </div>
    {/each}
  </div>
</section>

<style>
  .layout { display: grid; gap: 2rem; grid-template-columns: 280px 1fr; align-items: start; }
  .preview { text-align: center; position: sticky; top: 1rem; }
  .chips { display: flex; flex-wrap: wrap; gap: .5rem; }
  .chip { display: flex; align-items: center; gap: .4rem; margin: 0; padding: .35rem .8rem; border: 1.5px solid var(--mocha);
          border-radius: 999px; cursor: pointer; background: #fff8ef; }
  .chip.on { background: var(--cocoa); color: var(--cream); border-color: var(--cocoa); }
  .chip input { position: absolute; opacity: 0; width: 0; }
  .chip:focus-within { outline: 3px solid var(--caramel); }
  .dot { width: 14px; height: 14px; border-radius: 50%; border: 1px solid #0003; }
  small { opacity: .75; }
  @media (max-width: 720px) { .layout { grid-template-columns: 1fr; } .preview { position: static; } }
</style>