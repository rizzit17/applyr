import { describe, it, expect } from 'vitest';
import { classifyField, resolveProfileValue } from '../src/core/classifier';
import { DEFAULT_PROFILES } from '../src/core/schema';
import { DetectedField } from '../src/core/types';

describe('Field Classification Engine', () => {
  const profile = DEFAULT_PROFILES[0]; // Jane Doe, Backend Engineer

  it('Tier 1: matches standard HTML autocomplete attribute with 0.95 confidence', () => {
    const field: DetectedField = {
      id: 'f1',
      name: 'random_id_99',
      type: 'text',
      placeholder: '',
      autocomplete: 'given-name',
      labelText: 'Your given name',
      nearbyText: '',
      fieldSignature: 'sig1',
    };

    const guess = classifyField(field, profile);
    expect(guess.canonicalField).toBe('personal.firstName');
    expect(guess.confidence).toBe(0.95);
    expect(guess.source).toBe('autocomplete');
    expect(guess.targetValue).toBe('Jane');
  });

  it('Tier 2: matches learned site mapping cache before heuristics with 0.9 confidence', () => {
    const field: DetectedField = {
      id: 'custom_input_42',
      name: 'weird_ats_field_xyz',
      type: 'text',
      placeholder: '',
      autocomplete: '',
      labelText: 'Custom Questionnaire Q4',
      nearbyText: '',
      fieldSignature: 'sig_learned_42',
    };

    const cache = {
      sig_learned_42: {
        canonicalField: 'personal.location',
        confidence: 0.9,
        lastUpdated: Date.now(),
        source: 'user-correction' as const,
      },
    };

    const guess = classifyField(field, profile, cache);
    expect(guess.canonicalField).toBe('personal.location');
    expect(guess.confidence).toBe(0.9);
    expect(guess.source).toBe('cache');
    expect(guess.targetValue).toBe('San Francisco, CA');
  });

  it('Tier 3: matches keyword patterns for common job form fields with >=0.7 confidence', () => {
    const testCases: Array<{ field: Partial<DetectedField>; expectedKey: string; expectedVal: string }> = [
      {
        field: { labelText: 'First Name *', name: 'first_name', type: 'text' },
        expectedKey: 'personal.firstName',
        expectedVal: 'Jane',
      },
      {
        field: { labelText: 'Last Name', name: 'lname', type: 'text' },
        expectedKey: 'personal.lastName',
        expectedVal: 'Doe',
      },
      {
        field: { labelText: 'Email address', name: 'email', htmlType: 'email', type: 'text' },
        expectedKey: 'personal.email',
        expectedVal: 'jane.doe@example.com',
      },
      {
        field: { labelText: 'Phone number', name: 'tel', htmlType: 'tel', type: 'text' },
        expectedKey: 'personal.phone',
        expectedVal: '+1-555-123-4567',
      },
      {
        field: { labelText: 'LinkedIn Profile URL', name: 'linkedin_url', type: 'text' },
        expectedKey: 'links.linkedin',
        expectedVal: 'https://linkedin.com/in/janedoe',
      },
      {
        field: { labelText: 'GitHub Account', name: 'github', type: 'text' },
        expectedKey: 'links.github',
        expectedVal: 'https://github.com/janedoe',
      },
      {
        field: { labelText: 'Current Job Title', name: 'title', type: 'text' },
        expectedKey: 'experience.currentTitle',
        expectedVal: 'Backend Engineer',
      },
      {
        field: { labelText: 'How many years of experience do you have?', name: 'yoe', type: 'text' },
        expectedKey: 'experience.yearsExperience',
        expectedVal: '4',
      },
      {
        field: { labelText: 'University or College', name: 'institution', type: 'text' },
        expectedKey: 'education.institution',
        expectedVal: 'State University',
      },
    ];

    for (const tc of testCases) {
      const field: DetectedField = {
        id: 'test_id',
        name: tc.field.name || '',
        type: tc.field.type || 'text',
        htmlType: tc.field.htmlType,
        placeholder: '',
        autocomplete: '',
        labelText: tc.field.labelText || '',
        nearbyText: '',
        fieldSignature: 'test_sig',
      };

      const guess = classifyField(field, profile);
      expect(guess.canonicalField).toBe(tc.expectedKey);
      expect(guess.confidence).toBeGreaterThanOrEqual(0.7);
      expect(guess.targetValue).toBe(tc.expectedVal);
    }
  });

  it('correctly maps customAnswers for EEO / work authorization questions', () => {
    const field: DetectedField = {
      id: 'q_auth',
      name: 'work_auth',
      type: 'select',
      placeholder: '',
      autocomplete: '',
      labelText: 'Are you authorized to work in US?',
      nearbyText: '',
      fieldSignature: 'sig_auth',
    };

    const guess = classifyField(field, profile);
    expect(guess.canonicalField).toBe('customAnswers.authorized to work in us');
    expect(guess.targetValue).toBe('Yes');
  });

  it('correctly resolves composite full name', () => {
    const fullName = resolveProfileValue(profile, 'personal.fullName');
    expect(fullName).toBe('Jane Doe');
  });
});
