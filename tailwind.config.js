/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./src/options/index.html",
    "./src/popup/index.html"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary-container": "#2d6a4f",
        "surface-dim": "#dbd9dc",
        "surface-container-highest": "#e3e2e4",
        "on-surface-variant": "#404943",
        "on-primary-fixed-variant": "#0e5138",
        "tertiary-fixed-dim": "#ffb68e",
        "on-secondary-container": "#6f2000",
        "on-tertiary-fixed": "#331200",
        "secondary-fixed": "#ffdbcf",
        "secondary-fixed-dim": "#ffb59c",
        "surface-container-lowest": "#ffffff",
        "on-tertiary": "#ffffff",
        "outline-variant": "#bfc9c1",
        "surface": "#faf9fb",
        "surface-bright": "#faf9fb",
        "background": "#faf9fb",
        "on-surface": "#1b1c1e",
        "on-tertiary-container": "#ffd0b8",
        "inverse-on-surface": "#f2f0f3",
        "tertiary-container": "#9d4500",
        "on-secondary": "#ffffff",
        "primary": "#0f5238",
        "inverse-surface": "#2f3032",
        "on-secondary-fixed-variant": "#822801",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "primary-fixed-dim": "#95d4b3",
        "on-tertiary-fixed-variant": "#763300",
        "secondary": "#a23e18",
        "inverse-primary": "#95d4b3",
        "primary-fixed": "#b1f0ce",
        "tertiary-fixed": "#ffdbca",
        "surface-variant": "#e3e2e4",
        "surface-container": "#efedf0",
        "on-error-container": "#93000a",
        "surface-container-high": "#e9e8ea",
        "on-primary-container": "#a8e7c5",
        "on-error": "#ffffff",
        "on-primary-fixed": "#002114",
        "on-secondary-fixed": "#390c00",
        "outline": "#707973",
        "on-primary": "#ffffff",
        "surface-container-low": "#f5f3f5",
        "surface-tint": "#2c694e",
        "secondary-container": "#fe8357",
        "tertiary": "#783300",
        "on-background": "#1b1c1e"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "gutter-sm": "0.75rem",
        "margin": "1.25rem",
        "margin-sm": "0.75rem",
        "space-lg": "1.25rem",
        "space-md": "0.75rem",
        "space-xl": "1.75rem",
        "gutter": "1rem",
        "space-sm": "0.5rem",
        "space-xs": "0.25rem"
      },
      fontFamily: {
        "headline-lg-mobile": ["Newsreader", "Georgia", "serif"],
        "code-sm": ["JetBrains Mono", "monospace"],
        "label-sm": ["Manrope", "sans-serif"],
        "headline-sm": ["Newsreader", "Georgia", "serif"],
        "body-lg": ["Manrope", "sans-serif"],
        "headline-lg": ["Newsreader", "Georgia", "serif"],
        "headline-md": ["Newsreader", "Georgia", "serif"],
        "body-sm": ["Manrope", "sans-serif"],
        "label-md": ["Manrope", "sans-serif"],
        "body-md": ["Manrope", "sans-serif"]
      },
      fontSize: {
        "headline-lg-mobile": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "500" }],
        "code-sm": ["11px", { lineHeight: "16px", letterSpacing: "0", fontWeight: "500" }],
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.04em", fontWeight: "600" }],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "body-lg": ["15px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-lg": ["30px", { lineHeight: "38px", letterSpacing: "-0.015em", fontWeight: "500" }],
        "headline-md": ["22px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "500" }],
        "body-sm": ["12px", { lineHeight: "18px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "600" }],
        "body-md": ["13px", { lineHeight: "20px", fontWeight: "400" }]
      }
    }
  },
  plugins: []
};
