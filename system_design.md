# system_design.md — Deep Technical Design

## Core Systems

### 1. Form Detection Engine
**Goal:** produce a complete, deduplicated list of fillable elements on the page, including those inside same-origin iframes and open shadow roots.

```
function scanForm(root):
    candidates = root.querySelectorAll(
        'input:not([type=hidden]):not([type=submit]):not([type=button]),
         textarea, select, [role="combobox"], [contenteditable="true"]'
    )
    for el in candidates:
        if isVisible(el) and not isDisabled(el):
            fields.push(buildDetectedField(el))

    for iframe in root.querySelectorAll('iframe'):
        if isSameOrigin(iframe):
            fields += scanForm(iframe.contentDocument)
        else:
            note("cross-origin iframe skipped: " + iframe.src)

    for el with shadowRoot (open mode):
        fields += scanForm(el.shadowRoot)

    return dedupe(fields)
```

- `isVisible`: checks computed style (`display`, `visibility`, `opacity`), offsetParent, and viewport-adjacent (some multi-step forms keep future steps in the DOM but display:none).
- `buildDetectedField`: captures `{ el, name, id, type, placeholder, autocomplete, labelText, nearbyText, fieldSignature }`.
- Label resolution order: `<label for=id>` → wrapping `<label>` → `aria-labelledby` → `aria-label` → `placeholder` → nearest preceding text node within the same form group container.

### 2. Field Classification Logic
Tiered, short-circuiting pipeline — stop at the first tier that produces confidence above threshold:

| Tier | Signal | Typical Confidence |
|---|---|---|
| 1 | `autocomplete` attribute (HTML spec values) | 0.95 |
| 2 | Per-site cached mapping (exact `fieldSignature` match) | 0.9 |
| 3 | Keyword dictionary match against name/id/label/placeholder | 0.5–0.85 (scaled by match quality) |
| 4 | AI fallback (batched, only if enabled and still below threshold) | model-reported confidence, capped at 0.8 |

Keyword dictionary is a static map of canonical field → list of regex/substring patterns, e.g.:
```json
{
  "firstName": ["first.?name", "fname", "given.?name"],
  "lastName": ["last.?name", "lname", "family.?name", "surname"],
  "email": ["e.?mail"],
  "phone": ["phone", "mobile", "tel(ephone)?"],
  "linkedin": ["linkedin"],
  "github": ["github"],
  "portfolio": ["portfolio", "website", "personal.?site"],
  "currentTitle": ["current.?title", "job.?title", "position"],
  "yearsExperience": ["years.*experience", "yoe"]
}
```

### 3. Autofill Execution Engine
Handles the actual DOM writes, per element type:

- **Text/textarea:**
  ```js
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  ).set;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  ```
  This bypasses React's synthetic-event tracking of the native value setter, which is the standard trick to make controlled inputs actually update their rendered state.

- **Select:** set `.value` directly if an exact `<option value>` match exists; otherwise fuzzy-match against visible option text (case-insensitive, trimmed), then dispatch `change`.

- **Radio/checkbox groups:** find the option whose associated label text best matches the profile's target value, then call `.click()` on it rather than just setting `.checked = true` — some frameworks only react to real click events.

- **Custom dropdowns (React-Select/Workday-style div comboboxes):** implemented as small **site adapters** rather than generic logic: click the trigger element to open the menu, wait a tick (MutationObserver or short delay) for options to render, then click the matching option node by text content.

- **File inputs:** cannot be filled programmatically (browser security restriction on `FileList`/`input.files`). The engine instead flags the field and surfaces a UI prompt naming which resume variant to attach.

### 4. Mapping + Caching System
- Cache structure: `fieldMappingCache[hostname][fieldSignature] = canonicalFieldKey`.
- `fieldSignature` generation: stable hash combining lowercased `name`, `id`, and normalized label text — must tolerate minor whitespace/casing changes across page reloads but remain distinct across genuinely different fields on the same page.
  ```
  fieldSignature = hash(normalize(name) + '|' + normalize(id) + '|' + normalize(labelText))
  ```
