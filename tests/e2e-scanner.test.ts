import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { scanForm } from '../src/content/scanner';
import { classifyField } from '../src/core/classifier';
import { fillField } from '../src/content/filler';
import { DEFAULT_PROFILES } from '../src/core/schema';

describe('End-to-End ATS Form Detection & Classification', () => {
  const profile = DEFAULT_PROFILES[0]; // Jane Doe, Backend Engineer

  const loadForm = (filename: string) => {
    const filePath = path.resolve(__dirname, 'test-forms', filename);
    const html = fs.readFileSync(filePath, 'utf-8');
    document.body.innerHTML = html;
  };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('1. LinkedIn Easy Apply: scans, classifies >=80% at >=0.7 confidence, and fills', async () => {
    loadForm('linkedin.html');
    const { fields } = scanForm(document);
    expect(fields.length).toBeGreaterThanOrEqual(7);

    let highConfidenceCount = 0;
    const expectedKeys = [
      'personal.firstName',
      'personal.lastName',
      'personal.email',
      'personal.phone',
      'personal.location',
      'links.linkedin',
      'resumeFileName',
    ];

    const classifiedKeys: string[] = [];
    for (const f of fields) {
      const guess = classifyField(f, profile);
      if (guess.confidence >= 0.7 && expectedKeys.includes(guess.canonicalField)) {
        highConfidenceCount++;
        classifiedKeys.push(guess.canonicalField);
      }
      await fillField(f, guess);
    }

    const accuracy = highConfidenceCount / expectedKeys.length;
    expect(accuracy).toBeGreaterThanOrEqual(0.8);
    expect(classifiedKeys).toContain('personal.firstName');
    expect(classifiedKeys).toContain('personal.lastName');
    expect(classifiedKeys).toContain('personal.email');
  });

  it('2. Greenhouse Form: scans, classifies >=80% at >=0.7 confidence, and fills', async () => {
    loadForm('greenhouse.html');
    const { fields } = scanForm(document);
    expect(fields.length).toBeGreaterThanOrEqual(8);

    const expectedKeys = [
      'personal.firstName',
      'personal.lastName',
      'personal.email',
      'personal.phone',
      'resumeFileName',
      'links.linkedin',
      'links.portfolio',
      'links.github',
    ];

    let highConfidenceCount = 0;
    for (const f of fields) {
      const guess = classifyField(f, profile);
      if (guess.confidence >= 0.7 && expectedKeys.includes(guess.canonicalField)) {
        highConfidenceCount++;
      }
      await fillField(f, guess);
    }

    const accuracy = highConfidenceCount / expectedKeys.length;
    expect(accuracy).toBeGreaterThanOrEqual(0.8);
  });

  it('3. Lever Form: scans, classifies >=80% at >=0.7 confidence, and fills', async () => {
    loadForm('lever.html');
    const { fields } = scanForm(document);
    expect(fields.length).toBeGreaterThanOrEqual(7);

    const expectedKeys = [
      'personal.fullName',
      'personal.email',
      'personal.phone',
      'experience.currentTitle',
      'links.linkedin',
      'links.github',
      'links.portfolio',
      'experience.summary',
    ];

    let highConfidenceCount = 0;
    for (const f of fields) {
      const guess = classifyField(f, profile);
      if (guess.confidence >= 0.7 && expectedKeys.includes(guess.canonicalField)) {
        highConfidenceCount++;
      }
      await fillField(f, guess);
    }

    const accuracy = highConfidenceCount / expectedKeys.length;
    expect(accuracy).toBeGreaterThanOrEqual(0.8);
  });

  it('4. Workday Form: scans, classifies >=80% at >=0.7 confidence, and fills', async () => {
    loadForm('workday.html');
    const { fields } = scanForm(document);
    expect(fields.length).toBeGreaterThanOrEqual(7);

    const expectedKeys = [
      'personal.firstName',
      'personal.lastName',
      'personal.email',
      'personal.phone',
      'personal.location',
      'experience.currentTitle',
      'experience.yearsExperience',
      'resumeFileName',
    ];

    let highConfidenceCount = 0;
    for (const f of fields) {
      const guess = classifyField(f, profile);
      if (guess.confidence >= 0.7 && expectedKeys.includes(guess.canonicalField)) {
        highConfidenceCount++;
      }
      await fillField(f, guess);
    }

    const accuracy = highConfidenceCount / expectedKeys.length;
    expect(accuracy).toBeGreaterThanOrEqual(0.8);
  });

  it('5. Generic ATS Form: scans, classifies >=80% at >=0.7 confidence, and fills', async () => {
    loadForm('generic.html');
    const { fields } = scanForm(document);
    expect(fields.length).toBeGreaterThanOrEqual(8);

    const expectedKeys = [
      'personal.firstName',
      'personal.lastName',
      'personal.email',
      'personal.phone',
      'links.linkedin',
      'links.github',
      'education.institution',
      'education.graduationYear',
      'experience.summary',
    ];

    let highConfidenceCount = 0;
    for (const f of fields) {
      const guess = classifyField(f, profile);
      if (guess.confidence >= 0.7 && expectedKeys.includes(guess.canonicalField)) {
        highConfidenceCount++;
      }
      await fillField(f, guess);
    }

    const accuracy = highConfidenceCount / expectedKeys.length;
    expect(accuracy).toBeGreaterThanOrEqual(0.8);
  });
});
