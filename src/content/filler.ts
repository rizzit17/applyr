/**
 * Autofill Execution Engine
 * Based on system_design.md and antigravity_prompt.md (Phase 4).
 * Handles framework-safe DOM writes (React/Vue/Angular bypass), select/radio/combobox adapters,
 * and visual highlighting.
 */

import { DetectedField, FieldGuess, FillOutcome } from '../core/types';
import { fillReactSelectCombobox } from './adapters/reactSelect';
import { fillWorkdayCustomField, isWorkdaySite } from './adapters/workday';
import { highlightField, promptResumeFile } from './highlighter';

/**
 * Sets input/textarea value bypassing React synthetic event wrapper.
 */
function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const prototype =
    element instanceof HTMLInputElement
      ? window.HTMLInputElement.prototype
      : window.HTMLTextAreaElement.prototype;

  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  if (descriptor && descriptor.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }
}

/**
 * Dispatches necessary bubbling events to trigger reactive framework state updates.
 */
function dispatchInputEvents(element: HTMLElement, simulateKeystroke = false): void {
  // Focus before typing
  element.focus();

  if (simulateKeystroke) {
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'a' }));
    element.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, key: 'a' }));
  }

  // Standard input & change events
  element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

  if (simulateKeystroke) {
    element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'a' }));
  }

  // Blur after change (triggers ATS form validation)
  element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
}

/**
 * Handles filling a <select> element.
 */
