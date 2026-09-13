import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import { scanForm } from '../src/content/scanner';
import { classifyField } from '../src/core/classifier';
import { fillFieldsSequentially } from '../src/content/filler';
import { DEFAULT_PROFILES } from '../src/core/schema';

describe('Real Google Form Test', () => {
  it('scans and classifies real Google Form HTML', async () => {
    const htmlPath = 'C:/Users/Rishit/.gemini/antigravity-ide/brain/c9426736-1b5b-4212-a0aa-14a2d54fecb9/scratch/real_form.html';
    const html = fs.readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = html;

    const profile = DEFAULT_PROFILES[0];
    const { fields } = scanForm(document);

    console.log('Total fields detected:', fields.length);
    const degreeFields = fields.filter((f) => f.labelText.toLowerCase().includes('degree'));
    const yearFields = fields.filter((f) => f.labelText.toLowerCase().includes('passing') || f.labelText.toLowerCase().includes('year'));

    console.log('=== DEGREE FIELDS ===');
    for (const f of degreeFields) {
      const guess = classifyField(f, profile);
      console.log({
        id: f.id,
        type: f.type,
        labelText: f.labelText,
        options: f.options,
        canonicalField: guess.canonicalField,
        confidence: guess.confidence,
        targetValue: guess.targetValue,
      });
    }

    console.log('=== YEAR FIELDS ===');
    for (const f of yearFields) {
      const guess = classifyField(f, profile);
      console.log({
        id: f.id,
        type: f.type,
        labelText: f.labelText,
        options: f.options,
        canonicalField: guess.canonicalField,
        confidence: guess.confidence,
        targetValue: guess.targetValue,
      });
    }

    console.log('=== TEST FILLING DEGREE & YEAR ===');
    const degreeField = degreeFields[0];
    const degreeGuess = classifyField(degreeField, profile);
    const degreeOutcome = await fillFieldsSequentially([{ field: degreeField, guess: degreeGuess }], 0.6);
    console.log('Degree Outcome:', degreeOutcome);

    const yearField = yearFields[0];
    const yearGuess = classifyField(yearField, profile);
    const yearOutcome = await fillFieldsSequentially([{ field: yearField, guess: yearGuess }], 0.6);
    console.log('Year Outcome:', yearOutcome);

    const btechRadio = degreeField.element!.querySelector('[data-value="B.Tech"]');
    const yearRadio = yearField.element!.querySelector('[data-value="2027"]');
    expect(degreeOutcome[0].success).toBe(true);
    expect(yearOutcome[0].success).toBe(true);
    expect(btechRadio?.getAttribute('aria-checked')).toBe('true');
    expect(yearRadio?.getAttribute('aria-checked')).toBe('true');

  });
});
