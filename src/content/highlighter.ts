/**
 * In-page Visual Highlighter & Status Feedback
 * Provides colored outlines and floating banners for autofilled & flagged fields.
 * Follows system_design.md and antigravity_prompt.md (Phase 7).
 */

const HIGHLIGHT_STYLE_ID = 'applyr-highlight-styles';

export function injectHighlightStyles(): void {
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = `
    .autofill-highlight-high,
    .autofill-highlight-medium,
    .autofill-highlight-manual {
      outline: none !important;
      box-shadow: none !important;
    }
    .autofill-resume-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #4F46E5;
      color: #FFFFFF;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 12px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
      margin-top: 6px;
      margin-bottom: 6px;
      animation: autofillFadeIn 0.3s ease-out;
      z-index: 999999;
    }
    @keyframes autofillFadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

export function clearHighlights(): void {
  document.querySelectorAll('.autofill-highlight-high, .autofill-highlight-medium, .autofill-highlight-manual').forEach((el) => {
    el.classList.remove('autofill-highlight-high', 'autofill-highlight-medium', 'autofill-highlight-manual');
  });
  document.querySelectorAll('.autofill-resume-badge').forEach((el) => el.remove());
}

export function highlightField(
  el: HTMLElement,
  _type: 'high' | 'medium' | 'manual',
  titleTooltip?: string
): void {
  injectHighlightStyles();
  el.classList.remove('autofill-highlight-high', 'autofill-highlight-medium', 'autofill-highlight-manual');

  if (titleTooltip) {
    el.setAttribute('title', titleTooltip);
  }
}

export function promptResumeFile(fileInputEl: HTMLElement, resumeFileName: string): void {
  injectHighlightStyles();
  highlightField(fileInputEl, 'manual', `Please attach: ${resumeFileName}`);

  // Prevent duplicate badges
  const existing = fileInputEl.parentElement?.querySelector('.autofill-resume-badge');
  if (existing) return;

  const badge = document.createElement('div');
  badge.className = 'autofill-resume-badge';
  badge.innerHTML = `📎 <strong>Attach Resume:</strong> ${escapeHtml(resumeFileName)}`;

  if (fileInputEl.nextSibling) {
    fileInputEl.parentElement?.insertBefore(badge, fileInputEl.nextSibling);
  } else {
    fileInputEl.parentElement?.appendChild(badge);
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
