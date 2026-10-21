import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { browserAssets } from '../scripts/browser-assets.js';

test('browser asset audit follows nested imports and identifies missing modules and styles', async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'portfolio-browser-assets-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'modules'));
  await writeFile(path.join(root, 'site.js'), "import { init } from './modules/feature.js'; init();");
  await writeFile(path.join(root, 'site.css'), "@import url('./modules/feature.css');");
  await assert.rejects(browserAssets(root), /site.js: missing browser asset modules\/feature.js/);
  await writeFile(path.join(root, 'modules/feature.js'), "export { init } from './shared.js';");
  await writeFile(path.join(root, 'modules/shared.js'), 'export function init() {}');
  await assert.rejects(browserAssets(root), /site.css: missing browser asset modules\/feature.css/);
  await writeFile(path.join(root, 'modules/feature.css'), "@import url('https://fonts.example/font.css'); .card { color: gold }");
  assert.deepEqual([...(await browserAssets(root)).keys()].sort(), [
    'modules/feature.css', 'modules/feature.js', 'modules/shared.js', 'site.css', 'site.js',
  ]);
  await writeFile(path.join(root, 'modules/shared.js'), "import './feature.js'; export function init() {}");
  assert.equal((await browserAssets(root)).size, 5, 'Shared imports/cycles are visited only once');
  await writeFile(path.join(root, 'modules/shared.js'), "import '../../outside.js';");
  await assert.rejects(browserAssets(root), /browser asset escapes public/);
});
