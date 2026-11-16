// scripts/seed.mjs
import 'dotenv/config';                      // ← add this first
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { options, products } from '../src/seed/data.ts';

const url = process.env.FIREBASE_DATABASE_URL;
if (!url) {
  console.error('FIREBASE_DATABASE_URL is missing. Add it to .env or set the env var.');
  process.exit(1);
}

const byId = (list) =>
  Object.fromEntries(list.map(({ id, ...rest }) => [id, rest]));

initializeApp({ credential: applicationDefault(), databaseURL: url });

await getDatabase().ref().update({
  options: byId(options),
  products: byId(products),
});

console.log(`Seeded ${options.length} options and ${products.length} products.`);
process.exit(0);