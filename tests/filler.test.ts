import { describe, it, expect, beforeEach } from 'vitest';
import { fillField } from '../src/content/filler';
import { scanForm } from '../src/content/scanner';
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

  it('selects predefined B.Tech radio button in Google Forms without typing into Other input', async () => {
    const questionBlock = document.createElement('div');
    questionBlock.className = 'Qr7Oae';
    questionBlock.innerHTML = `
      <div role="heading" class="M7eMe">Graduation: Degree</div>
      <div role="radiogroup" aria-label="Graduation: Degree">
        <div role="radio" aria-checked="false" data-value="B.Tech" class="appsMaterialWizToggleRadiogroupEl">
          <div class="docssharedWHey6d">
            <div class="quantumWizTogglePaperradioEl"></div>
            <div class="aDTYNe"><span>B.Tech</span></div>
          </div>
        </div>
        <div role="radio" aria-checked="false" data-value="__other_option__" class="appsMaterialWizToggleRadiogroupEl">
          <div class="docssharedWHey6d">
            <div class="quantumWizTogglePaperradioEl"></div>
            <div class="aDTYNe">
              <span>Other:</span>
              <input type="text" class="Hvn9fb zHQkBf" aria-label="Other response" value="" />
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(questionBlock);

    const radiogroup = questionBlock.querySelector<HTMLElement>('[role="radiogroup"]')!;
    const btechRadio = questionBlock.querySelectorAll<HTMLElement>('[role="radio"]')[0];
    const otherRadio = questionBlock.querySelectorAll<HTMLElement>('[role="radio"]')[1];
    const otherInput = questionBlock.querySelector<HTMLInputElement>('input.Hvn9fb')!;

    let btechClicked = false;
    btechRadio.addEventListener('click', () => { btechClicked = true; });

    const field: DetectedField = {
      id: 'degree_rg',
      name: 'degree',
      type: 'radio',
      placeholder: '',
      autocomplete: '',
      labelText: 'Graduation: Degree',
      nearbyText: '',
      fieldSignature: 'sig_degree',
      element: radiogroup,
    };

    const guess: FieldGuess = {
      canonicalField: 'education.degree',
      confidence: 0.9,
      source: 'keyword',
      targetValue: 'B.Tech',
    };

    const outcome = await fillField(field, guess);
    expect(outcome.success).toBe(true);
    expect(btechClicked).toBe(true);
    expect(btechRadio.getAttribute('aria-checked')).toBe('true');
    expect(otherRadio.getAttribute('aria-checked')).toBe('false');
    expect(otherInput.value).toBe('');
  });

  it('selects predefined 2027 radio button for Graduation: Year of Passing without typing into Other input', async () => {
    const questionBlock = document.createElement('div');
    questionBlock.className = 'Qr7Oae';
    questionBlock.innerHTML = `
      <div role="heading" class="M7eMe">Graduation: Year of Passing</div>
      <div role="radiogroup" aria-label="Graduation: Year of Passing">
        <div role="radio" aria-checked="false" data-value="2027" class="appsMaterialWizToggleRadiogroupEl">
          <div class="docssharedWHey6d">
            <div class="quantumWizTogglePaperradioEl"></div>
            <div class="aDTYNe"><span>2027</span></div>
          </div>
        </div>
        <div role="radio" aria-checked="false" data-value="__other_option__" class="appsMaterialWizToggleRadiogroupEl">
          <div class="docssharedWHey6d">
            <div class="quantumWizTogglePaperradioEl"></div>
            <div class="aDTYNe">
              <span>Other:</span>
              <input type="text" class="Hvn9fb zHQkBf" aria-label="Other response" value="" />
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(questionBlock);

    const radiogroup = questionBlock.querySelector<HTMLElement>('[role="radiogroup"]')!;
    const yearRadio = questionBlock.querySelectorAll<HTMLElement>('[role="radio"]')[0];
    const otherInput = questionBlock.querySelector<HTMLInputElement>('input.Hvn9fb')!;

    let yearClicked = false;
    yearRadio.addEventListener('click', () => { yearClicked = true; });

    const field: DetectedField = {
      id: 'year_rg',
      name: 'gradYear',
      type: 'radio',
      placeholder: '',
      autocomplete: '',
      labelText: 'Graduation: Year of Passing',
      nearbyText: '',
      fieldSignature: 'sig_year',
      element: radiogroup,
    };

    const guess: FieldGuess = {
      canonicalField: 'education.graduationYear',
      confidence: 0.9,
      source: 'keyword',
      targetValue: '2027',
    };

    const outcome = await fillField(field, guess);
    expect(outcome.success).toBe(true);
    expect(yearClicked).toBe(true);
    expect(yearRadio.getAttribute('aria-checked')).toBe('true');
    expect(otherInput.value).toBe('');
  });

  it('falls back to Other option and types custom value when target value is not predefined', async () => {
    const questionBlock = document.createElement('div');
    questionBlock.className = 'Qr7Oae';
    questionBlock.innerHTML = `
      <div role="heading" class="M7eMe">Graduation: Degree</div>
      <div role="radiogroup" aria-label="Graduation: Degree">
        <div role="radio" aria-checked="false" data-value="B.Tech" class="appsMaterialWizToggleRadiogroupEl">
          <div class="docssharedWHey6d"><div class="aDTYNe"><span>B.Tech</span></div></div>
        </div>
        <div role="radio" aria-checked="false" data-value="__other_option__" class="appsMaterialWizToggleRadiogroupEl">
          <div class="docssharedWHey6d">
            <div class="aDTYNe">
              <span>Other:</span>
              <input type="text" class="Hvn9fb zHQkBf" aria-label="Other response" value="" />
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(questionBlock);

    const radiogroup = questionBlock.querySelector<HTMLElement>('[role="radiogroup"]')!;
    const otherRadio = questionBlock.querySelectorAll<HTMLElement>('[role="radio"]')[1];
    const otherInput = questionBlock.querySelector<HTMLInputElement>('input.Hvn9fb')!;

    let otherClicked = false;
    otherRadio.addEventListener('click', () => { otherClicked = true; });

    const field: DetectedField = {
      id: 'degree_rg_custom',
      name: 'degree',
      type: 'radio',
      placeholder: '',
      autocomplete: '',
      labelText: 'Graduation: Degree',
      nearbyText: '',
      fieldSignature: 'sig_degree_custom',
      element: radiogroup,
    };

    const guess: FieldGuess = {
      canonicalField: 'education.degree',
      confidence: 0.8,
      source: 'keyword',
      targetValue: 'Diploma in Mechatronics',
    };

    const outcome = await fillField(field, guess);
    expect(outcome.success).toBe(true);
    expect(otherClicked).toBe(true);
    expect(otherInput.value).toBe('Diploma in Mechatronics');
  });

  it('scans Google Forms radiogroup while excluding auxiliary Other text input and child radios', () => {
    const form = document.createElement('div');
    form.innerHTML = `
      <div role="listitem" class="Qr7Oae">
        <div role="heading" class="M7eMe" id="i_deg">Graduation: Degree</div>
        <div role="radiogroup" aria-labelledby="i_deg">
          <div role="radio" data-value="B.Tech" class="appsMaterialWizToggleRadiogroupEl">
            <div class="aDTYNe"><span>B.Tech</span></div>
          </div>
          <div role="radio" data-value="__other_option__" class="appsMaterialWizToggleRadiogroupEl">
            <div class="aDTYNe">
              <span>Other:</span>
              <input type="text" class="Hvn9fb zHQkBf" aria-label="Other response" />
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(form);

    const { fields } = scanForm(document);

    // Exactly 1 field should be detected (the radiogroup), NOT the child radios or the Other input
    expect(fields.length).toBe(1);
    expect(fields[0].type).toBe('radio');
    expect(fields[0].labelText).toBe('Graduation: Degree');
    expect(fields[0].options).toEqual(['B.Tech']);

    // The auxiliary other input must NOT be present as an independent field
    const hasAuxInput = fields.some((f) => f.element?.classList.contains('Hvn9fb'));
    expect(hasAuxInput).toBe(false);
  });
});
