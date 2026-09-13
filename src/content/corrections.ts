/**
 * Learning Layer & Correction Listener
 * Based on system_design.md and antigravity_prompt.md (Phase 5).
 * Listens for manual corrections post-fill and persists learned field signatures.
 */

import { DetectedField, Profile } from '../core/types';

interface TrackedCorrectionField {
  field: DetectedField;
  originalValue: string;
  listener: (e: Event) => void;
}

let activeTrackers: TrackedCorrectionField[] = [];
let cleanupTimer: number | null = null;

/**
 * Finds the most likely canonical field that matches the user's entered value.
 */
function inferCanonicalFieldFromValue(enteredValue: string, profile: Profile): string | null {
  const norm = enteredValue.toLowerCase().trim();
  if (norm.length < 2) return null;

  // Personal
  if (norm === profile.personal.firstName.toLowerCase().trim()) return 'personal.firstName';
  if (norm === profile.personal.lastName.toLowerCase().trim()) return 'personal.lastName';
  if (norm === `${profile.personal.firstName} ${profile.personal.lastName}`.toLowerCase().trim())
    return 'personal.fullName';
  if (norm === profile.personal.email.toLowerCase().trim()) return 'personal.email';
  if (norm === profile.personal.phone.toLowerCase().trim()) return 'personal.phone';
  if (norm === profile.personal.location.toLowerCase().trim()) return 'personal.location';

  // Links
  if (profile.links.linkedin && norm.includes('linkedin.com')) return 'links.linkedin';
  if (profile.links.github && norm.includes('github.com')) return 'links.github';
  if (profile.links.portfolio && (norm === profile.links.portfolio.toLowerCase().trim() || norm.includes('http')))
    return 'links.portfolio';

  // Experience
  if (profile.experience.currentTitle && norm === profile.experience.currentTitle.toLowerCase().trim())
    return 'experience.currentTitle';
  if (norm === String(profile.experience.yearsExperience)) return 'experience.yearsExperience';

  // Education
  if (profile.education.degree && norm === profile.education.degree.toLowerCase().trim()) return 'education.degree';
  if (profile.education.institution && norm === profile.education.institution.toLowerCase().trim())
    return 'education.institution';
  if (norm === String(profile.education.graduationYear)) return 'education.graduationYear';

  // Custom Answers
  if (profile.customAnswers) {
    for (const [qKey, val] of Object.entries(profile.customAnswers)) {
      if (val.toLowerCase().trim() === norm) {
        return `customAnswers.${qKey}`;
      }
    }
  }

  return null;
}

/**
 * Attaches temporary correction listeners to fields for 2 minutes after fill.
 */
export function startCorrectionMonitoring(
  fields: DetectedField[],
  profile: Profile,
  hostname: string,
  onCorrectionLearned: (hostname: string, fieldSignature: string, canonicalField: string) => void
): void {
  // Clear any existing trackers
  stopCorrectionMonitoring();

  for (const field of fields) {
    const el = field.element;
    if (!el) continue;

    const initialVal = (el as HTMLInputElement).value || el.textContent || '';

    const handler = () => {
      const currentVal = (el as HTMLInputElement).value || el.textContent || '';
      if (currentVal && currentVal !== initialVal) {
        const canonical = inferCanonicalFieldFromValue(currentVal, profile);
        if (canonical) {
          console.log(`Applyr learned correction: ${field.fieldSignature} -> ${canonical}`);
          onCorrectionLearned(hostname, field.fieldSignature, canonical);
        }
      }
    };

    el.addEventListener('change', handler, { once: true });
    activeTrackers.push({
      field,
      originalValue: initialVal,
      listener: handler,
    });
  }

  // Auto-remove after 2 minutes
  cleanupTimer = window.setTimeout(() => {
    stopCorrectionMonitoring();
  }, 120_000);
}

export function stopCorrectionMonitoring(): void {
  if (cleanupTimer) {
    clearTimeout(cleanupTimer);
    cleanupTimer = null;
  }
  for (const item of activeTrackers) {
    if (item.field.element) {
      item.field.element.removeEventListener('change', item.listener);
    }
  }
  activeTrackers = [];
}