- Cache write path: triggered by the Correction Listener when a user edits a filled field, or by a successful AI classification (to avoid ever re-asking the AI for the same field on the same site).
- Cache read path: checked as Tier 2 in classification, before falling back to keyword matching — a previously-corrected field should always win over a generic heuristic guess.

## Algorithms

### Field Matching Strategy
Combine multiple weighted signals rather than a single winner-take-all rule:
```
score = 0.5 * autocompleteMatchScore
      + 0.3 * keywordMatchScore
      + 0.2 * cacheMatchScore   (1.0 if exact cache hit, else 0)
finalGuess = canonicalField with highest combined score
confidence = min(1.0, score)
```
In practice, an exact cache hit or `autocomplete` match should dominate and short-circuit rather than always computing the full weighted blend — the table above (tiered, short-circuiting) is the actual implementation; the weighted formula is useful conceptually for tie-breaking when two keyword patterns both partially match.

### Confidence Scoring
- Confidence below `settings.confidenceThreshold` (default 0.6) → field is left unfilled and visually flagged rather than guessed wrong. **Wrong silent fills are worse than visible gaps** — a flagged empty field draws the user's attention; a wrongly-filled field can slip through unnoticed into a submitted application.
- Confidence is surfaced in the popup summary and via a colored outline on the field itself (green = high confidence auto-filled, amber = filled but low confidence, gray = left blank / needs manual entry).

