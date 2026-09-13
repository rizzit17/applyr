import { describe, it, expect } from 'vitest';
import { scanForm } from '../src/content/scanner';
import { classifyField } from '../src/core/classifier';
import { fillFieldsSequentially } from '../src/content/filler';
import { DEFAULT_PROFILES } from '../src/core/schema';

describe('Google Forms Debug Test', () => {
  it('debugs Google Forms filling', async () => {
    document.body.innerHTML = `
      <!-- Degree question -->
      <div role="listitem" class="Qr7Oae">
        <div role="heading" id="i1" class="M7eMe">Graduation: Degree</div>
        <div id="i4" class="c2tx2b">( M.Tech Integrated fill your detials in PG)<br>Example : B.Tech.</div>
        <div role="radiogroup" aria-labelledby="i1 i4">
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
                <input type="text" class="Hvn9fb zHQkBf" aria-label="Other response" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Branch question -->
      <div role="listitem" class="Qr7Oae">
        <div role="heading" class="M7eMe">Graduation: Course/Branch</div>
        <input type="text" class="whsOnd" />
      </div>

      <!-- Marks question -->
      <div role="listitem" class="Qr7Oae">
        <div role="heading" class="M7eMe">Graduation: Current Marks (Percentage/CGPA)</div>
        <input type="text" class="whsOnd" />
      </div>

      <!-- Year of Passing question -->
      <div role="listitem" class="Qr7Oae">
        <div role="heading" id="i20" class="M7eMe">Graduation: Year of Passing</div>
        <div role="radiogroup" aria-labelledby="i20">
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
                <input type="text" class="Hvn9fb zHQkBf" aria-label="Other response" />
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const profile = DEFAULT_PROFILES[0];
    const { fields } = scanForm(document);

    console.log('=== SCANNED FIELDS ===');
    for (const f of fields) {
      console.log({
        id: f.id,
        type: f.type,
        labelText: f.labelText,
        nearbyText: f.nearbyText,
        options: f.options,
      });
    }

    console.log('=== CLASSIFICATION ===');
    const items = [];
    for (const f of fields) {
      const guess = classifyField(f, profile);
      console.log({
        label: f.labelText,
        canonicalField: guess.canonicalField,
        confidence: guess.confidence,
        targetValue: guess.targetValue,
      });
      items.push({ field: f, guess });
    }

    console.log('=== FILLING ===');
    const outcomes = await fillFieldsSequentially(items, 0.6);
    for (const o of outcomes) {
      console.log({
        label: o.field.labelText,
        success: o.success,
        actionTaken: o.actionTaken,
        error: o.errorMessage,
      });
    }

    const btechRadio = document.querySelector('[data-value="B.Tech"]');
    const yearRadio = document.querySelector('[data-value="2027"]');
    console.log('B.Tech aria-checked:', btechRadio?.getAttribute('aria-checked'));
    console.log('2027 aria-checked:', yearRadio?.getAttribute('aria-checked'));

    expect(btechRadio?.getAttribute('aria-checked')).toBe('true');
    expect(yearRadio?.getAttribute('aria-checked')).toBe('true');
  });
});
