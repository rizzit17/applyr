# Chrome Web Store Listing & Technical Specification: Applyr

## Metadata
- **Extension Name:** Applyr
- **Short Name:** Applyr
- **Version:** 1.0.0
- **Summary:** Local-first, manual-trigger autofill assistant that learns your job application form fields.
- **Category:** Productivity / Workflow
- **Languages:** English

## Detailed Store Description
Applyr is a personal-use, privacy-first Chrome extension that automates repetitive job application forms across LinkedIn Easy Apply, Greenhouse, Lever, Workday, and custom career portals.

Unlike generic autofill tools or cloud-based scrapers:
- **100% Local-First:** All profile data and learned field mappings are stored exclusively on your device in `chrome.storage.local`. No personal data is ever uploaded to a server.
- **Manual Trigger Only:** Forms are only filled when you explicitly click "Fill This Form" in the extension popup — zero passive or unexpected background activity.
- **Learns from Corrections:** If an unusual ATS field is mapped incorrectly, simply correct the value. Applyr records the site's field signature and gets it right next time.
- **Visual Confidence Highlighting:** High-confidence fields are outlined in green, while fields needing manual review are outlined in amber.
- **Framework-Safe:** Uses native prototype setters and synthetic event dispatching to ensure compatibility with modern controlled inputs (React, Vue, Angular).

## Permissions Justification

| Permission | Justification |
|---|---|
| `storage` | Required to store user profiles (names, contact info, job history), settings, and learned per-site field mappings in `chrome.storage.local`. |
| `activeTab` | Required to securely access and interact with the job application form on the active tab when the user clicks "Fill This Form". |
| `scripting` | Required to inject the autofill execution script into the active job application tab on demand. |
| `tabs` | Required to read the active tab's hostname in order to retrieve the site-specific learned mapping cache. |
| `host_permissions: ["<all_urls>"]` | Required to execute form scanning and autofilling across any employer career site or ATS domain (LinkedIn, Greenhouse, Lever, Workday, custom domains) where job applications are hosted. |

## Privacy & Data Use
- **Personal Data Storage:** Retained strictly within the user's local browser environment (`chrome.storage.local`).
- **No Third-Party Analytics:** Contains no analytics, tracking pixels, or remote telemetry.
- **Optional AI Fallback:** Feature-flagged and disabled by default. When enabled, only field metadata (field label, HTML input type, placeholder) is transmitted to classify unidentified fields; personal candidate details are never included.
