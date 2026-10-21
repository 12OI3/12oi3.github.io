import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

export function browserAssetVersion(files) {
  const hash = createHash('sha256');
  for (const [name, bytes] of [...files].sort(([a], [b]) => a.localeCompare(b))) {
    hash.update(name).update('\0').update(bytes).update('\0');
  }
  return hash.digest('hex').slice(0, 16);
}

// Follow the native browser modules/styles used by the entry points. The build
// copies public/ unchanged, so every relative import must resolve within it.
export async function browserAssets(publicRoot) {
  const root = path.resolve(publicRoot);
  const files = new Map();
  async function visit(filename, importer = 'entry point') {
    const relative = path.relative(root, filename);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`${importer}: browser asset escapes public/: ${filename}`);
    }
    const key = relative.split(path.sep).join('/');
    if (files.has(key)) return;
    let bytes;
    try { bytes = await readFile(filename); }
    catch { throw new Error(`${importer}: missing browser asset ${key}`); }
    files.set(key, bytes);
    const source = bytes.toString('utf8');
    const extension = path.extname(filename);
    const pattern = extension === '.js'
      ? /\b(?:import|export)\s+(?:[^;'"()]*?\s+from\s*)?['"]([^'"]+)['"]/g
      : extension === '.css' ? /(?:url\(\s*['"]?([^'"\s)]+)['"]?\s*\)|@import\s+['"]([^'"]+)['"])/g : null;
    if (!pattern) return;
    for (const match of source.matchAll(pattern)) {
      const reference = match[1] || match[2];
      if (/^(?:[a-z]+:|\/\/|#)/i.test(reference)) continue;
      const pathname = decodeURIComponent(reference.split(/[?#]/)[0]);
      if (extension === '.js' && !/^(?:\.|\/)/.test(pathname)) {
        throw new Error(`${key}: browser imports must use a relative or absolute URL (${reference})`);
      }
      const target = pathname.startsWith('/ui/')
        ? path.join(root, pathname.slice(4)) : path.resolve(path.dirname(filename), pathname);
      await visit(target, key);
    }
  }
  await visit(path.join(root, 'site.js'));
  await visit(path.join(root, 'site.css'));
  return files;
}
