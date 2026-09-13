import { describe, it, expect } from 'vitest';
import { normalizeText, computeFieldSignature, fnv1a } from '../src/core/hash';

describe('Field Signature & Hash Engine', () => {
  it('normalizes text by stripping punctuation and lowercasing', () => {
    expect(normalizeText('  First Name (Legal)* ')).toBe('first name legal');
    expect(normalizeText('job_application[first_name]')).toBe('job application first name');
    expect(normalizeText('E-mail Address:')).toBe('e mail address');
  });

  it('computes stable, identical signatures for equivalent fields across reloads', () => {
    const sig1 = computeFieldSignature({
      name: 'firstName',
      id: 'first_name_input',
      labelText: 'First Name *',
      placeholder: 'Enter first name',
    });

    const sig2 = computeFieldSignature({
      name: ' firstName ',
      id: 'FIRST_NAME_INPUT',
      labelText: 'First Name',
      placeholder: 'enter first name',
    });

    expect(sig1).toBe(sig2);
  });

  it('produces distinct signatures for genuinely different fields', () => {
    const sigFirst = computeFieldSignature({
      name: 'firstName',
      labelText: 'First Name',
    });

    const sigLast = computeFieldSignature({
      name: 'lastName',
      labelText: 'Last Name',
    });

    expect(sigFirst).not.toBe(sigLast);
  });

  it('fnv1a returns consistent 8-character hex hash', () => {
    const h1 = fnv1a('test_string');
    const h2 = fnv1a('test_string');
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(8);
  });
});
