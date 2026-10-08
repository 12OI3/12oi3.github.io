// Small, local SVG icons inherit the link's color and keep labels accessible.
const shapes = {
  star: '<path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L2.9 9.6l6.3-.9Z"/>',
  resume: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z"/><path d="M14 3v5h5M8 12h8M8 16h6"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7M11 17v-7m0 3a3 3 0 0 1 6 0v4"/><circle cx="7" cy="7" r=".7" fill="currentColor" stroke="none"/>',
  github: '<path d="M9 20c-4 1-4-2-6-2m6 4v-4c-4-1-5-3-5-6 0-2 1-3 2-4 0-1-1-3 0-4l4 2h4l4-2c1 1 0 3 0 4 1 1 2 2 2 4 0 3-1 5-5 6v4"/>',
  'itch.io': '<path d="M4 10v11h16V10M3 4h18l1 5c-1 2-3 2-4 0-1 2-3 2-4 0-1 2-3 2-4 0-1 2-3 2-4 0-1 2-3 2-4 0Z"/><path d="M9 21v-6h6v6"/>',
  steam: '<circle cx="16.5" cy="7.5" r="5"/><circle cx="16.5" cy="7.5" r="2"/><circle cx="7" cy="17" r="3"/><path d="m1 13 6 4m2.5-2 3.5-4m-3 8 7-7"/>',
  arrow: '<path d="M5 19 19 5M5 5h14v14"/>',
  up: '<path d="M5 4h14M12 20V8m-6 6 6-6 6 6"/>',
};

export function icon(name) {
  const key = String(name).toLowerCase();
  return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${shapes[key === 'contact' ? 'email' : key] || shapes.arrow}</svg>`;
}
