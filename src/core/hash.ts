/**
 * Generates stable, deterministic field signatures for per-site learning and caching.
 * Follows system_design.md specifications.
 */

export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // treat underscores and symbols as separators
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
}

/**
 * FNV-1a 32-bit hash implementation
 */
export function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Creates a stable signature for a DOM field based on its identifiers and label text.
 */
export function computeFieldSignature(params: {
  name?: string;
  id?: string;
  labelText?: string;
  placeholder?: string;
  type?: string;
}): string {
  const normName = normalizeText(params.name);
  const normId = normalizeText(params.id);
  const normLabel = normalizeText(params.labelText);
  const normPlaceholder = normalizeText(params.placeholder);

  // Combine primary signals in standard canonical form
  const rawKey = `${normName}|${normId}|${normLabel}|${normPlaceholder}`;
  const hashVal = fnv1a(rawKey);

  // Return formatted signature prefix + hash
  const shortTag = (normLabel || normName || normPlaceholder || 'field').slice(0, 16).replace(/\s+/g, '_');
  return `${shortTag}_${hashVal}`;
}