function fillSelectElement(select: HTMLSelectElement, targetValue: string): boolean {
  const normTarget = targetValue.toLowerCase().trim();

  // 1. Direct value match
  for (let i = 0; i < select.options.length; i++) {
    const opt = select.options[i];
    if (opt.value.toLowerCase().trim() === normTarget) {
      select.selectedIndex = i;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  }

  // 2. Exact text match
  for (let i = 0; i < select.options.length; i++) {
    const opt = select.options[i];
    if (opt.text.toLowerCase().trim() === normTarget) {
      select.selectedIndex = i;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  }

  // 3. Substring / fuzzy match
  for (let i = 0; i < select.options.length; i++) {
    const opt = select.options[i];
    const text = opt.text.toLowerCase().trim();
    if (text.includes(normTarget) || normTarget.includes(text)) {
      select.selectedIndex = i;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  }

  return false;
}

/**
 * Normalizes text for comparison by removing punctuation and extra whitespace.
 */
function cleanText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Clicks a radio element safely, dispatching focus, mouse events, native click,
 * and clicking any inner toggle element for frameworks like Google Forms Wiz.
 */
/**
 * Clicks a radio element safely, dispatching focus, mouse events, native click,
 * and clicking any inner toggle element for frameworks like Google Forms Wiz.
 */
function clickRadioElement(opt: HTMLElement): void {
  try {
    opt.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  } catch {
    // Ignore scroll failure
  }

  // Remove any blocking aria-disabled or pointer-events: none on the radio or its container
  opt.removeAttribute('aria-disabled');
  opt.style.pointerEvents = 'auto';

  const label = opt.closest<HTMLElement>('label, .docssharedWizToggleLabeledContainer');
  if (label) {
    label.removeAttribute('aria-disabled');
    label.style.pointerEvents = 'auto';
  }

  try {
    opt.focus();
  } catch {
    // Ignore focus failure
  }

  // Find all clickable targets: label, inner circle, text span, and radio container
  const circle =
    opt.querySelector<HTMLElement>(
      '.AB7Lab, .vd3tt, .rseUEf, div[class*="exportInnerCircle"], .quantumWizTogglePaperradioEl, [role="presentation"]'
    ) || (opt.firstElementChild as HTMLElement);
  const textSpan = label?.querySelector<HTMLElement>('.aDTYNe, span');

  const targets = [label, circle, textSpan, opt].filter(Boolean) as HTMLElement[];

  // 1. Direct clicks on label, circle, and opt
  if (label) {
    label.click();
  }
  if (circle && circle !== label) {
    circle.click();
  }
  opt.click();

  // 2. Full pointer and mouse event sequence for reactive framework controllers (Google Forms Wiz, React, etc.)
  for (const target of targets) {
    if (typeof PointerEvent !== 'undefined') {
      try {
        target.dispatchEvent(
          new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse', isPrimary: true })
        );
      } catch {
        // Ignore PointerEvent failure
      }
    }
    target.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, buttons: 1 })
    );
    if (typeof PointerEvent !== 'undefined') {
      try {
        target.dispatchEvent(
          new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerType: 'mouse', isPrimary: true })
        );
      } catch {
        // Ignore PointerEvent failure
      }
    }
    target.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0, buttons: 0 })
    );
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  }

  // 3. Ensure aria-checked is set on the radio option
  if (opt.getAttribute('role') === 'radio') {
    opt.setAttribute('aria-checked', 'true');
  }

  // 4. Dispatch change event to notify any listeners
  opt.dispatchEvent(new Event('change', { bubbles: true }));
  const group = opt.closest('[role="radiogroup"]');
  if (group) {
    group.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

/**
 * Handles radio / checkbox elements by matching label text and dispatching click.
 * Implements two-pass matching: prioritizes predefined radio buttons over auxiliary "Other" text inputs.
 */
function fillRadioOrCheckbox(el: HTMLElement, targetValue: string): boolean {
  try {
    const input = el as HTMLInputElement;
    const isCheckbox = input.type === 'checkbox' || el.getAttribute('role') === 'checkbox';
    const isNativeRadio = input.type === 'radio';

    const normTarget = targetValue.toLowerCase().trim();
    const cleanTarget = cleanText(targetValue);
    const isAffirmative = ['yes', 'true', '1', 'authorized', 'agree'].includes(normTarget);
    const isNegative = ['no', 'false', '0', 'decline', 'disagree'].includes(normTarget);

    // 1. Checkbox handling (native or ARIA)
    if (isCheckbox) {
      const shouldCheck = isAffirmative || normTarget === 'check';
      if (el instanceof HTMLInputElement) {
        if (el.checked !== shouldCheck) {
          el.click();
        }
      } else {
        const isChecked = el.getAttribute('aria-checked') === 'true';
        if (isChecked !== shouldCheck) {
          clickRadioElement(el);
        }
      }
      return true;
    }

    // 2. Single native radio input
    if (isNativeRadio) {
      const val = (input.value || '').toLowerCase().trim();
      const parentLabel = input.closest('label');
      const labelText = (parentLabel?.textContent || '').toLowerCase().trim();
      const cleanVal = cleanText(val);
      const cleanLabel = cleanText(labelText);

      const isOther = val.includes('other') || labelText.startsWith('other');
      if (isOther && normTarget !== 'other') {
        return false;
      }

      const matches =
        val === normTarget ||
        cleanVal === cleanTarget ||
        labelText.includes(normTarget) ||
        cleanLabel.includes(cleanTarget) ||
        cleanTarget.includes(cleanLabel) ||
        (isAffirmative && (val === 'yes' || cleanLabel === 'yes' || cleanLabel.includes('yes'))) ||
        (isNegative && (val === 'no' || cleanLabel === 'no' || cleanLabel.includes('no')));

      if (matches) {
        if (!input.checked) {
          input.click();
        }
        return true;
      }
      return false;
    }

    // 3. Radio group or container (ARIA radiogroup, Google Forms Qr7Oae, or form-group)
    const isRadioGroup =
      el.getAttribute('role') === 'radiogroup' ||
      el.classList.contains('Qr7Oae') ||
      el.querySelector('[role="radio"], input[type="radio"]') !== null;

    if (isRadioGroup) {
      const ariaRadios = Array.from(el.querySelectorAll<HTMLElement>('[role="radio"]'));
      const nativeRadios = Array.from(el.querySelectorAll<HTMLInputElement>('input[type="radio"]'));

      // Case A: ARIA radio options (Google Forms, custom ATS)
      if (ariaRadios.length > 0) {
        const parseOption = (opt: HTMLElement) => {
          const dataVal = (opt.getAttribute('data-value') || '').trim();
          const ariaLabel = (opt.getAttribute('aria-label') || '').trim();

          const clone = opt.cloneNode(true) as HTMLElement;
          clone.querySelectorAll('input, textarea').forEach((c) => c.remove());
          const text = (clone.textContent || '').trim();

          const labelEl = opt.closest('label');
          const labelClone = labelEl ? (labelEl.cloneNode(true) as HTMLElement) : null;
          if (labelClone) {
            labelClone.querySelectorAll('input, textarea').forEach((c) => c.remove());
          }
          const labelText = (labelClone?.textContent || '').trim();

          const isOther =
            dataVal === '__other_option__' ||
            ariaLabel.toLowerCase().startsWith('other') ||
            text.toLowerCase().startsWith('other') ||
            labelText.toLowerCase().startsWith('other') ||
            opt.querySelector('.Hvn9fb') !== null ||
            opt.querySelector('input[type="text"]') !== null ||
            (labelEl !== null && labelEl.querySelector('.Hvn9fb') !== null) ||
            (labelEl !== null && labelEl.querySelector('input[type="text"]') !== null);

          const raw = (dataVal || ariaLabel || text || labelText).toLowerCase().trim();
          const clean = cleanText(raw);

          return { opt, dataVal, ariaLabel, text, labelText, raw, clean, isOther };
        };

        const parsedOptions = ariaRadios.map(parseOption);

        // PASS 1: Search for predefined options (non-Other) that match targetValue
        for (const item of parsedOptions) {
          if (item.isOther) continue;

          const matches =
            item.raw === normTarget ||
            item.clean === cleanTarget ||
            (cleanTarget.length >= 2 && item.clean.includes(cleanTarget)) ||
            (item.clean.length >= 2 && cleanTarget.includes(item.clean)) ||
            (isAffirmative && (item.raw === 'yes' || item.clean === 'yes')) ||
            (isNegative && (item.raw === 'no' || item.clean === 'no'));

          if (matches) {
            clickRadioElement(item.opt);

            // Clear any auxiliary "Other" text input if present
            const auxInputs = el.querySelectorAll<HTMLInputElement>(
              'input.Hvn9fb, input[aria-label*="other" i], input[type="text"]'
            );
            for (const auxInput of Array.from(auxInputs)) {
              if (auxInput.value) {
                setNativeValue(auxInput, '');
                dispatchInputEvents(auxInput, false);
              }
            }
            return true;
          }
        }

        // PASS 2: If no predefined option matched, fallback to "Other" option if available
        const otherOption = parsedOptions.find((o) => o.isOther);
        if (otherOption) {
          clickRadioElement(otherOption.opt);
          const auxInput =
            otherOption.opt.querySelector<HTMLInputElement>('input') ||
            otherOption.opt.closest('label')?.querySelector<HTMLInputElement>('input') ||
            el.querySelector<HTMLInputElement>('input.Hvn9fb, input[aria-label*="other" i], input[type="text"]');
          if (auxInput) {
            setNativeValue(auxInput, targetValue);
            dispatchInputEvents(auxInput, false);
          }
          return true;
        }
      }

      // Case B: Native radio options inside a container
      if (nativeRadios.length > 0) {
        // PASS 1: Predefined native radios
        for (const r of nativeRadios) {
          const val = (r.value || '').toLowerCase().trim();
          const parentLabel = r.closest('label');
          const labelText = (parentLabel?.textContent || '').toLowerCase().trim();
          const isOther = val.includes('other') || labelText.startsWith('other');
          if (isOther) continue;

          const cleanVal = cleanText(val);
          const cleanLabel = cleanText(labelText);

          const matches =
            val === normTarget ||
            cleanVal === cleanTarget ||
            labelText.includes(normTarget) ||
            cleanLabel.includes(cleanTarget) ||
            cleanTarget.includes(cleanLabel) ||
            (isAffirmative && (val === 'yes' || cleanLabel === 'yes' || cleanLabel.includes('yes'))) ||
            (isNegative && (val === 'no' || cleanLabel === 'no' || cleanLabel.includes('no')));

          if (matches) {
            if (!r.checked) r.click();
            const otherInputs = el.querySelectorAll<HTMLInputElement>('input[type="text"]');
            for (const oInput of Array.from(otherInputs)) {
              if (oInput.value) setNativeValue(oInput, '');
            }
            return true;
          }
        }

        // PASS 2: Native Other radio fallback
        for (const r of nativeRadios) {
          const val = (r.value || '').toLowerCase().trim();
          const parentLabel = r.closest('label');
          const labelText = (parentLabel?.textContent || '').toLowerCase().trim();
          const isOther = val.includes('other') || labelText.startsWith('other');
          if (isOther) {
            if (!r.checked) r.click();
            const auxInput =
              parentLabel?.querySelector<HTMLInputElement>('input[type="text"]') ||
              el.querySelector<HTMLInputElement>('input[type="text"]');
            if (auxInput) {
              setNativeValue(auxInput, targetValue);
              dispatchInputEvents(auxInput, false);
            }
            return true;
          }
        }
      }
    }

    // 4. Direct ARIA radio (standalone)
    if (el.getAttribute('role') === 'radio') {
      const dataVal = (el.getAttribute('data-value') || '').trim();
      const ariaLabel = (el.getAttribute('aria-label') || '').trim();
      const text = (el.textContent || '').trim();
      const raw = (dataVal || ariaLabel || text).toLowerCase().trim();
      const clean = cleanText(raw);

      const matches =
        raw === normTarget ||
        clean === cleanTarget ||
        (cleanTarget.length >= 2 && clean.includes(cleanTarget)) ||
        (clean.length >= 2 && cleanTarget.includes(clean)) ||
        (isAffirmative && (raw === 'yes' || clean === 'yes')) ||
        (isNegative && (raw === 'no' || clean === 'no'));

      if (matches) {
        clickRadioElement(el);
        return true;
      }
    }

    return false;
  } catch (err) {
    console.warn('Radio/checkbox fill error:', err);
    return false;
  }
}

/**
 * Fills a single detected field according to its type and the classified guess.
 */
export async function fillField(field: DetectedField, guess: FieldGuess): Promise<FillOutcome> {
  const el = field.element;
  if (!el || field.disabled || field.readOnly) {
    return {
      field,
      guess,
      success: false,
      actionTaken: 'skipped-low-confidence',
      errorMessage: 'Field is disabled, readonly, or detached',
    };
  }

  // Handle resume file attachment prompt
  if (field.type === 'file' || guess.canonicalField === 'resumeFileName') {
    const fileName = guess.targetValue || 'resume.pdf';
    promptResumeFile(el, fileName);
    return {
      field,
      guess,
      success: true,
      actionTaken: 'prompt-manual-file',
    };
  }

  const targetValue = guess.targetValue;
  if (!targetValue) {
    return {
      field,
      guess,
      success: false,
      actionTaken: 'skipped-low-confidence',
      errorMessage: 'No target value found in profile',
    };
  }

  try {
    let success = false;

    if (field.type === 'select' && el instanceof HTMLSelectElement) {
      success = fillSelectElement(el, targetValue);
    } else if (field.type === 'radio' || field.type === 'checkbox') {
      success = fillRadioOrCheckbox(el, targetValue);
    } else if (field.type === 'combobox') {
      if (isWorkdaySite()) {
        success = await fillWorkdayCustomField(el, targetValue);
      }
      if (!success) {
        success = await fillReactSelectCombobox(el, targetValue);
      }
    } else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      // Text / textarea / tel / email / number
      const isMasked = el.hasAttribute('pattern') || el.hasAttribute('data-mask');
      setNativeValue(el, targetValue);
      dispatchInputEvents(el, isMasked);
      success = true;
    } else if (field.type === 'contenteditable') {
      el.focus();
      el.textContent = targetValue;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      success = true;
    }

    if (success) {
      // Apply visual outline based on confidence
      const highlightType = guess.confidence >= 0.8 ? 'high' : 'medium';
      highlightField(el, highlightType, `Applyr: ${guess.canonicalField} (${Math.round(guess.confidence * 100)}%)`);
    }

    return {
      field,
      guess,
      success,
      actionTaken: success ? 'filled' : 'skipped-low-confidence',
    };
  } catch (err) {
    console.error('Error filling field:', err);
    return {
      field,
      guess,
      success: false,
      actionTaken: 'error',
      errorMessage: String(err),
    };
  }
}

/**
 * Sequential filler that staggers writes with 50-150ms delays.
 */
export async function fillFieldsSequentially(
  items: Array<{ field: DetectedField; guess: FieldGuess }>,
  confidenceThreshold = 0.6
): Promise<FillOutcome[]> {
  const outcomes: FillOutcome[] = [];

  for (const item of items) {
    if (item.guess.confidence < confidenceThreshold) {
      if (item.field.element) {
        highlightField(item.field.element, 'manual', 'Needs manual review');
      }
      outcomes.push({
        field: item.field,
        guess: item.guess,
        success: false,
        actionTaken: 'skipped-low-confidence',
      });
      continue;
    }

    const outcome = await fillField(item.field, item.guess);
    outcomes.push(outcome);

    // Stagger delay between 50ms and 120ms to allow reactive renders to settle
    const delay = Math.floor(Math.random() * 70) + 50;
    await new Promise((r) => setTimeout(r, delay));
  }

  return outcomes;
}
