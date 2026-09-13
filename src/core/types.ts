/**
 * Applyr Core Types
 * Based on system_design.md and architecture.md specifications.
 */

export interface ProfilePersonal {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface ProfileLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  leetcode?: string;
}

export interface ProfileExperience {
  currentTitle: string;
  yearsExperience: number;
  summary: string;
}

export interface ProfileEducation {
  degree: string;
  institution: string;
  graduationYear: number;
  gpa?: string;
  fieldOfStudy?: string;
}

export interface Profile {
  id: string;
  name: string; // e.g. "AI Engineer", "ML", "SDE", "Product Management"
  personal: ProfilePersonal;
  links: ProfileLinks;
  experience: ProfileExperience;
  education: ProfileEducation;
  resumeFileName: string; // Used for prompt, not actual file
  avatarUrl?: string;
  customAnswers?: Record<string, string>; // Free-form Q&A overrides keyed by normalized question text
}

export interface FieldCacheEntry {
  canonicalField: string;
  confidence: number;
  lastUpdated: number; // epoch ms
  source: 'user-correction' | 'ai' | 'manual-override';
}

export interface FieldMappingCache {
  [hostname: string]: {
    [fieldSignature: string]: FieldCacheEntry;
  };
}

export interface Settings {
  aiFallbackEnabled: boolean;
  confidenceThreshold: number; // default 0.6
  aiApiKey?: string;
  aiProvider?: 'gemini' | 'openai' | 'anthropic' | 'openrouter';
  aiModel?: string;
}

export type ElementType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'combobox'
  | 'file'
  | 'contenteditable'
  | 'unknown';

export interface DetectedField {
  id: string; // DOM element ID or generated unique ID
  name: string;
  type: ElementType;
  htmlType?: string; // e.g., 'text', 'email', 'tel', 'password'
  placeholder: string;
  autocomplete: string;
  labelText: string;
  nearbyText: string;
  fieldSignature: string; // Stable hash
  options?: string[]; // For select or radio options
  element?: HTMLElement; // Live reference (only exists in content script)
  disabled?: boolean;
  readOnly?: boolean;
  isInsideShadowRoot?: boolean;
  isInsideIframe?: boolean;
}

export interface FieldGuess {
  canonicalField: string; // e.g., "personal.firstName", "links.linkedin"
  confidence: number; // 0.0 - 1.0
  source: 'autocomplete' | 'cache' | 'keyword' | 'ai' | 'fallback';
  targetValue?: string; // Resolved value from active profile
  reason?: string;
}

export interface FillOutcome {
  field: DetectedField;
  guess: FieldGuess;
  success: boolean;
  actionTaken: 'filled' | 'skipped-low-confidence' | 'prompt-manual-file' | 'error';
  errorMessage?: string;
}

export interface FillResultSummary {
  totalScanned: number;
  filledCount: number;
  reviewNeededCount: number;
  flaggedFields: Array<{
    name: string;
    labelText: string;
    confidence: number;
    reason: string;
    actionTaken: string;
  }>;
  hasCrossOriginIframes: boolean;
  resumeFilePrompt?: string;
}

// Cross-context messaging contracts
export type ExtensionMessage =
  | { type: 'TRIGGER_FILL'; profileId: string }
  | { type: 'RUN_FILL'; profile: Profile; cache: Record<string, FieldCacheEntry>; settings: Settings }
  | { type: 'FILL_RESULT'; result: FillResultSummary }
  | { type: 'LEARN_CORRECTION'; hostname: string; fieldSignature: string; canonicalField: string }
  | { type: 'BATCH_AI_CLASSIFY'; hostname: string; fields: Array<Omit<DetectedField, 'element'>> }
  | { type: 'GET_ACTIVE_DATA' }
  | { type: 'ACTIVE_DATA_RESPONSE'; profiles: Profile[]; activeProfileId: string; settings: Settings };