### Fallback Mechanisms
1. If no signal produces confidence ≥ threshold and AI fallback is disabled → leave blank, flag for manual entry.
2. If AI fallback is enabled → batch all such fields from the current page into a single classification request; apply results; persist to cache regardless of outcome (even a "no match" result is worth caching briefly, to avoid repeatedly asking about a field that genuinely doesn't map to the profile, e.g., a company-specific compliance question).
3. If the AI call fails (network error, timeout) → treat identically to "AI disabled" case for that run; do not retry automatically (avoid latency/cost spirals), surface a small "AI fallback unavailable" note in the popup.

## Edge Cases

### React/Controlled Inputs
Covered above via native setter + dispatched `input`/`change` events. Additional nuance: some frameworks (older Angular, some Vue 2 forms) also listen for `keydown`/`keyup` for masked inputs (phone number formatting) — for these, dispatching a `change` event alone may not trigger the mask formatter. Mitigation: for fields detected as masked (heuristic: has `pattern` attribute or a data-mask-like attribute), simulate a minimal keystroke sequence (dispatch `keydown`/`keyup` for the last character) after setting the value, as a targeted adapter rather than a global default (keeps the common path fast).

### Shadow DOM / Iframes
- Open shadow roots are traversable (`element.shadowRoot` is accessible); closed shadow roots are not — if a site uses `mode: 'closed'`, those fields are simply invisible to the scanner. Document this as a known limitation rather than attempting any workaround (there isn't a supported one).
- Same-origin iframes are recursed into directly. Cross-origin iframes (common in some embedded ATS widgets) cannot be accessed due to browser same-origin policy — flag these areas in the UI as "form section not accessible" rather than silently skipping without explanation.

### Anti-Bot Behaviors
- Some ATS platforms rate-limit or flag unusually fast form completion. Mitigation: stagger fills with small randomized delays (50–150ms) between fields rather than writing all values in a single synchronous loop — this also happens to be necessary for framework re-render stability, so it serves both purposes.
- Avoid any behavior that could be construed as scraping/automating a *submission* — this tool only fills fields; the user always manually reviews and clicks "Submit" themselves. This is both a UX safeguard (constraint: "manual trigger, avoid intrusive auto-fill") and a reasonable line to avoid triggering anti-automation defenses tied to full end-to-end submission bots.

## Data Structures

### Profile Schema
```typescript
interface Profile {
  id: string;
  name: string;                  // e.g. "Backend", "ML"
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
  };
  links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  experience: {
    currentTitle: string;
    yearsExperience: number;
    summary: string;              // used for "why are you interested" style fields
  };
  education: {
    degree: string;
    institution: string;
    graduationYear: number;
  };
  resumeFileName: string;         // for the manual-attach prompt, not actual file data
  customAnswers?: Record<string, string>; // free-form Q&A overrides keyed by normalized question text
}
```

### Field Mapping Cache
```typescript
interface FieldMappingCache {
  [hostname: string]: {
    [fieldSignature: string]: {
      canonicalField: string;
      confidence: number;
      lastUpdated: number; // epoch ms
      source: 'user-correction' | 'ai' | 'manual-override';
    };
  };
}
```

## Performance Design
- **Minimize DOM operations:** batch all `querySelectorAll` calls per scan rather than querying repeatedly per field type; compute visibility/label extraction in a single pass over the candidate list.
- **Efficient querying:** scope `MutationObserver` to the form container (or `document.body` with a debounce) rather than firing on every micro-mutation; only re-scan on user-triggered fill, not continuously, to avoid background CPU cost while the user is just browsing the page.
- **Avoid layout thrashing:** read all needed style/geometry properties before writing any values (don't interleave `getComputedStyle` reads with DOM writes in a loop).
- **Target:** full scan + classify + fill cycle on a ~40-field form completes in under 300ms excluding any AI network call, keeping the interaction feeling instantaneous when the user clicks "Fill."

## Extensibility

### Adding Site-Specific Adapters
- Keep a small `adapters/` registry keyed by hostname pattern (e.g., `*.myworkdayjobs.com`, `job-boards.greenhouse.io`) for site-specific quirks: custom dropdown click sequences, multi-step form navigation helpers, or known field-signature overrides.
- Adapters should be **additive, opt-in overrides** on top of the generic engine, not forks of it — the generic pipeline must remain the default and adapters only patch specific known pain points (e.g., "on Workday, the state dropdown needs two clicks").

### Scaling to More Complex Workflows
- **Multi-step forms:** the fill engine can be re-invoked per step (user clicks "Fill" again on each new step, or the extension can detect a step change via URL/DOM signature and offer to auto-continue) — avoid trying to solve full multi-step orchestration in v1; manual re-trigger per step is acceptable given the "manual trigger, no intrusive auto-fill" constraint.
- **Cover-letter/free-text generation:** `customAnswers` in the profile schema already supports keyed overrides for recurring free-text questions; an AI-assisted "draft an answer to this specific question using my profile" feature could be added later as a strictly opt-in, separate action from the core fill (not blended into the automatic fill pipeline, to keep the core path fast and deterministic).
- **Cross-device use:** if ever needed, the profile/cache JSON export-import already supported in the Options page is sufficient for manual transfer; a full sync mechanism is deliberately deferred (see `tech_stack.md`).

---

## Bonus: Example Field Mappings
| DOM Signal | Canonical Field |
|---|---|
| `name="firstName"`, `autocomplete="given-name"` | `firstName` |
| `id="lname"`, label "Last Name" | `lastName` |
| `placeholder="you@example.com"`, `type="email"` | `email` |
| label "LinkedIn Profile URL" | `links.linkedin` |
| label "How many years of experience do you have?" | `experience.yearsExperience` |

## Bonus: Sample Profile JSON
```json
{
  "id": "backend-profile",
  "name": "Backend",
  "personal": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "phone": "+1-555-123-4567",
    "location": "San Francisco, CA"
  },
  "links": {
    "linkedin": "linkedin.com/in/janedoe",
    "github": "github.com/janedoe",
    "portfolio": "janedoe.dev"
  },
  "experience": {
    "currentTitle": "Backend Engineer",
    "yearsExperience": 4,
    "summary": "Backend engineer specializing in distributed systems and API design."
  },
  "education": {
    "degree": "B.S. Computer Science",
    "institution": "State University",
    "graduationYear": 2022
  },
  "resumeFileName": "jane_doe_backend_resume.pdf",
  "customAnswers": {
    "why do you want to work here": "I'm drawn to the team's focus on distributed systems at scale."
  }
}
```

## Bonus: Future Upgrade Ideas
- Confidence-weighted A/B suggestion UI: when two canonical fields are close in score, show a small inline picker instead of guessing outright.
- Per-question learning for free-text `customAnswers` — detect recurring question phrasing across sites and suggest reusing a previous answer.
- Lightweight local analytics (stored only locally) tracking time saved / fields auto-filled, purely for the user's own visibility — never transmitted anywhere.
