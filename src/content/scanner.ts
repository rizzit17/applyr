/**
 * Form Detection Engine
 * Based on system_design.md and antigravity_prompt.md (Phase 2).
 * Recursively scans forms, same-origin iframes, and open shadow roots.
 */

import { DetectedField, ElementType } from '../core/types';
import { computeFieldSignature } from '../core/hash';

export interface ScanResult {
  fields: DetectedField[];
  hasCrossOriginIframes: boolean;
  crossOriginIframeUrls: string[];
}

/**
 * Checks if an element is visible to the user.
 */
export function isVisible(el: HTMLElement): boolean {
  try {
    if (!el || !el.isConnected) return false;

    // Check type=hidden
    if (el instanceof HTMLInputElement && el.type === 'hidden') return false;

    // Check hidden attribute
    if (el.hasAttribute('hidden')) return false;

    // Computed style checks
    const style = window.getComputedStyle(el);
    if (style.display === 'none') return false;
    if (style.visibility === 'hidden') return false;
    if (style.opacity === '0') return false;

    // In JSDOM, getBoundingClientRect() returns all 0s for all elements.
    const isJSDOM =
      typeof navigator !== 'undefined' &&
      navigator.userAgent &&
      navigator.userAgent.toLowerCase().includes('jsdom');

    if (!isJSDOM) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        // Some custom file uploaders hide the actual input element offscreen with 0 size
        if (el instanceof HTMLInputElement && el.type === 'file') {
          return true;
        }
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if an input is an auxiliary "Other" text field attached to a radio/checkbox option.
 * These inputs must not be treated as standalone question fields; they are handled
 * by the parent radiogroup/checkbox when the "Other" option is chosen.
 */
export function isAuxiliaryOtherInput(el: HTMLElement): boolean {
  if (!(el instanceof HTMLInputElement)) return false;
  if (el.type !== 'text' && el.type !== '') return false;

  // 1. Google Forms specific class
  if (el.classList.contains('Hvn9fb')) return true;

  // 2. aria-label matches "Other response", "Other:", or "Other"
  const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase().trim();
  if (
    ariaLabel === 'other response' ||
    ariaLabel === 'other' ||
    ariaLabel === 'other:' ||
    ariaLabel.startsWith('other response') ||
    ariaLabel.startsWith('other:')
  ) {
    return true;
  }

  // 3. Inside a custom ARIA radio option or checkbox option
  if (el.closest('[role="radio"], [role="checkbox"]')) {
    return true;
  }

  // 4. Inside a label that already contains a radio or checkbox input
  const parentLabel = el.closest('label');
  if (parentLabel && parentLabel.querySelector('input[type="radio"], input[type="checkbox"]')) {
    const labelText = (parentLabel.textContent || '').toLowerCase();
    if (labelText.includes('other')) {
      return true;
    }
  }

  // 5. Sibling or child within Google Forms / Material Wiz toggle option container
  const parentOption = el.closest('.docssharedWHey6d, .appsMaterialWizToggleRadiogroupEl, [data-value="__other_option__"]');
  if (parentOption) {
    return true;
  }

  return false;
}

/**
 * Resolves label context for a given form element following the priority chain:
 * <label for> -> wrapping <label> -> aria-labelledby -> aria-label -> placeholder -> preceding text
 */
export function resolveLabelContext(el: HTMLElement, doc: Document | ShadowRoot): {
  labelText: string;
  nearbyText: string;
} {
  let labelText = '';
  let nearbyText = '';

  try {
    const elId = el.id ? el.id.trim() : '';

    // 1. <label for="...">
    if (elId) {
      try {
        const forLabel = doc.querySelector(`label[for="${CSS.escape(elId)}"]`);
        if (forLabel && forLabel.textContent) {
          labelText = forLabel.textContent.trim();
        }
      } catch {
        // In case CSS.escape is problematic or selector fails
      }
    }

    // 2. Wrapping <label>
    if (!labelText) {
      const parentLabel = el.closest('label');
      if (parentLabel && parentLabel.textContent) {
        // Clone and remove inputs to get just the label text
        const clone = parentLabel.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('input, select, textarea, button').forEach((child) => child.remove());
        labelText = clone.textContent?.trim() || '';
      }
    }

    // 3. aria-labelledby
    if (!labelText && el.getAttribute('aria-labelledby')) {
      const labelledBy = el.getAttribute('aria-labelledby') || '';
      const ids = labelledBy.split(/\s+/);
      const parts: string[] = [];
      for (const id of ids) {
        if (!id) continue;
        try {
          const refEl = doc.querySelector(`#${CSS.escape(id)}`);
          if (refEl && refEl.textContent) {
            parts.push(refEl.textContent.trim());
          }
        } catch {
          // Ignore
        }
      }
      if (parts.length > 0) {
        labelText = parts.join(' ');
      }
    }

    // 4. aria-label
    if (!labelText && el.getAttribute('aria-label')) {
      labelText = el.getAttribute('aria-label')?.trim() || '';
    }

    // 5. Preceding sibling or parent form-group header
    const container = el.closest(
      '.form-group, .form-row, .field, .input-group, [data-automation-id], .jobs-easy-apply-form-section__grouping, .Qr7Oae, [role="listitem"]'
    ) || el.parentElement;

    if (container) {
      // Look for headings, legends, or label-like elements in the container
      const headerEl = container.querySelector(
        'label, legend, .label, [role="heading"], h3, h4, span.text-label, [data-automation-id*="label"], .M7eMe, .HoPnR'
      );
      if (headerEl && headerEl !== el && headerEl.textContent) {
        nearbyText = headerEl.textContent.trim();
        if (!labelText) {
          labelText = nearbyText;
        }
      }
    }

    // 6. Preceding sibling text if still empty
    if (!labelText && el.previousElementSibling) {
      const prev = el.previousElementSibling;
      if (['LABEL', 'SPAN', 'DIV', 'P', 'H4'].includes(prev.tagName) && prev.textContent) {
        labelText = prev.textContent.trim();
      }
    }
  } catch (err) {
    console.warn('Error resolving label context:', err);
  }

  return { labelText, nearbyText };
}

/**
 * Determines the normalized element type.
 */
export function determineElementType(el: HTMLElement): ElementType {
  const tagName = el.tagName.toLowerCase();
  const role = (el.getAttribute('role') || '').toLowerCase();

  if (role === 'radio') return 'radio';
  if (role === 'checkbox') return 'checkbox';
  if (role === 'radiogroup') return 'radio';
  if (role === 'listbox') return 'select';
  if (role === 'combobox') return 'combobox';

  if (tagName === 'textarea') return 'textarea';
  if (tagName === 'select') return 'select';

  if (tagName === 'input') {
    const input = el as HTMLInputElement;
    const type = (input.type || 'text').toLowerCase();
    if (type === 'radio') return 'radio';
    if (type === 'checkbox') return 'checkbox';
    if (type === 'file') return 'file';
    return 'text';
  }

  if (el.getAttribute('contenteditable') === 'true') return 'contenteditable';

  return 'unknown';
}

/**
 * Recursively scans a document, shadow DOM, and same-origin iframes.
 */
export function scanForm(root: Document | ShadowRoot = document): ScanResult {
  const fields: DetectedField[] = [];
  const crossOriginIframeUrls: string[] = [];
  let hasCrossOriginIframes = false;

  try {
    // Primary query selector for fillable candidates (including Google Forms)
    const selector = [
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"])',
      'textarea',
      'select',
      '[role="combobox"]',
      '[contenteditable="true"]',
      '[role="radiogroup"]',
      '[role="radio"]',
      '[role="checkbox"]',
    ].join(', ');

    const candidates = Array.from(root.querySelectorAll<HTMLElement>(selector));

    for (const el of candidates) {
      if (!isVisible(el)) continue;

      // Skip auxiliary "Other" text inputs belonging to radio/checkbox groups
      if (isAuxiliaryOtherInput(el)) continue;

      // Skip child [role="radio"] if their parent [role="radiogroup"] is being scanned
      if (el.getAttribute('role') === 'radio' && el.parentElement?.closest('[role="radiogroup"]')) {
        continue;
      }

      const elementType = determineElementType(el);
      const inputEl = el instanceof HTMLInputElement ? el : null;
      const htmlType = inputEl ? inputEl.type : undefined;
      const name = (el.getAttribute('name') || '').trim();
      const id = (el.getAttribute('id') || '').trim();
      const placeholder = (el.getAttribute('placeholder') || '').trim();
      const autocomplete = (el.getAttribute('autocomplete') || '').trim();
      const disabled = (el as HTMLInputElement).disabled || el.getAttribute('aria-disabled') === 'true';
      const readOnly = (el as HTMLInputElement).readOnly || el.getAttribute('aria-readonly') === 'true';

      const { labelText, nearbyText } = resolveLabelContext(el, root);

      // Collect select/radio options
      let options: string[] | undefined;
      if (el instanceof HTMLSelectElement) {
        options = Array.from(el.options).map((opt) => opt.text.trim());
      } else if (el.getAttribute('role') === 'radiogroup' || el.classList.contains('Qr7Oae')) {
        const radioEls = el.querySelectorAll<HTMLElement>('[role="radio"], input[type="radio"]');
        options = Array.from(radioEls)
          .map((r) => {
            const clone = r.cloneNode(true) as HTMLElement;
            clone.querySelectorAll('input, textarea').forEach((c) => c.remove());
            return (r.getAttribute('data-value') || r.getAttribute('aria-label') || clone.textContent || '').trim();
          })
          .filter((t) => t.length > 0 && !t.toLowerCase().startsWith('other') && t !== '__other_option__');
      }

      const fieldSignature = computeFieldSignature({
        name,
        id,
        labelText,
        placeholder,
        type: elementType,
      });

      fields.push({
        id: id || `field_${fields.length}_${Math.random().toString(36).slice(2, 7)}`,
        name,
        type: elementType,
        htmlType,
        placeholder,
        autocomplete,
        labelText,
        nearbyText,
        fieldSignature,
        options,
        element: el,
        disabled,
        readOnly,
        isInsideShadowRoot: root instanceof ShadowRoot,
      });
    }

    // Recurse into open Shadow DOM
    const allElements = root.querySelectorAll('*');
    for (const el of Array.from(allElements)) {
      if (el.shadowRoot) {
        try {
          const shadowResult = scanForm(el.shadowRoot);
          fields.push(...shadowResult.fields);
          if (shadowResult.hasCrossOriginIframes) {
            hasCrossOriginIframes = true;
            crossOriginIframeUrls.push(...shadowResult.crossOriginIframeUrls);
          }
        } catch (shadowErr) {
          console.warn('Error traversing shadow DOM:', shadowErr);
        }
      }
    }

    // Recurse into iframes
    const iframes = root.querySelectorAll<HTMLIFrameElement>('iframe');
    for (const iframe of Array.from(iframes)) {
      try {
        // Attempt to access contentDocument (will throw SecurityError if cross-origin)
        const iframeDoc = iframe.contentDocument;
        if (iframeDoc) {
          const iframeResult = scanForm(iframeDoc);
          for (const f of iframeResult.fields) {
            f.isInsideIframe = true;
            fields.push(f);
          }
          if (iframeResult.hasCrossOriginIframes) {
            hasCrossOriginIframes = true;
            crossOriginIframeUrls.push(...iframeResult.crossOriginIframeUrls);
          }
        } else {
          hasCrossOriginIframes = true;
          crossOriginIframeUrls.push(iframe.src || 'embedded-iframe');
        }
      } catch {
        // Cross-origin iframe security block
        hasCrossOriginIframes = true;
        crossOriginIframeUrls.push(iframe.src || 'cross-origin-iframe');
      }
    }
  } catch (err) {
    console.error('Fatal error during scanForm:', err);
  }

  // Deduplicate by element reference
  const seenElements = new Set<HTMLElement>();
  const deduplicated: DetectedField[] = [];
  for (const f of fields) {
    if (f.element && !seenElements.has(f.element)) {
      seenElements.add(f.element);
      deduplicated.push(f);
    }
  }

  return {
    fields: deduplicated,
    hasCrossOriginIframes,
    crossOriginIframeUrls,
  };
}
