# context.md — Product & Engineering Context

## Problem Statement
Job applications require re-entering the same personal data — name, contact info, links, work history, education, EEO answers — across dozens of application portals (LinkedIn, Workday, Greenhouse, Lever, and countless bespoke ATS instances). For an active job seeker submitting 20–100+ applications, this is repetitive, error-prone, and a significant time sink that adds no value over simply having the data typed once.

## Why Existing Autofill Tools Are Insufficient
- **Generic browser autofill** (Chrome's built-in) only handles a small canonical set of address/payment fields and fails on ATS-specific field naming, custom dropdowns, and multi-step forms.
- **SaaS autofill extensions** (e.g. Simplify, LazyApply-style tools) are built for the general population: they optimize for broad compatibility over reliability for any one user, store data on third-party servers (privacy concern), monetize through subscriptions/ads, and are frequently broken by ATS DOM changes because they must support thousands of unknown sites at once.
- **Resume-parsing autofill** re-derives structured data from unstructured resume text every time, which is inherently lossy and inconsistent — the same "years of experience" or "current title" can parse differently run to run.
- None of these tools **learn from a single user's corrections** in a way that compounds — they optimize for day-one coverage, not week-fifty reliability for one person.

## Why a Personal-First Approach Is Better
- The data is **fixed and known in advance** — there is no need for parsing or inference; the profile is authored once and referenced deterministically.
- Reliability can be optimized **per-site** rather than generically, since the user only applies through a small, recurring set of ATS platforms (LinkedIn, Workday, Greenhouse, Lever, maybe 2–3 others).
- A **local-first, single-user architecture** removes privacy risk (no personal data leaves the device except optionally-anonymized field labels for AI fallback) and removes the cost/complexity of running any backend.
- A **learning cache keyed by site** means the tool gets strictly better the more it's used, converging toward near-zero manual correction after the first few applications per platform.

## Target Usage Scenarios
1. User opens a job posting on LinkedIn Easy Apply, Workday, Greenhouse, or Lever.
2. User selects the relevant profile variant (e.g., "Backend" vs "ML" — different summaries/links/experience framing).
3. User clicks "Fill This Form" in the extension popup.
4. Extension scans the visible form, classifies fields, and fills them; low-confidence fields are visually flagged.
5. User reviews flagged fields, corrects any mismatches (which the extension silently learns from), attaches resume manually, and submits.
6. On the next application to the same ATS/site, previously-corrected fields are filled correctly automatically.

## Constraints and Assumptions
- Single user, single machine (or synced via the user's own Chrome profile) — no multi-tenant data model needed.
- Manifest V3 only (Chrome's current extension platform).
- No backend server required for core functionality; AI fallback, if enabled, is the only component that talks to an external API, and only sends field metadata, never full personal data.
- File uploads (resume attachment) cannot be fully automated due to browser security restrictions on `<input type="file">` — this is a known, accepted limitation, not a defect to "solve around."
- The user is technical enough to maintain their own profile JSON and tolerate occasional manual correction, especially in the first uses against a new site.

## Success Metrics
- **Time reduction:** ≥70% reduction in manual keystrokes/clicks per application after the first 2–3 uses per ATS platform.
- **Field accuracy:** ≥80% of common fields (contact info, links, standard experience fields) filled correctly without AI assistance, using heuristics + cache alone.
- **Convergence:** Correction rate for a given site should trend toward zero within 3–5 applications to that same platform, due to the learning cache.
- **Reliability:** Zero cases of the extension crashing or corrupting the host page's form state; failed fills should degrade gracefully (flag for manual entry) rather than silently fail.
- **Scope discipline:** No feature creep into multi-user support, remote sync, or SaaS-style analytics — success is measured purely by personal time saved and reduced error rate, not by adoption or scale.
