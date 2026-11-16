<script lang="ts">
  import { user, count, view } from '../stores/index.js';
  import type { View } from '../stores/index.js';
  import { logout } from '../controllers/authController.js';

  const tabs: ReadonlyArray<readonly [View, string]> = [
    ['catalog', 'Cupcakes'],
    ['builder', 'Build your own']
  ];
</script>

<header>
  <div class="wrap bar">
    <button class="brand" on:click={() => view.set('catalog')}>Petit Gâteau</button>
    <nav>
      {#each tabs as [id, label]}
        <button class:on={$view === id} on:click={() => view.set(id)}>{label}</button>
      {/each}
      {#if $user}
        <button class:on={$view === 'dashboard'} on:click={() => view.set('dashboard')}>
          {$user.role === 'admin' ? 'Dashboard' : 'My orders'}
        </button>
      {/if}
      <button class:on={$view === 'cart'} on:click={() => view.set('cart')}>Cart ({$count})</button>
      {#if $user}
        <button on:click={logout}>Sign out ({$user.name.split(' ')[0]})</button>
      {:else}
        <button class:on={$view === 'auth'} on:click={() => view.set('auth')}>Sign in</button>
      {/if}
    </nav>
  </div>
</header>

<style>
  header { background: var(--espresso); color: var(--cream); }
  .bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem; padding-block: .8rem; }
  .brand { font-size: 1.6rem; font-style: italic; background: none; border: 0; color: var(--milk); padding: 0; }
  nav { display: flex; gap: .25rem; flex-wrap: wrap; }
  nav button { background: none; border: 0; color: var(--mocha); padding: .4rem .7rem; border-radius: 999px; }
  nav button:hover, nav button.on { background: var(--cocoa); color: var(--cream); }
</style>