<script lang="ts">
  import { user, orders, products, message } from '../stores/index';
  import { loadOrders, setStatus, cancelOrder, canCancel } from '../controllers/orderController';
  import {
    loadAllProducts, setProductActive, loadAllOptions, setOptionActive
  } from '../controllers/catalogController';
  import { orderStats, STATUSES, type OrderStatus } from '../models/orderModel';
  import { TYPES, TYPE_LABELS } from '../models/productModel';
  import type { Order, Option, Product } from '../models/types';

  $: admin = $user?.role === 'admin';
  $: stats = orderStats($orders);

  // Whenever the user becomes known (or changes), refresh the data they can see.
  $: if ($user) {
    loadOrders();
    if (admin) refreshAdminData();
  }

  // Admin only: every flavour, including the hidden ones.
  let allOptions: Option[] = [];
  $: hiddenOptionIds = new Set(allOptions.filter((o) => o.active === false).map((o) => o.id));

  async function refreshAdminData(): Promise<void> {
    loadAllProducts();
    try {
      allOptions = await loadAllOptions();
    } catch (e) {
      console.error('[dashboard] failed to load flavours:', e);
    }
  }

  const usesHiddenOption = (p: Product, hidden: Set<string>): boolean =>
    TYPES.some((t) => hidden.has(p.recipe[t]));

  function when(o: Order): string {
    return typeof o.createdAt === 'number'
      ? new Date(o.createdAt).toLocaleString()
      : '…';
  }

  function onStatusChange(id: string, e: Event): void {
    const value = (e.currentTarget as HTMLSelectElement).value as OrderStatus;
    setStatus(id, value);
  }

  let cancelling: string | null = null;

  async function onCancel(o: Order): Promise<void> {
    if (!confirm('Cancel this order? This cannot be undone.')) return;
    cancelling = o.id;
    try {
      await cancelOrder(o.id);
    } catch {
      // cancelOrder already showed a message for server errors.
    } finally {
      cancelling = null;
    }
  }

  async function onOptionActiveChange(id: string, e: Event): Promise<void> {
    const checkbox = e.currentTarget as HTMLInputElement;
    try {
      allOptions = await setOptionActive(id, checkbox.checked);
    } catch (err) {
      console.error('[dashboard] setOptionActive failed:', err);
      checkbox.checked = !checkbox.checked;
      message.set('Could not update that flavour. Please try again.');
    }
  }

  function onActiveChange(id: string, e: Event): void {
    const checked = (e.currentTarget as HTMLInputElement).checked;
    setProductActive(id, checked);
  }
</script>

<section class="wrap">
  <h1>{admin ? 'Shop dashboard' : 'My orders'}</h1>

  {#if admin}
    <div class="grid stats">
      <div class="card"><small class="muted">Revenue</small><h2>${stats.revenue.toFixed(2)}</h2></div>
      <div class="card"><small class="muted">Orders</small><h2>{stats.count}</h2></div>
      <div class="card"><small class="muted">Cupcakes sold</small><h2>{stats.cupcakes}</h2></div>
      <div class="card"><small class="muted">To bake</small><h2>{stats.byStatus.pending + stats.byStatus.baking}</h2></div>
    </div>
  {/if}

  <h2 style="margin-top:1.5rem">Orders</h2>
  {#if !$orders.length}<p class="muted">No orders yet.</p>{/if}
  <table>
    <tbody>
      {#each $orders as o (o.id)}
        <tr>
          <td>
            {when(o)}
            {#if admin}<br /><small class="muted">{o.customer}</small>{/if}
          </td>
          <td>
            {#each o.items as i}
              <div>{i.qty}× {i.name}{#if i.detail} <small class="muted">({i.detail})</small>{/if}</div>
            {/each}
          </td>
          <td class="price">${o.total.toFixed(2)}</td>
          <td>
            {#if admin}
              <select
                value={o.status}
                aria-label="Order status"
                on:change={(e) => o.id && onStatusChange(o.id, e)}
              >
                {#each STATUSES as s}<option>{s}</option>{/each}
              </select>
            {:else}
              {o.status}
              {#if canCancel(o)}
                <br />
                <button
                  class="btn ghost"
                  disabled={cancelling === o.id}
                  on:click={() => onCancel(o)}>
                  {cancelling === o.id ? 'Cancelling…' : 'Cancel order'}
                </button>
              {/if}
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if admin}
    <h2 style="margin-top:2rem">Menu</h2>
    <table>
      <tbody>
        {#each $products as p (p.id)}
          <tr>
            <td>
              {p.name}
              {#if usesHiddenOption(p, hiddenOptionIds)}
                <br /><small class="muted">Hidden from the shop: uses a flavour that is turned off</small>
              {/if}
            </td>
            <td class="price">${p.price.toFixed(2)}</td>
            <td>
              <label style="margin:0">
                <input
                  type="checkbox"
                  style="width:auto"
                  checked={p.active}
                  on:change={(e) => onActiveChange(p.id, e)}
                />
                On sale
              </label>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <h2 style="margin-top:2rem">Flavours</h2>
    <p class="muted">
      Turn a flavour off to remove it from "Build your own". Ready-made cupcakes that use it
      are hidden from the shop until it is turned back on.
    </p>
    {#each TYPES as t}
      <h3>{TYPE_LABELS[t]}</h3>
      <table>
        <tbody>
          {#each allOptions.filter((o) => o.type === t) as o (o.id)}
            <tr>
              <td>{o.name}</td>
              <td class="price">{o.price ? '+$' + o.price.toFixed(2) : '—'}</td>
              <td>
                <label style="margin:0">
                  <input
                    type="checkbox"
                    style="width:auto"
                    checked={o.active !== false}
                    on:change={(e) => onOptionActiveChange(o.id, e)}
                  />
                  Available
                </label>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/each}
  {/if}
</section>