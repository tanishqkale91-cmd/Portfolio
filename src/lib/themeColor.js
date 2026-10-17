export function themeColor(token) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}
