# tech_stack.md — Technology Decisions

## Chrome Extension Platform
**Decision:** Manifest V3, using `chrome.scripting.executeScript` for on-demand content-script injection where possible (rather than a permanently-injected content script), plus a persistent-in-manifest content script only for lightweight passive scanning if needed.

- **Why MV3:** It's the only supported platform going forward (MV2 is deprecated/removed). Service workers replace persistent background pages, which fits this tool well since it's event-driven (user clicks "Fill"), not continuously active.
- **Tradeoff:** Service workers are non-persistent and can be killed between events — this forces good state discipline (everything durable goes to `chrome.storage`, nothing important lives only in worker memory). This is a net positive constraint: it prevents architectural sloppiness even though it adds minor boilerplate.

## Frontend (Popup + Options UI)
**Decision:** Plain React + TypeScript, bundled with Vite (`@crxjs/vite-plugin`), styled with a minimal utility CSS approach (Tailwind or hand-rolled CSS — no heavy UI framework).

- **Why React:** Small, well-known component model for a popup with a handful of interactive elements (profile dropdown, fill button, status list, options CRUD form). Team/solo-dev familiarity outweighs the marginal bundle-size cost for a personal tool.
- **Why not vanilla JS:** The options page (profile CRUD, JSON import/export, cache management) benefits from component structure; hand-rolled DOM manipulation for CRUD forms is more error-prone than the payoff of avoiding a framework.
- **Why not Vue/Svelte:** No strong reason to prefer either; React is chosen for ecosystem familiarity, not because it's objectively better here — this is a low-stakes choice.

## Storage
**Decision:** `chrome.storage.local` for all data (profiles, field-mapping cache, settings). Do **not** use `chrome.storage.sync`.

- **Why local over sync:** `chrome.storage.sync` has small per-item and total quota limits (100KB total, 8KB per item as of current Chrome limits) which is too small once the mapping cache grows across many sites. `chrome.storage.local` has a much larger quota (10MB default, extendable via `unlimitedStorage` permission) and keeps personal data from being synced through Google's infrastructure — better privacy posture for a personal-data-heavy tool.
- **Why not IndexedDB directly:** `chrome.storage.local` is suffient for this data volume (profiles are small JSON, cache entries are small key→string mappings). IndexedDB would add complexity (schema/versioning, transactions) with no real benefit at this scale. Revisit only if the mapping cache grows into the tens of thousands of entries.
- **Why not a real database/backend:** Explicitly rejected per constraints — this is local-first, single-user, and a backend would add deployment/maintenance burden with zero benefit for a tool used by one person on their own machine.

## Parsing
**Decision:** No resume/document parsing pipeline. Profile data is hand-authored once (with an initial one-time assist, e.g., manually copying from an existing resume) and stored as structured JSON. Rich-text fields (e.g., a "why do you want to work here" free-text answer) are also stored as static profile templates, not generated per-application by default.

- **Why not parse a resume PDF each time:** Parsing is inherently lossy and non-deterministic; since the user's data is fixed and known, hand-authoring once removes an entire class of bugs (mis-parsed dates, garbled bullet text) for negligible one-time cost.

## AI Usage
**Decision:** Optional, off by default, used only as a **fallback classifier** for fields the heuristic tiers cannot confidently map — never as the primary mechanism.

- **When used:** A page has fields whose label/name/placeholder don't match any keyword dictionary entry, `autocomplete` attribute, or cached mapping.
- **Why fallback-only, not primary:** Calling an LLM for every field on every form is slow (network round-trip), costs money over hundreds of applications, and is unnecessary — deterministic heuristics already cover the great majority of fields reliably and instantly.
- **Why batched:** Send all unmapped fields on a page in a single request rather than one call per field, minimizing latency and cost.
- **What's sent:** Only field metadata (label text, nearby DOM text, input type) plus the list of canonical profile keys to choose from — never the user's actual personal data values. This keeps the privacy surface minimal even when AI is enabled.
- **Model choice:** Any capable low-cost model (e.g., Claude Haiku-class) is sufficient for this classification task; it doesn't need heavy reasoning, just accurate mapping between short label text and a fixed taxonomy.

## Optional Backend
**Decision:** No backend service.

- **Why it's not needed:** All functionality (storage, matching, caching, execution) runs entirely client-side in the browser. The only external network call in the entire system is the optional, batched AI fallback request — which can go directly from the extension to an LLM API without an intermediary server.
- **When it *might* be justified later:** If the user wants cross-device sync of profiles/cache without relying on `chrome.storage.sync`'s limits, a tiny personal sync endpoint (e.g., a single file in a private GitHub Gist or personal cloud storage) could be added — but this is explicitly out of scope for v1 and should not be built preemptively.

## Simpler vs. Scalable Choices Summary
| Decision Point | Simpler Choice (Chosen) | Scalable/Complex Alternative (Rejected) |
|---|---|---|
| Storage | `chrome.storage.local` | IndexedDB / remote DB |
| Architecture | Local-first, no backend | Multi-tenant SaaS backend |
| Data input | Hand-authored profile JSON | Automated resume parsing pipeline |
| AI usage | Optional fallback, batched | AI-first field mapping for every field |
| Frontend | React + Vite, minimal styling | Full design system / component library |
| Sync | None (local only) in v1 | Real-time multi-device sync service |

Every "scalable" alternative was rejected specifically because this is a single-user tool where reliability and low maintenance burden matter far more than horizontal scale or generality.
