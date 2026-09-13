import { Profile, Settings, FieldMappingCache } from './types';

export const VIT_CAMPUS_ANSWERS: Record<string, string> = {
  // VIT Campus & Student Identification
  'campus id / register number': '23BCT0157',
  'register number': '23BCT0157',
  'registration number': '23BCT0157',
  'campus id': '23BCT0157',
  'student id': '23BCT0157',
  'roll number': '23BCT0157',
  'campus': 'Vellore',
  'campus name': 'Vellore',
  'alternate/campus email id': 'rishit.chaudhary2023@vitstudent.ac.in',
  'campus email': 'rishit.chaudhary2023@vitstudent.ac.in',
  'registered email id (personal)': 'rishitwork28@gmail.com',
  'personal email': 'rishitwork28@gmail.com',
  'contact no': '+91-8076513921',
  'phone number': '+91-8076513921',

  // Address
  'candidate permanent address (city)': 'Noida',
  'candidate permanent address (state)': 'Uttar Pradesh',
  'permanent city': 'Noida',
  'permanent state': 'Uttar Pradesh',

  // Academic Scores
  '10th board score (percentage or cgpa)': '96.6',
  '10th board score': '96.6',
  '10th percentage': '96.6',
  '10th marks': '96.6',
  '12th board score (percentage or cgpa)': '80',
  '12th board score': '80',
  '12th percentage': '80',
  '12th marks': '80',

  // Graduation
  'graduation: degree': 'B.Tech',
  'graduation degree': 'B.Tech',
  'degree': 'B.Tech',
  'graduation: course/branch': 'Computer Science & Engineering (IoT)',
  'graduation: branch': 'Computer Science & Engineering (IoT)',
  'graduation branch': 'Computer Science & Engineering (IoT)',
  'course/branch': 'Computer Science & Engineering (IoT)',
  'branch': 'Computer Science & Engineering (IoT)',
  'graduation: current marks (percentage/cgpa)': '8.68',
  'graduation current marks': '8.68',
  'current marks': '8.68',
  'current cgpa': '8.68',
  'graduation: year of passing': '2027',
  'year of passing': '2027',
  'passing year': '2027',

  // Citizenship & Backlogs
  'are you an indian citizen': 'Yes',
  'indian citizen': 'Yes',
  'if not an indian citizen, do you hold an oci card': 'Not Applicable',
  'oci card': 'Not Applicable',
  'current active backlogs': 'No',
  'active backlogs': 'No',
  'standing arrears': 'No',
  'history of arrears': 'No',

  // Certifications & Languages & Registration
  'awards & certifications': 'Amazon ML Summer School 2026, Oracle Certified AI Foundations Associate, Oracle Certified Database Foundations Associate, Career Essentials in Generative AI by Microsoft and LinkedIn, Deloitte Australia Data Analytics, Women Techies \'26 Semi-Finalist',
  'awards and certifications': 'Amazon ML Summer School 2026, Oracle Certified AI Foundations Associate, Oracle Certified Database Foundations Associate, Career Essentials in Generative AI by Microsoft and LinkedIn, Deloitte Australia Data Analytics, Women Techies \'26 Semi-Finalist',
  'certifications': 'Amazon ML Summer School 2026, Oracle Certified AI Foundations Associate, Oracle Certified Database Foundations Associate, Career Essentials in Generative AI by Microsoft and LinkedIn, Deloitte Australia Data Analytics, Women Techies \'26 Semi-Finalist',
  'additional foreign language(s) known': 'English, French, Hindi',
  'foreign languages known': 'English, French, Hindi',
  'languages known': 'English, French, Hindi',
  'registered in the company link': 'Yes',
  'registered in company portal': 'Yes',
  'registered in company link': 'Yes',
};

