<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { view, message, authReady } from '../stores/index.js';
  import type { View } from '../stores/index.js';
  import { initAuth } from '../controllers/authController.js';
  import { loadCatalog } from '../controllers/catalogController.js';
  import Header from './Header.svelte';
  import Catalog from './Catalog.svelte';
  import Builder from './Builder.svelte';
  import Cart from './Cart.svelte';
  import Auth from './Auth.svelte';
  import Dashboard from './Dashboard.svelte';

  const screens: Record<View, typeof Catalog> = {
    catalog: Catalog,
    builder: Builder,
    cart: Cart,
    auth: Auth,
    dashboard: Dashboard
  };

  let off: (() => void) | undefined;
  let catalogReady = false;

  onMount(async () => {
    off = initAuth();
    await loadCatalog();
    catalogReady = true;
  });

  onDestroy(() => off?.());
</script>

<Header />
<main>
  {#if catalogReady && $authReady}
    <svelte:component this={screens[$view]} />
  {:else}
    <p class="wrap muted">Warming up the oven…</p>
  {/if}
</main>
{#if $message}<div class="toast" role="status">{$message}</div>{/if}

<style>
  .toast { position: fixed; bottom: 1.2rem; left: 50%; transform: translateX(-50%); background: var(--espresso);
           color: var(--cream); padding: .7rem 1.2rem; border-radius: 999px; }
</style>