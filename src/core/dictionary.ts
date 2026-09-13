/**
 * Static keyword dictionary and autocomplete mapping for field classification.
 * Follows system_design.md specifications.
 */

export interface KeywordRule {
  canonicalField: string;
  patterns: RegExp[];
  negativePatterns?: RegExp[]; // Exclude false positives (e.g. "email" shouldn't match "manager email")
  weight: number;
}

export const AUTOCOMPLETE_MAP: Record<string, string> = {
  'given-name': 'personal.firstName',
  'fname': 'personal.firstName',
  'family-name': 'personal.lastName',
  'lname': 'personal.lastName',
  'name': 'personal.fullName',
  'email': 'personal.email',
  'tel': 'personal.phone',
  'tel-national': 'personal.phone',
  'tel-country-code': 'personal.phoneCountry',
  'address-level2': 'personal.location',
  'address-level1': 'personal.location',
  'address-line1': 'personal.location',
  'postal-code': 'personal.location',
  'country-name': 'personal.location',
  'organization-title': 'experience.currentTitle',
  'url': 'links.portfolio',
};

export const KEYWORD_RULES: KeywordRule[] = [
  // First Name
  {
    canonicalField: 'personal.firstName',
    patterns: [
      /\bfirst\s*name\b/i,
      /\bfname\b/i,
      /\bgiven\s*name\b/i,
      /\bforename\b/i,
      /^first$/i,
      /\blegal\s*first\s*name\b/i,
    ],
    negativePatterns: [/\blast\b/i, /\bfamily\b/i],
    weight: 0.85,
  },

  // Last Name
  {
    canonicalField: 'personal.lastName',
    patterns: [
      /\blast\s*name\b/i,
      /\blname\b/i,
      /\bfamily\s*name\b/i,
      /\bsurname\b/i,
      /^last$/i,
      /\blegal\s*last\s*name\b/i,
    ],
    negativePatterns: [/\bfirst\b/i, /\bgiven\b/i],
    weight: 0.85,
  },

  // Full Name (used when a form only has a single "Full Name" input)
  {
    canonicalField: 'personal.fullName',
    patterns: [
      /\bfull\s*name\b/i,
      /\bcomplete\s*name\b/i,
      /^name$/i,
      /\bcandidate\s*name\b/i,
    ],
    negativePatterns: [/\bfirst\b/i, /\blast\b/i, /\buser(name)?\b/i, /\bcompany\b/i, /\bschool\b/i],
    weight: 0.8,
  },

  // Email (Personal)
  {
    canonicalField: 'personal.email',
    patterns: [
      /\be-?mail\b/i,
      /\be-?mail\s*address\b/i,
      /\bcontact\s*email\b/i,
      /\bpersonal\s*email\b/i,
      /\bregistered\s*email\b/i,
    ],
    negativePatterns: [/\breferral\b/i, /\bmanager\b/i, /\bcampus\b/i, /\balternate\b/i, /\bcollege\b/i, /\buniversity\b/i],
    weight: 0.9,
  },

  // Campus Email / Alternate Email
  {
    canonicalField: 'personal.campusEmail',
    patterns: [
      /\bcampus\s*email\b/i,
      /\balternate.*email\b/i,
      /\bvit.*email\b/i,
      /\buniversity\s*email\b/i,
      /\bcollege\s*email\b/i,
    ],
    weight: 0.95,
  },

  // Campus ID / Register Number
  {
    canonicalField: 'personal.campusId',
    patterns: [
      /\bcampus\s*id\b/i,
      /\bregister\s*(number|no)?\b/i,
      /\breg\s*no\b/i,
      /\bregistration\s*(number|no)?\b/i,
      /\broll\s*(number|no)?\b/i,
      /\bstudent\s*id\b/i,
    ],
    weight: 0.9,
  },

  // Phone
  {
    canonicalField: 'personal.phone',
    patterns: [
      /\bphone\b/i,
      /\bmobile\b/i,
      /\btelephone\b/i,
      /\bcell\b/i,
      /\bcontact\s*number\b/i,
      /\bphone\s*number\b/i,
    ],
    negativePatterns: [/\bcountry\s*code\b/i, /\bextension\b/i],
    weight: 0.85,
  },

  // Location / City / Address
  {
    canonicalField: 'personal.location',
    patterns: [
      /\blocation\b/i,
      /\bcity\b/i,
      /\baddress\b/i,
      /\bcurrent\s*location\b/i,
      /\bcurrent\s*city\b/i,
      /\bresidence\b/i,
      /\bwhere\s*are\s*you\s*located\b/i,
      /\bstate\b/i,
      /\bpostal\s*code\b/i,
      /\bzip\b/i,
    ],
    negativePatterns: [/\bip\s*address\b/i, /\bmac\s*address\b/i],
    weight: 0.75,
  },

  // LinkedIn
  {
    canonicalField: 'links.linkedin',
    patterns: [
      /\blinkedin\b/i,
      /\blinked\.in\b/i,
      /\blinked\s*in\b/i,
      /\blinkedin\.com/i,
    ],
    weight: 0.9,
  },

  // GitHub
  {
    canonicalField: 'links.github',
    patterns: [
      /\bgithub\b/i,
      /\bgithub\.com/i,
      /\bgit\s*profile\b/i,
    ],
    weight: 0.9,
  },

  // Portfolio / Website
  {
    canonicalField: 'links.portfolio',
    patterns: [
      /\bportfolio\b/i,
      /\bwebsite\b/i,
      /\bpersonal\s*site\b/i,
      /\bpersonal\s*website\b/i,
      /\bblog\b/i,
      /\bother\s*website\b/i,
      /\burl\b/i,
    ],
    negativePatterns: [/\blinkedin\b/i, /\bgithub\b/i, /\bleetcode\b/i],
    weight: 0.8,
  },

  // LeetCode / Coding Profile
  {
    canonicalField: 'links.leetcode',
    patterns: [
      /\bleetcode\b/i,
      /\bleetcode\.com/i,
      /\bcoding\s*profile\b/i,
      /\bhackerrank\b/i,
      /\bcodeforces\b/i,
    ],
    weight: 0.9,
  },

  // Current Title
  {
    canonicalField: 'experience.currentTitle',
    patterns: [
      /\bcurrent\s*title\b/i,
      /\bjob\s*title\b/i,
      /\bposition\b/i,
      /\bcurrent\s*role\b/i,
      /\bcurrent\s*occupation\b/i,
      /\bmost\s*recent\s*title\b/i,
    ],
    weight: 0.8,
  },

  // Years of Experience
  {
    canonicalField: 'experience.yearsExperience',
    patterns: [
      /\byears.*experience\b/i,
      /\byoe\b/i,
      /\byears\s*of\s*experience\b/i,
      /\btotal\s*experience\b/i,
      /\bhow\s*many\s*years.*experience\b/i,
    ],
    weight: 0.85,
  },

  // Summary / Cover Letter / Motivation
  {
    canonicalField: 'experience.summary',
    patterns: [
      /\bsummary\b/i,
      /\babout\s*you\b/i,
      /\bcover\s*letter\b/i,
      /\bwhy\s*(do\s*you\s*want\s*to\s*)?work\s*here\b/i,
      /\bwhy\s*are\s*you\s*interested\b/i,
      /\bbriefly\s*describe\b/i,
      /\badditional\s*information\b/i,
      /\bnote\s*to\s*hiring\s*manager\b/i,
    ],
    weight: 0.75,
  },

  // Education Degree
  {
    canonicalField: 'education.degree',
    patterns: [
      /\bdegree\b/i,
      /\beducation\s*level\b/i,
      /\bhighest\s*degree\b/i,
    ],
    negativePatterns: [/\bgpa\b/i, /\bgrade\b/i, /\bmajor\b/i, /\bpost\s*graduation\b/i, /\bmaster\b/i],
    weight: 0.8,
  },

  // Education Major / Field of Study
  {
    canonicalField: 'education.fieldOfStudy',
    patterns: [
      /\bmajor\b/i,
      /\bfield\s*of\s*study\b/i,
      /\bspecialization\b/i,
      /\bdiscipline\b/i,
      /\bbranch\b/i,
    ],
    weight: 0.85,
  },

  // Education Institution / School
  {
    canonicalField: 'education.institution',
    patterns: [
      /\binstitution\b/i,
      /\buniversity\b/i,
      /\bcollege\b/i,
      /\bschool\b/i,
    ],
    weight: 0.8,
  },

  // Education Graduation Year
  {
    canonicalField: 'education.graduationYear',
    patterns: [
      /\bgraduation\s*year\b/i,
      /\byear\s*graduated\b/i,
      /\bgrad\s*year\b/i,
      /\bcompletion\s*year\b/i,
      /\bend\s*year\b/i,
    ],
    negativePatterns: [/\bpost\s*graduation\b/i, /\bmaster\b/i],
    weight: 0.85,
  },

  // Education GPA / CGPA (College)
  {
    canonicalField: 'education.gpa',
    patterns: [
      /\bcgpa\b/i,
      /\bgpa\b/i,
      /\bgrade\s*point\b/i,
      /\bcurrent\s*marks\b/i,
      /\bcurrent\s*(percentage|cgpa)\b/i,
    ],
    negativePatterns: [/\b10th\b/i, /\b12th\b/i, /\bx\s*board\b/i, /\bxii\s*board\b/i],
    weight: 0.85,
  },

  // 10th Board Score
  {
    canonicalField: 'education.tenthScore',
    patterns: [
      /\b10th\b/i,
      /\bx\s*board\b/i,
      /\bsecondary\s*score\b/i,
      /\bssc\b/i,
      /\bmatriculation\b/i,
    ],
    weight: 0.9,
  },

  // 12th Board Score
  {
    canonicalField: 'education.twelfthScore',
    patterns: [
      /\b12th\b/i,
      /\bxii\s*board\b/i,
      /\bhigher\s*secondary\b/i,
      /\bhsc\b/i,
      /\bintermediate\b/i,
    ],
    weight: 0.9,
  },

  // Campus Location
  {
    canonicalField: 'education.campus',
    patterns: [
      /\bcampus\b/i,
      /\bcollege\s*campus\b/i,
    ],
    negativePatterns: [/\bcampus\s*id\b/i, /\bcampus\s*email\b/i],
    weight: 0.85,
  },

  // Active Backlogs
  {
    canonicalField: 'education.activeBacklogs',
    patterns: [
      /\bbacklogs?\b/i,
      /\barrears?\b/i,
      /\bstanding\s*arrears?\b/i,
      /\bhistory\s*of\s*arrears?\b/i,
    ],
    weight: 0.9,
  },

  // Awards & Certifications
  {
    canonicalField: 'education.certifications',
    patterns: [
      /\bawards?\s*(&|and)?\s*certifications?\b/i,
      /\bcertifications?\b/i,
      /\bachievements?\b/i,
      /\bhonors?\b/i,
    ],
    weight: 0.85,
  },

  // Foreign / Additional Languages Known
  {
    canonicalField: 'personal.languages',
    patterns: [
      /\bforeign\s*languages?\b/i,
      /\blanguages?\s*known\b/i,
      /\badditional\s*languages?\b/i,
    ],
    weight: 0.85,
  },

  // Resume File
  {
    canonicalField: 'resumeFileName',
    patterns: [
      /\bresume\b/i,
      /\bcv\b/i,
      /\bcurriculum\s*vitae\b/i,
      /\battach\s*resume\b/i,
      /\bupload\s*resume\b/i,
    ],
    weight: 0.9,
  },
];