export const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'sde-profile',
    name: 'Software Development Engineer',
    personal: {
      firstName: 'Rishit',
      lastName: 'Chaudhary',
      email: 'rishitwork28@gmail.com',
      phone: '+91-8076513921',
      location: 'Noida, India',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      campusId: '23BCT0157',
      campusEmail: 'rishit.chaudhary2023@vitstudent.ac.in',
      gender: 'Male',
      citizenship: 'Indian',
      languages: 'English, French, Hindi',
    },
    links: {
      linkedin: 'https://www.linkedin.com/in/rishit-chaudhary17',
      github: 'https://github.com/rizzit17',
      portfolio: 'https://rishucv.vercel.app/',
      leetcode: 'https://leetcode.com/u/rishit_17/',
    },
    experience: {
      currentTitle: 'Software Development Engineer',
      yearsExperience: 1,
      summary: 'Full-stack & systems software engineer with deep experience in React Native, React, Next.js, Node.js, FastAPI, PostgreSQL concurrency control, and distributed systems.',
    },
    education: {
      degree: 'B.Tech',
      institution: 'Vellore Institute of Technology, Vellore',
      graduationYear: 2027,
      gpa: '8.68',
      fieldOfStudy: 'Computer Science & Engineering (IoT)',
      campus: 'Vellore',
      tenthScore: '96.6',
      twelfthScore: '80',
      activeBacklogs: 'No',
      certifications: 'Amazon ML Summer School 2026, Oracle Certified AI Foundations Associate, Oracle Certified Database Foundations Associate, Career Essentials in Generative AI by Microsoft and LinkedIn, Deloitte Australia Data Analytics, Women Techies \'26 Semi-Finalist',
    },
    resumeFileName: 'rishit_sde_resume.pdf',
    avatarUrl: '/rishu_pfp.jpeg',
    customAnswers: {
      ...VIT_CAMPUS_ANSWERS,
      'why do you want to work here': "I look for engineering teams that prioritize clean architecture, high concurrency, and resilient systems. Your team's scale and engineering excellence are the exact environment where I thrive building low-latency, reliable software.",
      'why are you interested in this role': "I bring proven experience building high-concurrency transactional platforms (Seatzy with PostgreSQL row-level locks and 10-min hold sweepers) and asynchronous microservices (Helm and DS NexusFlow with Next.js/Zustand), combining strong algorithmic foundations with full-stack delivery.",
      'tell us about a challenging project': "In Seatzy, a high-demand ticket booking platform, I solved the double-booking problem during ticket drops using PostgreSQL pessimistic row-level locks (SELECT ... FOR UPDATE) inside atomic transactions. I implemented a 10-minute hold TTL auto-release sweeper and an automated FIFO waitlist reallocation engine with WebSocket state synchronization.",
      'describe a time you solved a complex technical problem': "While building DS NexusFlow, I replaced error-prone manual Excel workflows with a reactive Next.js/Zustand calculation engine for last-mile logistics. I resolved messy ERP keys and implemented configurable GPS drift thresholding, slashing processing latency by 91.9% and eliminating courier payout disputes.",
      'what technologies are you most proficient in': "C++, Python, TypeScript, JavaScript, React, Next.js, Node.js, FastAPI, PostgreSQL, Redis, Docker, Git, and RESTful APIs.",
      'authorized to work in us': 'Yes (open to remote / relocation with sponsorship)',
      'authorized to work in india': 'Yes',
      'require sponsorship': 'Yes (for US/international roles requiring visa sponsorship)',
      'notice period': 'Immediate / 15 days',
      'gender': 'Male',
      'veteran status': 'I am not a protected veteran',
      'disability status': 'I do not have a disability',
    },
  },
  {
    id: 'ai-engineer',
    name: 'AI Engineer',
    personal: {
      firstName: 'Rishit',
      lastName: 'Chaudhary',
      email: 'rishitwork28@gmail.com',
      phone: '+91-8076513921',
      location: 'Noida, India',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      campusId: '23BCT0157',
      campusEmail: 'rishit.chaudhary2023@vitstudent.ac.in',
      gender: 'Male',
      citizenship: 'Indian',
      languages: 'English, French, Hindi',
    },
    links: {
      linkedin: 'https://www.linkedin.com/in/rishit-chaudhary17',
      github: 'https://github.com/rizzit17',
      portfolio: 'https://rishucv.vercel.app/',
      leetcode: 'https://leetcode.com/u/rishit_17/',
    },
    experience: {
      currentTitle: 'AI Engineer',
      yearsExperience: 1,
      summary: 'AI Engineer specializing in agentic workflows (LangGraph), LLM orchestration (Groq, Gemini), multi-agent systems, and scalable RAG pipelines.',
    },
    education: {
      degree: 'B.Tech',
      institution: 'Vellore Institute of Technology, Vellore',
      graduationYear: 2027,
      gpa: '8.68',
      fieldOfStudy: 'Computer Science & Engineering (IoT)',
      campus: 'Vellore',
      tenthScore: '96.6',
      twelfthScore: '80',
      activeBacklogs: 'No',
      certifications: 'Amazon ML Summer School 2026, Oracle Certified AI Foundations Associate, Oracle Certified Database Foundations Associate, Career Essentials in Generative AI by Microsoft and LinkedIn, Deloitte Australia Data Analytics, Women Techies \'26 Semi-Finalist',
    },
    resumeFileName: 'rishit_ai_resume.pdf',
    avatarUrl: '/rishu_pfp.jpeg',
    customAnswers: {
      ...VIT_CAMPUS_ANSWERS,
      'why do you want to work here': "I am passionate about building agentic AI architectures and production-grade LLM applications. Your team's engineering velocity and focus on solving real-world customer problems with applied AI aligns directly with my background in multi-agent orchestration and scalable workflows.",
      'why are you interested in this role': "My work architecting multi-agent systems with LangGraph (like Helm AI Copilot with tool isolation and Pharmassist automated triage), alongside large-scale data systems at DS Group, provides me with the hands-on engineering chops to make an immediate impact.",
      'tell us about a challenging project': "I built Helm, an autonomous AI personal finance copilot. To prevent hallucinated DB mutations, I designed LangGraph tool isolation where the LLM never executes raw SQL, plus a closed-loop confirmation flow for rebalancing actions. I also optimized Redis sliding-window rate limiting and async FastAPI to sustain 1,000+ req/s with sub-2s latency.",
      'describe a project where you used ai or ml': "In Pharmassist Copilot, I engineered an agentic AI system using LangGraph, Groq LLMs, and FastAPI to ingest unstructured pharma compliance incident files, automate defect extraction, and execute real-time risk severity classification (Critical/Major/Minor) accelerating review turnarounds by 84%.",
      'what technologies are you most proficient in': "Python, TypeScript, FastAPI, React, LangGraph, LangChain, Groq API, Gemini API, PyTorch, PostgreSQL, Docker, and Redis.",
      'authorized to work in us': 'Yes (open to remote / relocation with sponsorship)',
      'authorized to work in india': 'Yes',
      'require sponsorship': 'Yes (for US/international roles requiring visa sponsorship)',
      'notice period': 'Immediate / 15 days',
      'gender': 'Male',
      'veteran status': 'I am not a protected veteran',
      'disability status': 'I do not have a disability',
    },
  },
  {
    id: 'ml-engineer',
    name: 'Machine Learning Engineer',
    personal: {
      firstName: 'Rishit',
      lastName: 'Chaudhary',
      email: 'rishitwork28@gmail.com',
      phone: '+91-8076513921',
      location: 'Noida, India',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      campusId: '23BCT0157',
      campusEmail: 'rishit.chaudhary2023@vitstudent.ac.in',
      gender: 'Male',
      citizenship: 'Indian',
      languages: 'English, French, Hindi',
    },
    links: {
      linkedin: 'https://www.linkedin.com/in/rishit-chaudhary17',
      github: 'https://github.com/rizzit17',
      portfolio: 'https://rishucv.vercel.app/',
      leetcode: 'https://leetcode.com/u/rishit_17/',
    },
    experience: {
      currentTitle: 'Machine Learning Engineer',
      yearsExperience: 1,
      summary: 'ML Engineer specializing in predictive modeling, tabular gradient boosting (XGBoost, CatBoost), recommender systems, feature engineering, and Amazon ML Summer School graduate.',
    },
    education: {
      degree: 'B.Tech',
      institution: 'Vellore Institute of Technology, Vellore',
      graduationYear: 2027,
      gpa: '8.68',
      fieldOfStudy: 'Computer Science & Engineering (IoT)',
      campus: 'Vellore',
      tenthScore: '96.6',
      twelfthScore: '80',
      activeBacklogs: 'No',
      certifications: 'Amazon ML Summer School 2026, Oracle Certified AI Foundations Associate, Oracle Certified Database Foundations Associate, Career Essentials in Generative AI by Microsoft and LinkedIn, Deloitte Australia Data Analytics, Women Techies \'26 Semi-Finalist',
    },
    resumeFileName: 'rishit_ml_resume.pdf',
    avatarUrl: '/rishu_pfp.jpeg',
    customAnswers: {
      ...VIT_CAMPUS_ANSWERS,
      'why do you want to work here': "I am energized by production ML teams that tackle massive datasets, low-latency scoring, and high-impact business metrics. Your commitment to rigorous evaluation, robust pipelines, and deploying performant models aligns directly with my engineering focus.",
      'why are you interested in this role': "My experience architecting end-to-end ML pipelines over 1.3M+ records at DS Group—achieving 69% call-to-order precision with calibrated operating thresholds—directly matches your requirements for high-performance ML engineering.",
      'tell us about a challenging project': "At DS Group, I addressed a ₹1.6L/day blind telecalling burn. I built a dense temporal grid of 1.3M rows across 8,640 retailers, engineered 27 shifted lag features, and trained an XGBoost classifier. By calibrating the operating threshold at 0.40, we cut call volume by 63.5% while preserving 89.4% of order conversions, saving ₹1,01,600 daily.",
      'describe a project where you used ai or ml': "I built a B2B Hybrid Recommendation Engine for Kirana stores utilizing Collaborative Filtering and FP-Growth association rules on 1.3M+ transactions to mine purchasing affinities, expand basket sizes by 22%, and power real-time personalized cross-sell recommendations.",
      'what technologies are you most proficient in': "Python, Scikit-learn, XGBoost, CatBoost, PyTorch, Pandas, NumPy, SQL, Streamlit, SHAP, Docker, and AWS.",
      'authorized to work in us': 'Yes (open to remote / relocation with sponsorship)',
      'authorized to work in india': 'Yes',
      'require sponsorship': 'Yes (for US/international roles requiring visa sponsorship)',
      'notice period': 'Immediate / 15 days',
      'gender': 'Male',
      'veteran status': 'I am not a protected veteran',
      'disability status': 'I do not have a disability',
    },
  },
  {
    id: 'product-management',
    name: 'Product Management',
    personal: {
      firstName: 'Rishit',
      lastName: 'Chaudhary',
      email: 'rishitwork28@gmail.com',
      phone: '+91-8076513921',
      location: 'Noida, India',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      campusId: '23BCT0157',
      campusEmail: 'rishit.chaudhary2023@vitstudent.ac.in',
      gender: 'Male',
      citizenship: 'Indian',
      languages: 'English, French, Hindi',
    },
    links: {
      linkedin: 'https://www.linkedin.com/in/rishit-chaudhary17',
      github: 'https://github.com/rizzit17',
      portfolio: 'https://rishucv.vercel.app/',
    },
    experience: {
      currentTitle: 'Technical Product Manager',
      yearsExperience: 1,
      summary: 'Technical product builder combining quantitative rigor with engineering fluency, specializing in AI-driven workflows, operational funnel optimization, and data products.',
    },
    education: {
      degree: 'B.Tech',
      institution: 'Vellore Institute of Technology, Vellore',
      graduationYear: 2027,
      gpa: '8.68',
      fieldOfStudy: 'Computer Science & Engineering (IoT)',
      campus: 'Vellore',
      tenthScore: '96.6',
      twelfthScore: '80',
      activeBacklogs: 'No',
      certifications: 'Amazon ML Summer School 2026, Oracle Certified AI Foundations Associate, Oracle Certified Database Foundations Associate, Career Essentials in Generative AI by Microsoft and LinkedIn, Deloitte Australia Data Analytics, Women Techies \'26 Semi-Finalist',
    },
    resumeFileName: 'rishit_resume_product management.pdf',
    avatarUrl: '/rishu_pfp.jpeg',
    customAnswers: {
      ...VIT_CAMPUS_ANSWERS,
      'why do you want to work here': "I love working at the intersection of complex technical systems and tangible customer value. Your product solves critical problems with deep technological leverage, which matches my product philosophy of eliminating operational friction with data-driven workflows.",
      'why are you interested in this role': "My background combines hands-on engineering (FastAPI, React, SQL, ML) with proven product execution at DS Group—where I framed the problem, owned unit economics, and shipped AI-driven solutions that cut dialer costs by 63.5% while retaining 89.4% of order conversions.",
      'tell us about a product you shipped': "I scoped, designed, and shipped v0 of DS NexusFlow, a logistics payout platform. I shadowed logistics operators to identify pain points in courier payouts, framed the requirements to replace manual spreadsheets, and designed configurable hub-level GPS drift thresholds that eliminated friction between 3PL fleet partners and operations leaders.",
      'how do you prioritize features': "I use a structured framework balancing customer friction, unit economics, and engineering feasibility. For the B2B Kirana project, rather than pursuing marginal model accuracy gains, I prioritized calibrating the operating cutoff at 0.40 because it maximized the cost-benefit ratio—saving ₹1,01,600 daily with minimal order attrition.",
      'what technologies or tools do you use': "Figma, SQL, Excel, Python, Streamlit, Funnel Analytics, Agile/Scrum, Wireframing, Root Cause Analysis, and SOP Documentation.",
      'authorized to work in us': 'Yes (open to remote / relocation with sponsorship)',
      'authorized to work in india': 'Yes',
      'require sponsorship': 'Yes (for US/international roles requiring visa sponsorship)',
      'notice period': 'Immediate / 15 days',
      'gender': 'Male',
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
      const valid = stored.filter(validateProfile);
      // Merge missing default properties for standard profiles
      const merged = valid.map((p) => {
        const defaultMatch = DEFAULT_PROFILES.find((dp) => dp.id === p.id);
        if (!defaultMatch) return p;
        return {
          ...defaultMatch,
          ...p,
          personal: { ...defaultMatch.personal, ...p.personal },
          links: { ...defaultMatch.links, ...p.links },
          experience: { ...defaultMatch.experience, ...p.experience },
          education: { ...defaultMatch.education, ...p.education },
          customAnswers: { ...defaultMatch.customAnswers, ...p.customAnswers },
        };
      });
      return merged;
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
