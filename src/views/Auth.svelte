<script lang="ts">
  import { login, register, friendlyError } from '../controllers/authController.js';

  type Mode = 'login' | 'register';

  let mode: Mode = 'login';
  let name = '';
  let email = '';
  let password = '';
  let error = '';
  let busy = false;

  async function submit(): Promise<void> {
    error = '';
    busy = true;
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
    } catch (e) {
      error = friendlyError(e);
    } finally {
      busy = false;
    }
  }

  function toggleMode(): void {
    mode = mode === 'login' ? 'register' : 'login';
  }
</script>

<section class="wrap" style="max-width:420px">
  <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
  <form class="card" on:submit|preventDefault={submit}>
    {#if mode === 'register'}
      <label for="n">Name</label><input id="n" bind:value={name} required />
    {/if}
    <label for="e">Email</label><input id="e" type="email" bind:value={email} required />
    <label for="p">Password</label><input id="p" type="password" minlength="6" bind:value={password} required />
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    <p><button class="btn" disabled={busy}>{mode === 'login' ? 'Sign in' : 'Create account'}</button></p>
    <button type="button" class="btn ghost" on:click={toggleMode}>
      {mode === 'login' ? 'New here? Create an account' : 'Have an account? Sign in'}
    </button>
  </form>
</section>