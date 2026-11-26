// Temporary bootstrap export, only public npm-registry dependencies and no credentials.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const bytes = readFileSync('package-lock.json');
const lock = JSON.parse(bytes.toString('utf8'));
if (lock.lockfileVersion !== 3 || lock.name !== 'seniosk-frontend') throw new Error('Unexpected lockfile');
for (const [name, pkg] of Object.entries(lock.packages ?? {})) {
  if (!name) continue;
  const u = new URL(pkg.resolved);
  if (u.origin !== 'https://registry.npmjs.org' || u.username || u.password || u.search || u.hash) {
    throw new Error('Refuse to export lockfile with non-public registry resolution');
  }
}
if (bytes.length > 2_000_000) throw new Error('Unexpected lockfile size');
const base64 = bytes.toString('base64');
console.log('LOCK_SHA256 ' + createHash('sha256').update(bytes).digest('hex'));
console.log('LOCK_BYTES ' + bytes.length);
for (let i = 0; i < base64.length; i += 4096) {
  console.log('LOCK_CHUNK ' + (i / 4096) + ' ' + base64.slice(i, i + 4096));
}
console.log('LOCK_END ' + Math.ceil(base64.length / 4096));
