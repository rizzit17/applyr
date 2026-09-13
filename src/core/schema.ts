import { Profile, Settings, FieldMappingCache } from './types';

export const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'backend-profile',
    name: 'Backend',
    personal: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      phone: '+1-555-123-4567',
      location: 'San Francisco, CA',
    },
    links: {
      linkedin: 'https://linkedin.com/in/janedoe',
      github: 'https://github.com/janedoe',
      portfolio: 'https://janedoe.dev',
    },
    experience: {
      currentTitle: 'Backend Engineer',
      yearsExperience: 4,
      summary: 'Backend engineer specializing in distributed systems, event-driven architectures, and API design.',
    },
    education: {
      degree: 'B.S. Computer Science',
      institution: 'State University',
      graduationYear: 2022,
    },
    resumeFileName: 'jane_doe_backend_resume.pdf',
    customAnswers: {
      'why do you want to work here': "I'm drawn to the team's focus on high-scale distributed systems and engineering excellence.",
      'why are you interested in this role': "My background in high-throughput backend services aligns directly with the architectural challenges your team tackles.",
      'authorized to work in us': 'Yes',
      'require sponsorship': 'No',
      'gender': 'Decline to self-identify',
      'veteran status': 'I am not a protected veteran',
      'disability status': 'I do not have a disability',
    },
  },
  {
    id: 'ml-profile',
    name: 'Machine Learning',
    personal: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      phone: '+1-555-123-4567',
      location: 'San Francisco, CA',
    },
    links: {
      linkedin: 'https://linkedin.com/in/janedoe',
      github: 'https://github.com/janedoe',
      portfolio: 'https://janedoe.dev',
    },
    experience: {
      currentTitle: 'Machine Learning Engineer',
      yearsExperience: 4,
      summary: 'ML engineer specializing in deep learning, transformer models, inference optimization, and MLOps pipelines.',
    },
    education: {
      degree: 'B.S. Computer Science',
      institution: 'State University',
      graduationYear: 2022,
    },
    resumeFileName: 'jane_doe_ml_resume.pdf',
    customAnswers: {
      'why do you want to work here': "I'm excited by your product's applied AI capabilities and commitment to fast production deployment of state-of-the-art models.",
      'why are you interested in this role': "My experience scaling transformer training and low-latency inference directly matches the needs of this role.",
      'authorized to work in us': 'Yes',
      'require sponsorship': 'No',
      'gender': 'Decline to self-identify',
      'veteran status': 'I am not a protected veteran',
      'disability status': 'I do not have a disability',
    },
  },
];

export const DEFAULT_SETTINGS: Settings = {
  aiFallbackEnabled: false,
  confidenceThreshold: 0.6,
  aiProvider: 'gemini',
  aiModel: 'gemini-1.5-flash',
};

// Storage keys
export const STORAGE_KEYS = {
  PROFILES: 'profiles',
  ACTIVE_PROFILE_ID: 'activeProfileId',
  FIELD_MAPPING_CACHE: 'fieldMappingCache',
  SETTINGS: 'settings',
} as const;

/**
 * Validates a profile object
 */
export function validateProfile(profile: unknown): profile is Profile {
  if (!profile || typeof profile !== 'object') return false;
  const p = profile as Partial<Profile>;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.personal === 'object' &&
    p.personal !== null &&
    typeof p.personal.firstName === 'string' &&
    typeof p.personal.lastName === 'string' &&
    typeof p.personal.email === 'string' &&
    typeof p.experience === 'object' &&
    p.experience !== null &&
    typeof p.education === 'object' &&
    p.education !== null
  );
}

/**
 * Storage accessor helper for chrome.storage.local
 */
export async function getStoredProfiles(): Promise<Profile[]> {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return DEFAULT_PROFILES;
    }
    const data = await chrome.storage.local.get([STORAGE_KEYS.PROFILES]);
    const stored = data[STORAGE_KEYS.PROFILES];
    if (Array.isArray(stored) && stored.length > 0) {
      return stored.filter(validateProfile);
    }
    // Seed initial defaults if none exist
    await chrome.storage.local.set({ [STORAGE_KEYS.PROFILES]: DEFAULT_PROFILES });
    return DEFAULT_PROFILES;
  } catch (err) {
    console.error('Failed to get stored profiles:', err);
    return DEFAULT_PROFILES;
  }
}

export async function saveProfiles(profiles: Profile[]): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  await chrome.storage.local.set({ [STORAGE_KEYS.PROFILES]: profiles });
}

export async function getActiveProfileId(): Promise<string> {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return DEFAULT_PROFILES[0].id;
    }
    const data = await chrome.storage.local.get([STORAGE_KEYS.ACTIVE_PROFILE_ID]);
    return data[STORAGE_KEYS.ACTIVE_PROFILE_ID] || DEFAULT_PROFILES[0].id;
  } catch {
    return DEFAULT_PROFILES[0].id;
  }
}

export async function setActiveProfileId(id: string): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  await chrome.storage.local.set({ [STORAGE_KEYS.ACTIVE_PROFILE_ID]: id });
}

export async function getStoredSettings(): Promise<Settings> {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return DEFAULT_SETTINGS;
    }
    const data = await chrome.storage.local.get([STORAGE_KEYS.SETTINGS]);
    return { ...DEFAULT_SETTINGS, ...(data[STORAGE_KEYS.SETTINGS] || {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

export async function getStoredCache(): Promise<FieldMappingCache> {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return {};
    }
    const data = await chrome.storage.local.get([STORAGE_KEYS.FIELD_MAPPING_CACHE]);
    return data[STORAGE_KEYS.FIELD_MAPPING_CACHE] || {};
  } catch {
    return {};
  }
}

export async function saveStoredCache(cache: FieldMappingCache): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  await chrome.storage.local.set({ [STORAGE_KEYS.FIELD_MAPPING_CACHE]: cache });
}
