<script lang="ts">
  import { cart, total, user, view, message, options, products } from '../stores/index.js';
  import { changeQty, remove, editCustom } from '../controllers/cartController.js';
  import { checkout } from '../controllers/orderController.js';
  import { lineTotal } from '../models/cartModel.js';
  import {
    TYPES, TYPE_LABELS, colorsFor, customPrice, isValidRecipe, recipeOf
  } from '../models/productModel.js';
  import type { CartItem, Recipe } from '../models/types.js';
  import CupcakeSvg from './CupcakeSvg.svelte';

  const MAX_QTY = 99;
  const blank = (): Recipe => ({ base: '', frosting: '', filling: '', topping: '' });

  let busy = false;

  // ── Editing a line's recipe ────────────────────────────────────────
  let editingKey: string | null = null;
  let original: Recipe = blank();
  let draft: Recipe = blank();

  $: draftColors = colorsFor(draft, $options);
  $: draftPrice = customPrice(draft, $options);
  $: draftValid = isValidRecipe(draft, $options);

  function startEdit(item: CartItem): void {
    const recipe = recipeOf(item, $products);
    if (!recipe) {
      message.set("This item can't be edited. Remove it and add it again.");
      return;
    }
    original = { ...recipe };
    draft = { ...recipe };
    editingKey = item.key;
  }

  function cancelEdit(): void {
    editingKey = null;
  }

  async function saveEdit(): Promise<void> {
    if (editingKey === null || !draftValid) return;
    const unchanged = TYPES.every((t) => draft[t] === original[t]);
    if (unchanged) return cancelEdit();
    try {
      await editCustom(editingKey, draft);
      cancelEdit();
    } catch (e) {
      message.set(e instanceof Error ? e.message : String(e));
    }
  }

  // ── Quantity ───────────────────────────────────────────────────────
  function onQtyChange(item: CartItem, e: Event): void {
    const input = e.currentTarget as HTMLInputElement;
    const qty = Math.min(Math.floor(Number(input.value)), MAX_QTY);
    // Empty / invalid / zero: put the old value back. Use "Remove" to delete a line.
    if (input.value.trim() === '' || !Number.isFinite(qty) || qty < 1) {
      input.value = String(item.qty);
      return;
    }
    changeQty(item.key, qty);
  }

  async function placeOrder(): Promise<void> {
    busy = true;
    try {
      await checkout();
    } catch (e) {
      message.set(e instanceof Error ? e.message : String(e));
    } finally {
      busy = false;
    }
  }
</script>

<section class="wrap">
  <h1>Your cart</h1>
  {#if !$cart.length}
    <p class="muted">
      Nothing here yet.
      <button class="btn ghost" on:click={() => view.set('catalog')}>Browse cupcakes</button>
    </p>
  {:else}
    <table>
      <tbody>
        {#each $cart as i (i.key)}
          <tr>
            <td style="width:70px"><CupcakeSvg {...i.colors} size={56} /></td>
            <td>
              <strong>{i.name}</strong>
              {#if i.detail}<br /><small class="muted">{i.detail}</small>{/if}
            </td>
            <td style="width:170px">
              <div class="qty">
                <button
                  class="btn ghost"
                  aria-label="Decrease quantity"
                  disabled={i.qty <= 1}
                  on:click={() => changeQty(i.key, i.qty - 1)}>−</button>
                <input
                  type="number"
                  min="1"
                  max={MAX_QTY}
                  step="1"
                  value={i.qty}
                  aria-label="Quantity"
                  on:change={(e) => onQtyChange(i, e)}
                />
                <button
                  class="btn ghost"
                  aria-label="Increase quantity"
                  disabled={i.qty >= MAX_QTY}
                  on:click={() => changeQty(i.key, i.qty + 1)}>+</button>
              </div>
            </td>
            <td class="price">${lineTotal(i).toFixed(2)}</td>
            <td>
              <button
                class="btn ghost"
                on:click={() => (editingKey === i.key ? cancelEdit() : startEdit(i))}>
                {editingKey === i.key ? 'Close' : 'Edit'}
              </button>
              <button class="btn ghost" on:click={() => remove(i.key)}>Remove</button>
            </td>
          </tr>

          {#if editingKey === i.key}
            <tr>
              <td colspan="5">
                <div class="editor card">
                  <div class="preview"><CupcakeSvg {...draftColors} size={90} /></div>
                  <div class="fields">
                    {#each TYPES as t}
                      <label for={'edit-' + t}>{TYPE_LABELS[t]}</label>
                      <select id={'edit-' + t} bind:value={draft[t]}>
                        {#each $options.filter((o) => o.type === t) as o (o.id)}
                          <option value={o.id}>
                            {o.name}{o.price ? ' (+$' + o.price.toFixed(2) + ')' : ''}
                          </option>
                        {/each}
                      </select>
                    {/each}
                    <p class="price">${draftPrice.toFixed(2)} each</p>
                    {#if !draftValid}
                      <p class="error" role="alert">
                        One of these flavours is no longer available. Pick another one.
                      </p>
                    {/if}
                    <button class="btn" disabled={!draftValid} on:click={saveEdit}>Save changes</button>
                    <button class="btn ghost" on:click={cancelEdit}>Cancel</button>
                  </div>
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
    <p class="price" style="font-size:1.4rem">Total: ${$total.toFixed(2)}</p>
    {#if $user}
      <button class="btn" disabled={busy} on:click={placeOrder}>
        {busy ? 'Placing order…' : 'Place order'}
      </button>
    {:else}
      <button class="btn" on:click={() => view.set('auth')}>Sign in to place your order</button>
    {/if}
  {/if}
</section>

<style>
  .qty { display: flex; align-items: center; gap: .25rem; }
  .qty input { width: 4rem; text-align: center; }
  .editor { display: grid; grid-template-columns: 100px 1fr; gap: 1rem; align-items: start; }
  .preview { text-align: center; }
  .fields select { width: 100%; }
  @media (max-width: 560px) { .editor { grid-template-columns: 1fr; } }
</style>