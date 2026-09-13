import { DetectedField, FieldGuess, Profile, FieldCacheEntry } from './types';
import { AUTOCOMPLETE_MAP, KEYWORD_RULES } from './dictionary';
import { normalizeText } from './hash';

/**
 * Resolves a canonical field string from the active profile.
 */
export function resolveProfileValue(profile: Profile, canonicalField: string): string | undefined {
  if (!canonicalField) return undefined;

  switch (canonicalField) {
    case 'personal.firstName':
      return profile.personal.firstName;
    case 'personal.lastName':
      return profile.personal.lastName;
    case 'personal.fullName':
      return `${profile.personal.firstName} ${profile.personal.lastName}`.trim();
    case 'personal.email':
      return profile.personal.email;
    case 'personal.phone':
      return profile.personal.phone;
    case 'personal.location':
      return profile.personal.location;
    case 'personal.city':
      return profile.personal.city || profile.personal.location.split(',')[0].trim();
    case 'personal.state':
      return profile.personal.state || '';
    case 'personal.country':
      return profile.personal.country || 'India';
    case 'links.linkedin':
      return profile.links.linkedin || '';
    case 'links.github':
      return profile.links.github || '';
    case 'links.portfolio':
      return profile.links.portfolio || '';
    case 'links.leetcode':
      return profile.links.leetcode || '';
    case 'experience.currentTitle':
      return profile.experience.currentTitle;
    case 'experience.yearsExperience':
      return String(profile.experience.yearsExperience);
    case 'experience.summary':
      return profile.experience.summary;
    case 'education.degree':
      return profile.education.degree;
    case 'education.institution':
      return profile.education.institution;
    case 'education.graduationYear':
      return String(profile.education.graduationYear);
    case 'education.gpa':
      return profile.education.gpa || '';
    case 'education.fieldOfStudy':
      return profile.education.fieldOfStudy || profile.education.degree;
    case 'resumeFileName':
      return profile.resumeFileName;
  }

  // Check customAnswers prefix: e.g. "customAnswers.why do you want to work here"
  if (canonicalField.startsWith('customAnswers.')) {
    const key = canonicalField.replace('customAnswers.', '');
    return profile.customAnswers?.[key];
  }

  // Direct check in customAnswers
  if (profile.customAnswers?.[canonicalField]) {
    return profile.customAnswers[canonicalField];
  }

  return undefined;
}

/**
 * Matches free-form question text against profile.customAnswers keys.
 */
function matchCustomAnswers(text: string, profile: Profile): { key: string; value: string; confidence: number } | null {
  if (!profile.customAnswers) return null;
  const normText = normalizeText(text);
  if (!normText) return null;

  let bestMatch: { key: string; value: string; confidence: number } | null = null;
  let highestScore = 0;

  for (const [qKey, val] of Object.entries(profile.customAnswers)) {
    const normQKey = normalizeText(qKey);
    if (!normQKey) continue;

    // Check exact substring containment
    if (normText.includes(normQKey) || normQKey.includes(normText)) {
      const score = Math.min(0.9, 0.65 + (Math.min(normText.length, normQKey.length) / Math.max(normText.length, normQKey.length)) * 0.25);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = { key: `customAnswers.${qKey}`, value: val, confidence: score };
      }
    }
  }

  return bestMatch;
}

/**
 * Classifies a detected form field using the short-circuiting 4-tier pipeline.
 */
