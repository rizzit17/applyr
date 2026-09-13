import { describe, it, expect, beforeEach } from 'vitest';
import { fillField } from '../src/content/filler';
import { DetectedField, FieldGuess } from '../src/core/types';

describe('Autofill Execution Engine', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('fills text input and dispatches input & change events', async () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'first_name';
    document.body.appendChild(input);

    let inputFired = false;
    let changeFired = false;
    let blurFired = false;

    input.addEventListener('input', () => { inputFired = true; });
    input.addEventListener('change', () => { changeFired = true; });
    input.addEventListener('blur', () => { blurFired = true; });

    const field: DetectedField = {
      id: 'first_name',
      name: 'firstName',
      type: 'text',
      placeholder: '',
      autocomplete: '',
      labelText: 'First Name',
      nearbyText: '',
      fieldSignature: 'sig1',
      element: input,
    };

    const guess: FieldGuess = {
      canonicalField: 'personal.firstName',
      confidence: 0.95,
      source: 'keyword',
      targetValue: 'Jane',
    };

    const outcome = await fillField(field, guess);
    expect(outcome.success).toBe(true);
    expect(outcome.actionTaken).toBe('filled');
    expect(input.value).toBe('Jane');
    expect(inputFired).toBe(true);
    expect(changeFired).toBe(true);
    expect(blurFired).toBe(true);
  });

  it('selects option by text match on select elements', async () => {
    const select = document.createElement('select');
    select.id = 'auth_select';
    select.innerHTML = `
      <option value="">-- Choose --</option>
      <option value="opt_yes">Yes, I am authorized</option>
      <option value="opt_no">No</option>
    `;
    document.body.appendChild(select);

    const field: DetectedField = {
      id: 'auth_select',
      name: 'auth',
      type: 'select',
      placeholder: '',
      autocomplete: '',
      labelText: 'Work Authorization',
      nearbyText: '',
      fieldSignature: 'sig2',
      element: select,
    };

    const guess: FieldGuess = {
      canonicalField: 'customAnswers.authorized to work in us',
      confidence: 0.85,
      source: 'keyword',
      targetValue: 'Yes',
    };

    const outcome = await fillField(field, guess);
    expect(outcome.success).toBe(true);
    expect(select.value).toBe('opt_yes');
  });

  it('clicks matching radio button in a radio group', async () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <label><input type="radio" name="gender" value="male" /> Male</label>
      <label><input type="radio" name="gender" value="female" /> Female</label>
      <label><input type="radio" name="gender" value="decline" /> Decline to self-identify</label>
    `;
    document.body.appendChild(container);

    const declineRadio = container.querySelectorAll('input')[2];

    const field: DetectedField = {
      id: 'r3',
      name: 'gender',
      type: 'radio',
      placeholder: '',
      autocomplete: '',
      labelText: 'Decline to self-identify',
      nearbyText: '',
      fieldSignature: 'sig3',
      element: declineRadio,
    };

    const guess: FieldGuess = {
      canonicalField: 'customAnswers.gender',
      confidence: 0.85,
      source: 'keyword',
      targetValue: 'Decline to self-identify',
    };

    const outcome = await fillField(field, guess);
    expect(outcome.success).toBe(true);
    expect(declineRadio.checked).toBe(true);
  });

  it('surfaces manual attachment prompt for file input without throwing error', async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    document.body.appendChild(fileInput);

    const field: DetectedField = {
      id: 'f_upload',
      name: 'resume',
      type: 'file',
      placeholder: '',
      autocomplete: '',
      labelText: 'Attach Resume',
      nearbyText: '',
      fieldSignature: 'sig_file',
      element: fileInput,
    };

    const guess: FieldGuess = {
      canonicalField: 'resumeFileName',
      confidence: 0.9,
      source: 'keyword',
      targetValue: 'jane_doe_backend_resume.pdf',
    };

    const outcome = await fillField(field, guess);
    expect(outcome.success).toBe(true);
    expect(outcome.actionTaken).toBe('prompt-manual-file');

    // Check that resume prompt badge was rendered
    const badge = document.querySelector('.autofill-resume-badge');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toContain('jane_doe_backend_resume.pdf');
  });
});
