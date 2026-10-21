export function displayDate(value) {
  return String(value ?? '').replace(/^(\d{4}-\d{2}(?:-\d{2})?)[a-z]+$/i, '$1');
}
