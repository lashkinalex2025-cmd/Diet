/**
 * Post-build for GitHub Pages:
 * - SPA fallback 404.html
 * - .nojekyll so underscore/asset paths are not ignored
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const index = path.join(dist, 'index.html');

if (!fs.existsSync(index)) {
  console.error('dist/index.html not found — run build first');
  process.exit(1);
}

fs.copyFileSync(index, path.join(dist, '404.html'));
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
console.log('Prepared dist for GitHub Pages (404.html, .nojekyll)');
