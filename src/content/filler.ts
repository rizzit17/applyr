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
 * Handles radio / checkbox elements by matching label text and dispatching click.
 */
function fillRadioOrCheckbox(el: HTMLElement, targetValue: string): boolean {
  try {
    const input = el as HTMLInputElement;
    const isCheckbox = input.type === 'checkbox';
    const isRadio = input.type === 'radio';

    const normTarget = targetValue.toLowerCase().trim();
    const isAffirmative = ['yes', 'true', '1', 'authorized', 'agree'].includes(normTarget);
    const isNegative = ['no', 'false', '0', 'decline', 'disagree'].includes(normTarget);

    // If it's a single checkbox (e.g. "I agree to terms" or "Authorized to work")
    if (isCheckbox) {
      const shouldCheck = isAffirmative || normTarget === 'check';
      if (input.checked !== shouldCheck) {
        input.click();
      }
      return true;
    }

    // If radio button: check if this radio's value or associated label matches
    if (isRadio) {
      const val = (input.value || '').toLowerCase().trim();
      const parentLabel = input.closest('label');
      const labelText = (parentLabel?.textContent || '').toLowerCase().trim();

      const matches =
        val === normTarget ||
        labelText.includes(normTarget) ||
        (isAffirmative && (val === 'yes' || labelText.includes('yes'))) ||
        (isNegative && (val === 'no' || labelText.includes('no')));

      if (matches) {
        if (!input.checked) {
          input.click();
        }
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
