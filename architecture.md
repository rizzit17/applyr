# architecture.md — System Architecture

## Components Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Chrome Browser                        │
│                                                               │
│  ┌───────────┐        ┌──────────────────┐                   │
│  │  Popup UI │◄──────►│  Background       │                   │
│  │ (React)   │  msgs  │  Service Worker   │                   │
│  └───────────┘        └────────┬──────────┘                  │
│                                 │  msgs                       │
│                                 ▼                             │
│                        ┌──────────────────┐                  │
│                        │  Content Script   │                  │
│                        │  (per active tab) │                  │
│                        │  - Form Scanner   │                  │
│                        │  - Classifier     │                  │
│                        │  - Fill Engine    │                  │
│                        └────────┬──────────┘                  │
│                                 │ DOM ops                     │
│                                 ▼                             │
│                        ┌──────────────────┐                  │
│                        │  Target Page DOM  │                  │
│                        │ (LinkedIn/Workday/│                  │
│                        │  Greenhouse/Lever)│                  │
│                        └──────────────────┘                  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │             chrome.storage.local                        │ │
│  │  - profiles (multiple named profiles)                   │ │
│  │  - fieldMappingCache (per-hostname learned mappings)     │ │
│  │  - settings (AI fallback toggle, confidence threshold)   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌───────────┐                                                │
│  │ Options   │  (profile CRUD, cache management, settings)   │
│  │ Page      │                                                │
│  └───────────┘                                                │
└─────────────────────────────────────────────────────────────┘
                                 │  (only if AI fallback enabled)
                                 ▼
                     ┌───────────────────────┐
                     │  External LLM API      │
                     │  (field metadata only) │
                     └───────────────────────┘
```

## Component Responsibilities

### Popup (React)
- Entry point for user interaction. Shows active profile selector, "Fill This Form" button, and a live result summary after fill ("14/16 filled, 2 need review").
- Sends a `TRIGGER_FILL` message to the background worker with the selected profile ID.
- Has no direct DOM access to the page — all page interaction goes through the content script.

### Background Service Worker
- Stateless message router and orchestrator. On `TRIGGER_FILL`:
  1. Loads the active profile and relevant cache slice from `chrome.storage.local`.
  2. Ensures the content script is injected into the active tab (`chrome.scripting.executeScript` if not already present, or relies on manifest-declared content script).
  3. Sends a `RUN_FILL` message with profile + cache data to the content script.
  4. Relays the `FILL_RESULT` message back to the popup for display.
- Also owns the optional AI fallback call (background workers can make network requests; content scripts should avoid it to keep CSP concerns isolated to one place).

### Content Script (Injected into target tab)
- **Form Scanner:** walks the DOM (including same-origin iframes and open shadow roots) to produce a list of `DetectedField` objects.
- **Classifier:** for each detected field, applies the tiered matching strategy (autocomplete attribute → keyword dictionary → per-site cache → AI fallback) to produce a `FieldGuess` with confidence score.
- **Fill Engine:** given guesses above a confidence threshold, writes values into the DOM using framework-safe techniques (native setter + dispatched events), and visually highlights low-confidence fills for user review.
- **Correction Listener:** after a fill completes, attaches lightweight `change` listeners to filled fields for a short window, so if the user manually corrects a value, the correction is captured and sent back to the background worker to persist into the mapping cache.

### Options Page
- Full CRUD UI for profiles (create/edit/delete/duplicate/import/export as JSON).
- Cache management: view/clear per-site learned mappings.
- Settings: AI fallback toggle, confidence threshold slider, any other tunables.

### Storage Layer (`chrome.storage.local`)
- `profiles`: `{ [profileId]: Profile }`
- `fieldMappingCache`: `{ [hostname]: { [fieldSignature]: canonicalFieldKey } }`
- `settings`: `{ aiFallbackEnabled: boolean, confidenceThreshold: number }`

## Data Flow: User Click → Autofill (Event Lifecycle)

1. **User clicks "Fill This Form"** in the popup, having selected a profile.
2. Popup sends `{ type: 'TRIGGER_FILL', profileId }` to the background worker via `chrome.runtime.sendMessage`.
3. Background worker reads `profiles[profileId]` and `fieldMappingCache[currentHostname]` from storage.
4. Background worker sends `{ type: 'RUN_FILL', profile, cache }` to the content script in the active tab via `chrome.tabs.sendMessage`.
5. Content script's Form Scanner walks the live DOM and produces `DetectedField[]`.
6. Classifier processes each field: check autocomplete attribute → check keyword dictionary → check cache → (if still low-confidence and AI enabled) collect into a batch and request classification from background worker, which calls the external LLM API and returns results.
7. Fill Engine applies values to the DOM for all fields with confidence ≥ threshold; fields below threshold are left empty and visually flagged (e.g., amber outline) for manual attention.
8. Content script sends `{ type: 'FILL_RESULT', filledCount, flaggedFields }` back through the background worker to the popup, which updates its status display.
9. Correction Listener remains attached for a short window (e.g., until the user navigates away or a timeout); any `change` event on a previously-filled field is captured as `{ hostname, fieldSignature, newCanonicalGuess }` and sent to the background worker to update `fieldMappingCache` in storage.

## Interaction Between Components
- All cross-context communication uses `chrome.runtime` / `chrome.tabs` messaging — no shared global state between popup, background, and content script contexts (they run in fully separate JS realms).
- The **background worker is the only component that talks to storage and the external API** in the common path; the content script is deliberately kept "dumb" (DOM-only) so its logic is easy to reason about and doesn't need storage/network permissions itself. This also means if the AI call fails or is slow, it doesn't block the synchronous parts of the DOM fill.

## Security Considerations
- **Least privilege:** content script only requests `activeTab` + `scripting`, not broad host permissions unless necessary; injected on-demand rather than declared for `<all_urls>` at all times, reducing the extension's footprint on every page the user visits.
- **No remote code execution:** all logic ships in the extension bundle; no `eval`, no fetching and executing remote JS (standard MV3 CSP already disallows this).
- **Data minimization for AI fallback:** only field labels/metadata are sent to the external API, never actual personal data values — even though the tool is single-user, this limits exposure if the API key or network is ever compromised, and avoids sending values that don't need to leave the device.
- **Storage isolation:** `chrome.storage.local` data is sandboxed to the extension and not accessible to web pages or other extensions.
- **No third-party analytics/tracking:** since this is a personal tool, there's no telemetry pipeline that could leak usage patterns or personal data externally.
- **File input handling:** the extension never attempts to programmatically inject files into `<input type="file">` (browsers block this for security reasons) — it only assists by prompting the user at the right moment, avoiding any workaround that might resemble exploiting a browser security boundary.
