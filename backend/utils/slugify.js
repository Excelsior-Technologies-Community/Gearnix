/**
 * Turn a display name into a URL-friendly "slug".
 *   "Gaming Keyboards!" → "gaming-keyboards"
 *
 * Used for categories, products and blogs so their pages can live at clean
 * URLs like /category/gaming-keyboards instead of /category/12.
 */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric runs → single dash
    .replace(/^-+|-+$/g, '');     // trim leading/trailing dashes
}

module.exports = slugify;
