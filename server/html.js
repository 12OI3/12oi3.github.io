export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

// Old Markdown includes spaces in local URLs. Encode those paths without
// changing link text or stored content. Keep # in article filenames as %23.
export function localUrl(value) {
  if (!value?.startsWith('/')) return value || '';
  const fragment = value.startsWith('/article/') ? (value.match(/\/(#[^/]*)$/)?.[1] || '') : (value.match(/#[^/]*$/)?.[0] || '');
  const pathname = fragment ? value.slice(0, -fragment.length) : value;
  return pathname.split('/').map(segment => {
    try { return encodeURIComponent(decodeURIComponent(segment)); } catch { return encodeURIComponent(segment); }
  }).join('/') + fragment;
}
