# Chrome Web Store Listing & Submission Guide: Applyr

This document is your **single source of truth** for publishing Applyr on the Chrome Web Store. Everything needed for the Chrome Developer Dashboard can be copied directly from this file.

---

## 📋 1. Store Metadata

- **Extension Name:** Applyr
- **Short Name:** Applyr
- **Version:** 1.0.0
- **Summary (under 132 chars):**
  > Local-first, privacy-focused intelligent autofill assistant for job applications across ATS portals and Google Forms.
- **Category:** Productivity / Workflow
- **Primary Language:** English
- **Visibility:** Public (or Unlisted if for private/university-only testing)

---

## 📝 2. Detailed Store Description (Copy & Paste)

```markdown
Tired of typing your contact details, education, CGPA, graduation years, links, and custom essays dozens of times across different career sites?

Applyr is a high-speed, local-first autofill assistant engineered specifically for job seekers applying across LinkedIn Easy Apply, Greenhouse, Lever, Workday, and university Google Forms.

Unlike generic autofill extensions or cloud-based job scrapers:

🔒 100% Local-First & Private
All candidate profiles, resumes, custom Q&A answers, and learned site mappings are stored exclusively on your device in chrome.storage.local. No account required, no remote servers, and zero telemetry or tracking pixels.

⚡ Explicit 1-Click Manual Trigger
Applyr NEVER modifies webpages in the background. Forms are scanned and filled ONLY when you explicitly open the extension and click "Auto-Fill Form".

🧠 Multi-Tier Matching Engine
- Standard HTML Autocomplete detection.
- Per-domain learned cache that remembers corrections you make.
- Weighted keyword dictionary handling degrees (B.Tech, M.Tech, BS, MS), passing years, branches, backlogs, and academic scores.
- Optional client-side AI fallback for open-ended essay prompts.

🛡️ Deep Framework & Google Forms Compatibility
- Bypasses React, Vue, and Angular synthetic event wrappers so inputs never clear on submit.
- Full Google Forms (Material Wiz) support: correctly selects ARIA radio buttons and checkboxes without typing into auxiliary "Other" text fields.
- Workday and React-Select custom combobox adapters.

🎯 Tailored Multi-Profiles
Seamlessly toggle between tailored personas (Software Engineering, Machine Learning, Product Management, General) with pre-configured project context and resume links.

Take back hours of your job search with Applyr!
```

---

## 🔐 3. Permissions Justifications (Chrome Web Store Review)

Google's review team requires a plain-English explanation for every requested permission. Copy and paste these exact lines:

| Permission / Host | Plain-English Justification for Review Team |
|---|---|
| `storage` | Stores user profiles (names, contact details, academic history), settings, and learned per-domain field mappings locally in `chrome.storage.local`. |
| `activeTab` | Accesses the active webpage DOM only upon explicit user click of the "Auto-Fill Form" button in the extension popup. |
| `scripting` | Programmatically executes the form-filling script on the active job application tab when the user triggers autofill. |
| `tabs` | Reads the active tab's hostname to look up domain-specific learned field mappings from local storage. |
| `host_permissions: ["<all_urls>"]` | Required to execute form scanning and autofilling across any employer career site or ATS domain (Greenhouse, Lever, Workday, LinkedIn, Google Forms, and custom company portals) where job applications are hosted. |

---

## 🎯 4. Single Purpose Statement

Paste this into the **Single Purpose** field:
> *"Autofill job application forms locally from user-managed candidate profiles without transmitting personal data to any external server."*

---

## 📜 5. Hosted Privacy Policy Template

> [!IMPORTANT]
> The Chrome Web Store requires a publicly accessible HTTPS link to your Privacy Policy.  
> You can create a free public GitHub Gist at [gist.github.com](https://gist.github.com) or enable GitHub Pages on your repository and link to this policy.

```markdown
# Privacy Policy for Applyr

Last Updated: September 2026

Applyr ("we", "our", or "the extension") is committed to protecting your privacy. This Privacy Policy explains our local-first data practices.

### 1. Data Collection and Storage
- **Local Storage Only**: All information entered into Applyr (including names, contact numbers, email addresses, academic scores, graduation details, resumes, and custom questions) is stored strictly on your local device using Chrome's `chrome.storage.local` API.
- **No Remote Servers**: Applyr does not maintain external database servers, user accounts, or cloud storage. We never collect, transmit, sell, or monetize your personal information.

### 2. Third-Party Analytics and Telemetry
- Applyr contains **zero** tracking pixels, Google Analytics, telemetry libraries, or third-party advertising SDKs.

### 3. Optional AI Features
- If the user explicitly enables the optional AI fallback feature and supplies their own API key, field labels and form prompts may be sent directly to the AI provider (e.g., Google Gemini) solely for field classification. Personal candidate information is never included in classification requests.

### 4. User Control
- You have complete control over your data. You can edit, export, or permanently delete your stored profiles and site caches at any time directly through the Applyr Options page or by uninstalling the extension.

### 5. Contact
For questions regarding this policy or the extension, contact the maintainer via GitHub: https://github.com/rizzit17/applyr
```

---

## 📦 6. Packaging & Release Checklist

1. **Build the production bundle**:
   ```bash
   npm run build
   ```
2. **Verify tests pass**:
   ```bash
   npm test
   ```
3. **Generate Release Zip**:
   - Make sure you zip the **contents** of `dist/` directly, so `manifest.json` is at the root of the zip archive.
   - PowerShell:
     ```powershell
     Compress-Archive -Path dist\* -DestinationPath applyr-release.zip -Force
     ```
   - Bash:
     ```bash
     cd dist && zip -r ../applyr-release.zip . && cd ..
     ```
4. **Graphic Assets Ready**:
   - `public/icons/icon-128.png` (128×128)
   - At least 1 Screenshot (1280×800 or 640×400)
   - Small promo tile (440×280)