export function classifyField(
  field: DetectedField,
  profile: Profile,
  siteCache: Record<string, FieldCacheEntry> = {},
  minConfidenceThreshold = 0.6
): FieldGuess {
  // Tier 1: HTML autocomplete attribute (highest confidence: 0.95)
  if (field.autocomplete) {
    const cleanAuto = field.autocomplete.toLowerCase().trim();
    // Handle tokens like "section-personal given-name" or "shipping email"
    const tokens = cleanAuto.split(/\s+/);
    for (const token of tokens) {
      const canonical = AUTOCOMPLETE_MAP[token];
      if (canonical) {
        const val = resolveProfileValue(profile, canonical);
        if (val !== undefined) {
          return {
            canonicalField: canonical,
            confidence: 0.95,
            source: 'autocomplete',
            targetValue: val,
            reason: `Matched HTML autocomplete="${token}"`,
          };
        }
      }
    }
  }

  // Special case: input type="email" or type="tel"
  if (field.htmlType === 'email') {
    return {
      canonicalField: 'personal.email',
      confidence: 0.92,
      source: 'keyword',
      targetValue: profile.personal.email,
      reason: 'Matched input type="email"',
    };
  }
  if (field.htmlType === 'tel') {
    return {
      canonicalField: 'personal.phone',
      confidence: 0.88,
      source: 'keyword',
      targetValue: profile.personal.phone,
      reason: 'Matched input type="tel"',
    };
  }

  // Tier 2: Per-site learned cache (exact fieldSignature match: 0.90)
  if (field.fieldSignature && siteCache[field.fieldSignature]) {
    const entry = siteCache[field.fieldSignature];
    const val = resolveProfileValue(profile, entry.canonicalField);
    if (val !== undefined) {
      return {
        canonicalField: entry.canonicalField,
        confidence: entry.confidence || 0.9,
        source: 'cache',
        targetValue: val,
        reason: `Matched learned mapping for ${field.fieldSignature} (${entry.source})`,
      };
    }
  }

  // Tier 3: Keyword dictionary match
  // Build composite string with weighted contexts
  const label = field.labelText || '';
  const name = field.name || '';
  const id = field.id || '';
  const placeholder = field.placeholder || '';
  const nearby = field.nearbyText || '';

  // Check custom answers first if label looks like a specific question
  if (label.length > 8 || nearby.length > 8) {
    const customMatch = matchCustomAnswers(`${label} ${nearby}`, profile);
    if (customMatch && customMatch.confidence >= minConfidenceThreshold) {
      return {
        canonicalField: customMatch.key,
        confidence: customMatch.confidence,
        source: 'keyword',
        targetValue: customMatch.value,
        reason: `Matched custom Q&A "${customMatch.key}"`,
      };
    }
  }

  let bestGuess: FieldGuess | null = null;
  let highestScore = 0;

  for (const rule of KEYWORD_RULES) {
    // Check negatives first
    if (rule.negativePatterns) {
      const hasNegative = rule.negativePatterns.some(
        (np) => np.test(label) || np.test(name) || np.test(id)
      );
      if (hasNegative) continue;
    }

    let matchQuality = 0;

    // Check label (highest weight among text signals)
    if (label && rule.patterns.some((p) => p.test(label))) {
      matchQuality = Math.max(matchQuality, 1.0);
    }
    // Check name
    if (name && rule.patterns.some((p) => p.test(name))) {
      matchQuality = Math.max(matchQuality, 0.9);
    }
    // Check placeholder
    if (placeholder && rule.patterns.some((p) => p.test(placeholder))) {
      matchQuality = Math.max(matchQuality, 0.8);
    }
    // Check ID
    if (id && rule.patterns.some((p) => p.test(id))) {
      matchQuality = Math.max(matchQuality, 0.75);
    }
    // Check nearby text
    if (nearby && rule.patterns.some((p) => p.test(nearby))) {
      matchQuality = Math.max(matchQuality, 0.65);
    }

    if (matchQuality > 0) {
      const score = Number((rule.weight * matchQuality).toFixed(2));
      if (score > highestScore) {
        highestScore = score;
        const val = resolveProfileValue(profile, rule.canonicalField);
        bestGuess = {
          canonicalField: rule.canonicalField,
          confidence: Math.min(1.0, score),
          source: 'keyword',
          targetValue: val,
          reason: `Matched keyword pattern for ${rule.canonicalField}`,
        };
      }
    }
  }

  if (bestGuess && bestGuess.confidence >= minConfidenceThreshold) {
    return bestGuess;
  }

  // Tier 4: Fallback / Unmatched
  return (
    bestGuess || {
      canonicalField: '',
      confidence: 0.0,
      source: 'fallback',
      reason: 'No matching pattern found',
    }
  );
}
