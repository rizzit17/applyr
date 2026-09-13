/**
 * React-Select / Div-based Combobox Adapter
 * Handles opening custom div/aria comboboxes and clicking the matching option.
 */

export async function fillReactSelectCombobox(
  comboboxEl: HTMLElement,
  targetValue: string
): Promise<boolean> {
  try {
    // 1. Click to open dropdown
    comboboxEl.focus();
    comboboxEl.click();

    // Small delay to allow menu options to mount
    await new Promise((r) => setTimeout(r, 60));

    // 2. Search for option elements in the document or nearby menu
    const menuId = comboboxEl.getAttribute('aria-controls') || comboboxEl.getAttribute('aria-owns');
    let menuEl: Element | null = null;

    if (menuId) {
      menuEl = document.getElementById(menuId);
    }

    const candidateOptions = menuEl
      ? Array.from(menuEl.querySelectorAll('[role="option"], div[class*="-option"]'))
      : Array.from(
          document.querySelectorAll(
            '[role="listbox"] [role="option"], div[class*="-menu"] div[class*="-option"], div[class*="react-select"][class*="option"]'
          )
        );

    const normTarget = targetValue.toLowerCase().trim();

    // Find best match: exact match first, then substring
    let matchedOption: HTMLElement | null = null;
    for (const opt of candidateOptions) {
      const text = (opt.textContent || '').toLowerCase().trim();
      if (text === normTarget) {
        matchedOption = opt as HTMLElement;
        break;
      }
    }

    if (!matchedOption) {
      for (const opt of candidateOptions) {
        const text = (opt.textContent || '').toLowerCase().trim();
        if (text.includes(normTarget) || normTarget.includes(text)) {
          matchedOption = opt as HTMLElement;
          break;
        }
      }
    }

    if (matchedOption) {
      matchedOption.click();
      return true;
    }

    // If no option clicked, close menu by blurring
    comboboxEl.blur();
    return false;
  } catch (err) {
    console.warn('React-Select adapter error:', err);
    return false;
  }
}
