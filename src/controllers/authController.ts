import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '../services/firebase';
import { user, authReady, cart, orders, view } from '../stores/index';
import { loadCart } from './cartController';
import type { AppUser, Role } from '../models/types';

interface UserRecord {
  name?: string;
  email?: string;
  role?: Role;
}

// Simple in-flight guard to prevent duplicate concurrent auth requests
let authInFlight = false;

export function initAuth(): () => void {
  return onAuthStateChanged(auth, async (u: FirebaseUser | null) => {
    try {
      if (!u) {
        user.set(null);
        cart.set([]);
        orders.set([]);
      } else {
        const snap = await get(ref(db, `users/${u.uid}`));
        const data: UserRecord = snap.val() ?? {};
        const appUser: AppUser = {
          uid: u.uid,
          email: u.email ?? '',
          name: data.name ?? u.displayName ?? u.email ?? '',
          role: data.role ?? 'customer',
        };
        user.set(appUser);
        await loadCart(u.uid);
      }
    } catch (e) {
      console.error('[initAuth] failed to hydrate user:', e);
    } finally {
      authReady.set(true);
    }
  });
}

export async function register(name: string, email: string, password: string): Promise<void> {
  if (authInFlight) {
    console.warn('[register] blocked: another auth request is in flight');
    return;
  }
  authInFlight = true;
  try {
    const { user: u } = await createUserWithEmailAndPassword(auth, email, password);

    // Best-effort profile update; don't fail registration if this hiccups
    try {
      await updateProfile(u, { displayName: name });
    } catch (e) {
      console.warn('[register] updateProfile failed:', e);
    }

    // Persist user record; log if it fails but don't block the user
    try {
      await set(ref(db, `users/${u.uid}`), { name, email, role: 'customer' });
    } catch (e) {
      console.error('[register] failed to write user record:', e);
    }

    user.set({ uid: u.uid, email, name, role: 'customer' });
    view.set('catalog');
  } catch (e) {
    console.error('[register] error:', (e as { code?: string }).code, (e as Error).message);
    throw e;
  } finally {
    authInFlight = false;
  }
}

export async function login(email: string, password: string): Promise<void> {
  if (authInFlight) {
    console.warn('[login] blocked: another auth request is in flight');
    return;
  }
  authInFlight = true;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    view.set('catalog');
  } catch (e) {
    console.error('[login] error:', (e as { code?: string }).code, (e as Error).message);
    throw e;
  } finally {
    authInFlight = false;
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
    view.set('catalog');
  } catch (e) {
    console.error('[logout] error:', e);
    throw e;
  }
}

export const friendlyError = (e: unknown): string => {
  const code = (e as { code?: string }).code ?? '';
  const map: Record<string, string> = {
    'auth/invalid-credential': 'Wrong email or password.',
    'auth/invalid-email': 'That email address looks invalid.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many attempts. Please wait a minute and try again.',
    'auth/email-already-in-use': 'That email already has an account. Try signing in.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
  };
  return map[code] ?? (e as Error).message;
};