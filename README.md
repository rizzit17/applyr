# Applyr

> **The Local-First, Privacy-Focused Intelligent Form Autofill Assistant for Job Seekers.**  
> Effortlessly autofill job applications across LinkedIn Easy Apply, Greenhouse, Lever, Workday, and university Google Forms with zero cloud tracking.

[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-3178c6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/UI-React%2019%20%2B%20TailwindCSS-61dafb.svg)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-25%2F25%20Passing-success.svg)](https://vitest.dev/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local--First-brightgreen.svg)](#privacy--security)

---

## Table of Contents
1. [Overview & Highlights](#overview--highlights)
2. [Why Applyr?](#why-applyr)
3. [Key Features](#key-features)
4. [Architecture & How It Works](#architecture--how-it-works)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Installation & Local Setup](#installation--local-setup)
8. [Automated Testing](#automated-testing)
9. [Publishing to the Chrome Web Store](#publishing-to-the-chrome-web-store)
10. [Privacy & Security](#privacy--security)
11. [License](#license)

---

## Overview & Highlights

Applying for internships and full-time roles is repetitive and tedious. Job seekers spend countless hours re-typing the same contact details, CGPA scores, graduation years, links, and essays across disparate Applicant Tracking Systems (ATS) and college placement portals.

**Applyr** is a high-speed, local-first Chrome extension (Manifest V3) engineered to automate this workflow. It intelligently detects, classifies, and fills complex form fields, including custom React Select dropdowns, Workday components, and tricky Google Forms radio groups, while keeping **100% of your personal data on your local device**.

---

## Why Applyr?

| Feature | Standard Browser Autofill | Generic Web Scrapers | Applyr |
|---|---|---|---|
| **Privacy & Storage** | Syncs to Google account | Uploads data to remote cloud | **100% Local (`chrome.storage.local`)** |
| **Custom Portals** | Fails on custom divs / SPAs | Fragile XPath / CSS hacks | **Framework-Safe Native Setters + Adapters** |
| **Google Forms & Radios** | Cannot select custom ARIA radios | Types into "Other" field | **Wiz Event Traverser (Native Selection)** |
| **Multi-Profile Support** | Single user profile | Rare / Paid tier | **Multiple Profiles (SDE, AI/ML, PM, etc.)** |
| **Active Learning** | No learning | Rigid selectors | **Per-Domain Correction Learning Cache** |
| **Trigger Control** | Automatically triggers / intrusive | Background polling | **Explicit User Trigger Only ("1-Click")** |

---

## Key Features

### 1. Multi-Profile Management
- Switch effortlessly between tailored personas (e.g., **Software Engineering**, **AI / Machine Learning**, **Product Management**).
- Each profile stores distinct resumes, projects, summaries, GitHub, LinkedIn, and portfolio URLs.

### 2. 4-Tier Intelligent Matching Engine
Applyr classifies fields using a short-circuiting cascade:
1. **Tier 1 - HTML Autocomplete**: Detects standard browser autocomplete tokens (`given-name`, `email`, `tel`, etc.).
2. **Tier 2 - Learned Per-Site Cache**: Remembers previous user corrections for specific domains using SHA-256 field signatures.
3. **Tier 3 - Weighted Keyword & Custom Q&A Dictionary**: Advanced fuzzy matching for academic scores, degrees (`B.Tech`), graduation years (`2027`), citizenship, arrears, and campus questions.
4. **Tier 4 - Optional AI Fallback**: Optional client-side API call (e.g., Gemini) for unstructured essay prompts (feature-flagged, disabled by default).

### 3. Framework-Safe DOM Autofill
- **Bypasses React / Vue / Angular Synthetic Wrappers**: Uses `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set` followed by bubbling `input`, `change`, and `blur` events so reactive state forms never wipe the filled data upon submission.
- **Deep Google Forms Support**: Traverses Google Forms Material Wiz components, handles initial `aria-disabled` attributes, triggers multi-target pointer/mouse event sequences, and selects predefined radio buttons without erroneously writing into auxiliary text fields.
- **Custom ATS Adapters**: Built-in compatibility modules for Workday custom inputs and React Select comboboxes.

### 4. Active Learning from Corrections
- When you manually modify an autofilled field on an unfamiliar career site, Applyr detects the change, computes a stable field signature, and stores the mapping locally. The next time you visit that ATS, it fills it with 100% accuracy.

---

## Architecture & How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                       Applyr Extension                      │
├──────────────────────┬──────────────────────┬───────────────┤
│    Popup / Options   │  Background Service  │    Content    │
│      (React UI)      │    Worker (MV3)      │    Script     │
├──────────────────────┼──────────────────────┼───────────────┤
│ • Profile Switcher   │ • chrome.storage     │ • scanner.ts  │
│ • Custom Q&A Manager │ • Message router     │ • filler.ts   │
│ • Site Cache Reset   │ • Script injection   │ • adapters/   │
└──────────┬───────────┴──────────┬───────────┴───────┬───────┘
           │                      │                   │
           ▼                      ▼                   ▼
    chrome.storage          Tabs & Host API      Webpage DOM
   (Local Profiles)      (Active Job Portal)    (Form Fields)
```

1. **Popup Interaction**: User clicks **"Auto-Fill Form"** on any career page or Google Form.
2. **Background Dispatch**: The Service Worker routes the active tab metadata and active profile to the content script.
3. **DOM Scanning**: `scanner.ts` traverses the document, open Shadow DOMs, and accessible iframes to extract candidate fields and labels.
4. **Classification**: `classifier.ts` scores each field against profile attributes and site caches.
5. **Execution**: `filler.ts` dispatches framework-safe events to populate inputs, select dropdown options, and toggle radio buttons.

---

## Tech Stack

- **Core Language**: TypeScript 5.7
- **UI Framework**: React 19 + ReactDOM 19
- **Styling**: Tailwind CSS 3.4 + Vanilla CSS Design Tokens
- **Icons**: Lucide React
- **Build Tool**: Vite 6 (custom Rollup config for Manifest V3 background worker & content script chunks)
- **Test Runner**: Vitest 3.0 + JSDOM
- **Platform**: Google Chrome Extensions Manifest V3

---

## Project Structure

```
applyr/
├── public/
│   ├── icons/                 # 16x16, 48x48, 128x128 extension icons
│   └── manifest.json          # Chrome Manifest V3 configuration
├── src/
│   ├── background/
│   │   └── index.ts           # MV3 background service worker
│   ├── content/
│   │   ├── adapters/          # Workday & React Select custom adapters
│   │   ├── corrections.ts     # Real-time user edit listener & cache recorder
│   │   ├── filler.ts          # Framework-safe input setter & radio/select clicker
│   │   ├── highlighter.ts     # Visual confidence feedback & manual review badges
│   │   ├── index.ts           # Content script message coordinator
│   │   └── scanner.ts         # DOM scanner & label context resolver
│   ├── core/
│   │   ├── classifier.ts      # 4-tier field classification pipeline
│   │   ├── dictionary.ts      # Weighted keyword rules & autocomplete mappings
│   │   ├── hash.ts            # SHA-256 field signature generator
│   │   ├── schema.ts          # Default profiles, settings, and storage helpers
│   │   └── types.ts           # TypeScript interfaces & domain models
│   ├── options/               # Options Page (Profiles, Custom Q&A, Settings)
│   └── popup/                 # Extension Action Popup (1-click fill & profile select)
├── tests/                     # 25 Vitest unit & integration tests
├── vite.config.ts             # Vite build & bundle configuration
└── package.json
```

---

## Installation & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Google Chrome** (or Chromium-based browser like Brave, Edge)

### 1. Clone the Repository
```bash
git clone https://github.com/rizzit17/applyr.git
cd applyr
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Extension
```bash
npm run build
```
This outputs the compiled extension bundle into the `dist/` directory.

### 4. Load into Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select the `applyr/dist` folder.
5. The **Applyr** icon will appear in your Chrome extension bar!

---

## Automated Testing

Applyr includes automated test suites covering form scanning, two-pass radio matching, framework bypasses, and real-world Google Form HTML:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## Publishing to the Chrome Web Store

Want to publish Applyr to the Chrome Web Store so friends or other developers can install it with one click? Follow this step-by-step guide.

### Step 1: Create a Clean Production Zip
The Chrome Web Store requires a `.zip` file containing only the build artifacts.

1. Build the latest production assets:
   ```bash
   npm run build
   ```
2. Create a zip of the `dist/` folder contents (make sure files like `manifest.json` are in the root of the zip, not inside an extra parent folder):

   **On Windows (PowerShell):**
   ```powershell
   Compress-Archive -Path dist\* -DestinationPath applyr-release.zip -Force
   ```

   **On macOS / Linux:**
   ```bash
   cd dist && zip -r ../applyr-release.zip . && cd ..
   ```

### Step 2: Register a Chrome Developer Account
1. Visit the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Sign in with your Google account.
3. Pay the one-time **$5 USD** registration fee (required by Google to prevent spam).

### Step 3: Upload the Package
1. In the Developer Dashboard, click **Add new item**.
2. Drag and drop your `applyr-release.zip` file.
3. Chrome will automatically read your `manifest.json`.

### Step 4: Complete Store Listing Information
Copy and paste the pre-written metadata from [`CHROMEWEBSTORE.md`](./CHROMEWEBSTORE.md):
- **Product Name**: `Applyr`
- **Summary**: `Local-first, manual-trigger autofill assistant that learns your job application form fields.`
- **Category**: `Productivity / Workflow`
- **Detailed Description**: Use the detailed text provided in `CHROMEWEBSTORE.md`.

### Step 5: Upload Store Graphic Assets
Google requires the following image assets:
- **Store Icon**: 128x128 PNG (located at `public/icons/icon-128.png`).
- **Screenshots**: At least 1 screenshot (1280x800 or 640x400 PNG/JPEG) demonstrating:
  - The Applyr extension popup.
  - The profiles / custom Q&A options dashboard.
  - A form autofilled with Applyr.
- **Small Promo Tile** (optional but recommended): 440x280 PNG.

### Step 6: Privacy & Permissions Justification
Google's review team strictly audits permissions. Paste these exact justifications into the **Privacy practices** tab:

| Requested Permission | Plain-English Justification for Reviewer |
|---|---|
| `storage` | Stores candidate profiles, custom Q&A answers, and learned per-site form mappings exclusively on the user's local machine in `chrome.storage.local`. |
| `activeTab` | Accesses the current tab only when the user explicitly clicks "Auto-Fill Form" in the popup to execute form filling. |
| `scripting` | Dynamically executes the form filling script on the active job application tab upon user trigger. |
| `tabs` | Reads the active tab's hostname to look up domain-specific learned field mappings. |
| `host_permissions: ["<all_urls>"]` | Required to autofill job applications across any employer career site or ATS domain (Greenhouse, Lever, Workday, LinkedIn, Google Forms). |

- **Single Purpose**: *"Autofill job application forms locally from user-managed candidate profiles."*
- **Privacy Policy**: Host a simple privacy policy on GitHub Pages or as a GitHub Gist (see [`CHROMEWEBSTORE.md`](./CHROMEWEBSTORE.md) for template).

### Step 7: Submit for Review
1. Click **Submit for Review**.
2. Standard review usually takes **24 to 72 hours**. Once approved, your extension will be live on the Chrome Web Store!

---

## Privacy & Security

Applyr was built from day one under strict local-first privacy principles:
- **Zero Remote Storage**: All personal details (names, contact info, resumes, marks) reside solely in your browser's `chrome.storage.local`.
- **No Third-Party Analytics**: No Google Analytics, no Mixpanel, no tracking pixels, and no telemetry pings.
- **No Unsolicited Network Requests**: Applyr makes zero network requests during normal operation.
- **Source Available**: You can audit every line of code or build it directly from this repository.

---

## License

This project is licensed under the [MIT License](LICENSE). Feel free to fork, customize, and use it to accelerate your career search!
