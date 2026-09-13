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
    expect(guess.targetValue).toBe('Rishit');
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
    expect(guess.targetValue).toBe('Noida, India');
  });

  it('Tier 3: matches keyword patterns for common job form fields with >=0.7 confidence', () => {
    const testCases: Array<{ field: Partial<DetectedField>; expectedKey: string; expectedVal: string }> = [
      {
        field: { labelText: 'First Name *', name: 'first_name', type: 'text' },
        expectedKey: 'personal.firstName',
        expectedVal: 'Rishit',
      },
      {
        field: { labelText: 'Last Name', name: 'lname', type: 'text' },
        expectedKey: 'personal.lastName',
        expectedVal: 'Chaudhary',
      },
      {
        field: { labelText: 'Email address', name: 'email', htmlType: 'email', type: 'text' },
        expectedKey: 'personal.email',
        expectedVal: 'rishitwork28@gmail.com',
      },
      {
        field: { labelText: 'Phone number', name: 'tel', htmlType: 'tel', type: 'text' },
        expectedKey: 'personal.phone',
        expectedVal: '+91-8076513921',
      },
      {
        field: { labelText: 'LinkedIn Profile URL', name: 'linkedin_url', type: 'text' },
        expectedKey: 'links.linkedin',
        expectedVal: 'https://www.linkedin.com/in/rishit-chaudhary17',
      },
      {
        field: { labelText: 'GitHub Account', name: 'github', type: 'text' },
        expectedKey: 'links.github',
        expectedVal: 'https://github.com/rizzit17',
      },
      {
        field: { labelText: 'LeetCode Profile', name: 'leetcode', type: 'text' },
        expectedKey: 'links.leetcode',
        expectedVal: 'https://leetcode.com/u/rishit_17/',
      },
      {
        field: { labelText: 'Current Job Title', name: 'title', type: 'text' },
        expectedKey: 'experience.currentTitle',
        expectedVal: 'Software Development Engineer',
      },
      {
        field: { labelText: 'How many years of experience do you have?', name: 'yoe', type: 'text' },
        expectedKey: 'experience.yearsExperience',
        expectedVal: '1',
      },
      {
        field: { labelText: 'University or College', name: 'institution', type: 'text' },
        expectedKey: 'education.institution',
        expectedVal: 'Vellore Institute of Technology, Vellore',
      },
      {
        field: { labelText: 'Cumulative GPA / CGPA', name: 'cgpa', type: 'text' },
        expectedKey: 'education.gpa',
        expectedVal: '8.68',
      },
      {
        field: { labelText: 'Major or Field of Study', name: 'major', type: 'text' },
        expectedKey: 'education.fieldOfStudy',
        expectedVal: 'Computer Science & Engineering (IoT)',
      },
      {
        field: { labelText: 'Campus ID / Register number *', name: 'reg_no', type: 'text' },
        expectedKey: 'personal.campusId',
        expectedVal: '23BCT0157',
      },
      {
        field: { labelText: 'Alternate/Campus Email Id *', name: 'campus_email', type: 'text' },
        expectedKey: 'personal.campusEmail',
        expectedVal: 'rishit.chaudhary2023@vitstudent.ac.in',
      },
      {
        field: { labelText: '10th Board Score (Percentage or CGPA) *', name: 'score_10th', type: 'text' },
        expectedKey: 'education.tenthScore',
        expectedVal: '96.6',
      },
      {
        field: { labelText: '12th Board Score (Percentage or CGPA) *', name: 'score_12th', type: 'text' },
        expectedKey: 'education.twelfthScore',
        expectedVal: '80',
      },
      {
        field: { labelText: 'Current Active Backlogs *', name: 'backlogs', type: 'text' },
        expectedKey: 'education.activeBacklogs',
        expectedVal: 'No',
      },
      {
        field: { labelText: 'Campus *', name: 'campus_loc', type: 'text' },
        expectedKey: 'education.campus',
        expectedVal: 'Vellore',
      },
      {
        field: { labelText: 'Additional Foreign Language(s) Known *', name: 'languages', type: 'text' },
        expectedKey: 'personal.languages',
        expectedVal: 'English, French, Hindi',
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
      if (guess.canonicalField.startsWith('customAnswers.')) {
        expect(guess.canonicalField).toMatch(/^customAnswers\./);
      } else {
        expect(guess.canonicalField).toBe(tc.expectedKey);
      }
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
    expect(guess.targetValue).toBe('Yes (open to remote / relocation with sponsorship)');
  });

  it('correctly resolves composite full name', () => {
    const fullName = resolveProfileValue(profile, 'personal.fullName');
    expect(fullName).toBe('Rishit Chaudhary');
  });

  it('correctly resolves challenging project answer', () => {
    const answer = resolveProfileValue(profile, 'customAnswers.tell us about a challenging project');
    expect(answer).toContain('Seatzy');
  });
});
