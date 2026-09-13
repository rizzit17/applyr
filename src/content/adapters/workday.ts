/**
 * Workday Custom ATS Adapter
 * Handles Workday-specific search boxes, prompt triggers, and multi-step custom inputs.
 */

export function isWorkdaySite(): boolean {
  return (
    window.location.hostname.includes('myworkdayjobs.com') ||
    document.querySelector('[data-automation-id]') !== null
  );
}

export async function fillWorkdayCustomField(
  el: HTMLElement,
  targetValue: string
): Promise<boolean> {
  try {
    const automationId = el.getAttribute('data-automation-id') || '';

    // Workday dropdown / prompt button
    if (
      automationId.includes('select') ||
      automationId.includes('dropdown') ||
      el.getAttribute('role') === 'button'
    ) {
      el.click();
      await new Promise((r) => setTimeout(r, 100));

      const popup = document.querySelector('[data-automation-id="popupWidget"], [role="listbox"]');
      if (popup) {
        const normTarget = targetValue.toLowerCase().trim();
        const options = Array.from(
          popup.querySelectorAll('[data-automation-id="select-item"], [role="option"], li')
        );

        for (const opt of options) {
          const text = (opt.textContent || '').toLowerCase().trim();
          if (text.includes(normTarget) || normTarget.includes(text)) {
            (opt as HTMLElement).click();
            return true;
          }
        }
      }
    }

    return false;
  } catch (err) {
    console.warn('Workday adapter error:', err);
    return false;
  }
}
