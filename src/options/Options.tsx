import React, { useEffect, useState, useRef } from 'react';
import { Profile, Settings, FieldMappingCache } from '../core/types';
import {
  getStoredProfiles,
  saveProfiles,
  getStoredSettings,
  saveSettings,
  getStoredCache,
  saveStoredCache,
  validateProfile,
} from '../core/schema';

type OptionsTab = 'profiles' | 'qa' | 'mappings' | 'settings';

interface QAItem {
  id: string;
  category: 'exact' | 'eeo' | 'behavioral';
  question: string;
  tag?: string;
  answer: string;
  keywords: string;
}

const DEFAULT_QA_ITEMS: QAItem[] = [
  {
    id: 'vit-1',
    category: 'exact',
    question: 'Campus ID / Register number',
    tag: 'VIT Campus',
    answer: '23BCT0157',
    keywords: 'campus id register registration number roll student',
  },
  {
    id: 'vit-2',
    category: 'exact',
    question: 'Campus',
    tag: 'VIT Campus',
    answer: 'Vellore',
    keywords: 'campus vellore ap chennai bhopal',
  },
  {
    id: 'vit-3',
    category: 'exact',
    question: 'Alternate/Campus Email Id',
    tag: 'VIT Campus',
    answer: 'rishit.chaudhary2023@vitstudent.ac.in',
    keywords: 'alternate campus email vitstudent college',
  },
  {
    id: 'vit-4',
    category: 'exact',
    question: 'Registered Email ID (Personal)',
    tag: 'Personal',
    answer: 'rishitwork28@gmail.com',
    keywords: 'registered email personal primary',
  },
  {
    id: 'vit-5',
    category: 'exact',
    question: 'Contact No.',
    tag: 'Personal',
    answer: '+91-8076513921',
    keywords: 'contact phone mobile no number',
  },
  {
    id: 'vit-6',
    category: 'exact',
    question: 'Candidate Permanent Address (City)',
    tag: 'Address',
    answer: 'Noida',
    keywords: 'permanent address city domicile hometown',
  },
  {
    id: 'vit-7',
    category: 'exact',
    question: 'Candidate Permanent Address (State)',
    tag: 'Address',
    answer: 'Uttar Pradesh',
    keywords: 'permanent address state domicile',
  },
  {
    id: 'vit-8',
    category: 'exact',
    question: '10th Board Score (Percentage or CGPA)',
    tag: 'Academics',
    answer: '96.6',
    keywords: '10th board score percentage cgpa matriculation ssc',
  },
  {
    id: 'vit-9',
    category: 'exact',
    question: '12th Board Score (Percentage or CGPA)',
    tag: 'Academics',
    answer: '80',
    keywords: '12th board score percentage cgpa hsc intermediate',
  },
  {
    id: 'vit-10',
    category: 'exact',
    question: 'Graduation: Degree',
    tag: 'Academics',
    answer: 'B.Tech',
    keywords: 'graduation degree btech be under graduation ug',
  },
  {
    id: 'vit-11',
    category: 'exact',
    question: 'Graduation: Course/Branch',
    tag: 'Academics',
    answer: 'Computer Science & Engineering (IoT)',
    keywords: 'graduation course branch specialization discipline cse iot',
  },
  {
    id: 'vit-12',
    category: 'exact',
    question: 'Graduation: Current Marks (Percentage/CGPA)',
    tag: 'Academics',
    answer: '8.68',
    keywords: 'graduation current marks percentage cgpa gpa score',
  },
  {
    id: 'vit-13',
    category: 'exact',
    question: 'Graduation: Year of Passing',
    tag: 'Academics',
    answer: '2027',
    keywords: 'graduation year of passing passing year passout',
  },
  {
    id: 'vit-14',
    category: 'exact',
    question: 'Are you an Indian Citizen',
    tag: 'Citizenship',
    answer: 'Yes',
    keywords: 'indian citizen citizenship nationality',
  },
  {
    id: 'vit-15',
    category: 'exact',
    question: 'If not an Indian citizen, do you hold an OCI card',
    tag: 'Citizenship',
    answer: 'Not Applicable',
    keywords: 'oci card overseas citizen of india',
  },
  {
    id: 'vit-16',
    category: 'exact',
    question: 'Current Active Backlogs',
    tag: 'Academics',
    answer: 'No',
    keywords: 'current active backlogs arrears standing backlog history arrears',
  },
  {
    id: 'vit-17',
    category: 'exact',
    question: 'Awards & Certifications',
    tag: 'Certifications',
    answer: "Amazon ML Summer School 2026, Oracle Certified AI Foundations Associate, Oracle Certified Database Foundations Associate, Career Essentials in Generative AI by Microsoft and LinkedIn, Deloitte Australia Data Analytics, Women Techies '26 Semi-Finalist",
    keywords: 'awards certifications licenses achievements honors certificates',
  },
  {
    id: 'vit-18',
    category: 'exact',
    question: 'Additional Foreign Language(s) Known',
    tag: 'Languages',
    answer: 'English, French, Hindi',
    keywords: 'additional foreign languages known language spoken multilingual',
  },
  {
    id: 'vit-19',
    category: 'exact',
    question: 'Registered in the company link',
    tag: 'Verification',
    answer: 'Yes',
    keywords: 'registered company link portal job id application',
  },
  {
    id: 'qa-1',
    category: 'exact',
    question: 'Are you authorized to work in the United States?',
    tag: 'Work Authorization',
    answer: 'Yes',
    keywords: 'authorized work us authorization visa legal',
  },
  {
    id: 'qa-2',
    category: 'eeo',
    question: 'Disability status',
    tag: 'EEO Voluntary Self-ID',
    answer: 'I do not have a disability',
    keywords: 'disability handicap status medical condition accommodation',
  },
  {
    id: 'qa-3',
    category: 'eeo',
    question: 'Gender identity',
    tag: 'EEO Voluntary Self-ID',
    answer: 'Male',
    keywords: 'gender sex identity pronouns',
  },
  {
    id: 'qa-4',
    category: 'exact',
    question: 'Will you now or in the future require visa sponsorship?',
    tag: 'Visa Sponsorship',
    answer: 'No',
    keywords: 'require sponsorship h1b visa immigration transfer',
  },
  {
    id: 'qa-5',
    category: 'eeo',
    question: 'Veteran status',
    tag: 'EEO Voluntary Self-ID',
    answer: 'I am not a protected veteran',
    keywords: 'veteran status military armed forces vevraa service',
  },
  {
    id: 'qa-6',
    category: 'behavioral',
    question: 'Why are you interested in this role?',
    tag: 'Motivation',
    answer:
      'My background in high-throughput backend services and distributed systems aligns directly with your mission.',
    keywords: 'interested role passion motivation goals background engineering',
  },
  {
    id: 'qa-7',
    category: 'behavioral',
    question: 'Why do you want to work here?',
    tag: 'Company Fit',
    answer:
      'I am drawn to the team’s focus on high-scale distributed systems and developer-first infrastructure.',
    keywords: 'why work here company mission values culture team fit',
  },
];

export const Options: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OptionsTab>('profiles');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [cache, setCache] = useState<FieldMappingCache>({});
  const [settings, setSettings] = useState<Settings>({
    aiFallbackEnabled: false,
    confidenceThreshold: 0.6,
    aiProvider: 'gemini',
    aiModel: 'gemini-1.5-flash',
  });

  // Notifications
  const [toastMessage, setToastMessage] = useState<string>('');

  // Q&A State
  const [qaItems, setQaItems] = useState<QAItem[]>(DEFAULT_QA_ITEMS);
  const [qaFilter, setQaFilter] = useState<'all' | 'exact' | 'eeo' | 'behavioral'>('all');
  const [qaSearchQuery, setQaSearchQuery] = useState<string>('');
  const [isQaModalOpen, setIsQaModalOpen] = useState<boolean>(false);
  const [editingQaItem, setEditingQaItem] = useState<QAItem | null>(null);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'exact' | 'eeo' | 'behavioral'>('exact');
  const [newTag, setNewTag] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [newKeywords, setNewKeywords] = useState<string>('');

  // Site Mappings State
  const [mappingSearchQuery, setMappingSearchQuery] = useState<string>('');
  const [showBuiltIns, setShowBuiltIns] = useState<boolean>(false);

  // File import ref
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      const [p, c, s] = await Promise.all([
        getStoredProfiles(),
        getStoredCache(),
        getStoredSettings(),
      ]);
      setProfiles(p);
      if (p.length > 0) {
        setSelectedProfileId(p[0].id);
      }
      setCache(c);
      setSettings(s);

      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const qaData = await chrome.storage.local.get(['customQaItems']);
        if (Array.isArray(qaData.customQaItems) && qaData.customQaItems.length > 0) {
          const existingIds = new Set(qaData.customQaItems.map((i: QAItem) => i.id));
          const missingDefaults = DEFAULT_QA_ITEMS.filter((i) => !existingIds.has(i.id));
          const merged = [...qaData.customQaItems, ...missingDefaults];
          setQaItems(merged);
        } else {
          setQaItems(DEFAULT_QA_ITEMS);
          await chrome.storage.local.set({ customQaItems: DEFAULT_QA_ITEMS });
        }
      } else {
        const local = localStorage.getItem('applyr_custom_questions');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const existingIds = new Set(parsed.map((i: QAItem) => i.id));
              const missingDefaults = DEFAULT_QA_ITEMS.filter((i) => !existingIds.has(i.id));
              const merged = [...parsed, ...missingDefaults];
              setQaItems(merged);
              localStorage.setItem('applyr_custom_questions', JSON.stringify(merged));
            } else {
              setQaItems(DEFAULT_QA_ITEMS);
              localStorage.setItem('applyr_custom_questions', JSON.stringify(DEFAULT_QA_ITEMS));
            }
          } catch {
            setQaItems(DEFAULT_QA_ITEMS);
          }
        } else {
          setQaItems(DEFAULT_QA_ITEMS);
          localStorage.setItem('applyr_custom_questions', JSON.stringify(DEFAULT_QA_ITEMS));
        }
      }
    }
    load();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  const currentProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  // Profile Field Updates
  const updateProfileField = <K extends keyof Profile>(section: K, value: Profile[K]) => {
    if (!currentProfile) return;
    const updated = profiles.map((p) => (p.id === currentProfile.id ? { ...p, [section]: value } : p));
    setProfiles(updated);
  };

  const updateNestedField = (
    section: 'personal' | 'links' | 'experience' | 'education',
    key: string,
    val: string | number
  ) => {
    if (!currentProfile) return;
    const sectionData = { ...(currentProfile[section] as any), [key]: val };
    updateProfileField(section as any, sectionData);
  };

  const handleSaveProfiles = async () => {
    setIsSaving(true);
    await saveProfiles(profiles);
    setIsSaving(false);
    showToast('Profile saved successfully');
  };

  const handleAddProfile = () => {
    const newId = `profile_${Date.now()}`;
    const newProfile: Profile = {
      id: newId,
      name: `Profile ${profiles.length + 1}`,
      personal: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
      },
      links: {
        linkedin: '',
        github: '',
        portfolio: '',
      },
      experience: {
        currentTitle: '',
        yearsExperience: 1,
        summary: '',
      },
      education: {
        degree: '',
        institution: '',
        graduationYear: new Date().getFullYear(),
      },
      resumeFileName: 'resume.pdf',
      customAnswers: {},
    };

    const next = [...profiles, newProfile];
    setProfiles(next);
    setSelectedProfileId(newId);
    showToast(`Created ${newProfile.name}`);
  };

  const handleDuplicateProfile = () => {
    if (!currentProfile) return;
    const dupId = `profile_${Date.now()}`;
    const dup: Profile = {
      ...JSON.parse(JSON.stringify(currentProfile)),
      id: dupId,
      name: `${currentProfile.name} (Copy)`,
    };
    const next = [...profiles, dup];
    setProfiles(next);
    setSelectedProfileId(dupId);
    showToast(`Duplicated ${currentProfile.name}`);
  };

  const handleDeleteProfile = async () => {
    if (profiles.length <= 1) {
      alert('You must have at least one profile.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${currentProfile.name}"?`)) {
      const next = profiles.filter((p) => p.id !== currentProfile.id);
      setProfiles(next);
      setSelectedProfileId(next[0].id);
      await saveProfiles(next);
      showToast('Profile deleted');
    }
  };

  // JSON Export / Import
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profiles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `applyr_profiles_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Profiles exported as JSON');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const imported = Array.isArray(json) ? json : [json];
        const validProfiles = imported.filter(validateProfile);

        if (validProfiles.length === 0) {
          alert('Invalid profile JSON file format.');
          return;
        }

        setProfiles(validProfiles);
        setSelectedProfileId(validProfiles[0].id);
        await saveProfiles(validProfiles);
        showToast(`Imported ${validProfiles.length} profiles successfully!`);
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Resume File Selection
  const handleReplaceResume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateProfileField('resumeFileName', file.name);
    showToast(`Selected file: ${file.name}`);
    e.target.value = '';
  };

  // Q&A Handlers
  const handleOpenAddModal = () => {
    setEditingQaItem(null);
    setNewQuestion('');
    setNewCategory('exact');
    setNewTag('');
    setNewAnswer('');
    setNewKeywords('');
    setIsQaModalOpen(true);
  };

  const handleOpenEditModal = (item: QAItem) => {
    setEditingQaItem(item);
    setNewQuestion(item.question);
    setNewCategory(item.category);
    setNewTag(item.tag || '');
    setNewAnswer(item.answer);
    setNewKeywords(item.keywords || '');
    setIsQaModalOpen(true);
  };

  const handleCloseQaModal = () => {
    setIsQaModalOpen(false);
    setEditingQaItem(null);
    setNewQuestion('');
    setNewTag('');
    setNewAnswer('');
    setNewKeywords('');
  };

  const handleSaveQARule = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      alert('Please provide both question text and target answer.');
      return;
    }

    const trimmedQuestion = newQuestion.trim();
    const trimmedAnswer = newAnswer.trim();
    const trimmedTag = newTag.trim() || (newCategory === 'eeo' ? 'EEO' : 'Custom');
    const trimmedKeywords = newKeywords.trim() || trimmedQuestion.toLowerCase();

    if (editingQaItem) {
      // Editing existing QA rule
      const updatedItem: QAItem = {
        ...editingQaItem,
        category: newCategory,
        question: trimmedQuestion,
        tag: trimmedTag,
        answer: trimmedAnswer,
        keywords: trimmedKeywords,
      };

      const next = qaItems.map((item) => (item.id === editingQaItem.id ? updatedItem : item));
      setQaItems(next);

      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ customQaItems: next });
      } else {
        localStorage.setItem('applyr_custom_questions', JSON.stringify(next));
      }

      // Sync with stored profiles' customAnswers for autofill
      const oldKey = editingQaItem.question.toLowerCase().trim();
      const newKey = trimmedQuestion.toLowerCase().trim();
      const updatedProfiles = profiles.map((p) => {
        const ca = { ...(p.customAnswers || {}) };
        if (oldKey !== newKey && ca[oldKey] !== undefined) {
          delete ca[oldKey];
        }
        ca[newKey] = trimmedAnswer;
        return { ...p, customAnswers: ca };
      });
      setProfiles(updatedProfiles);
      await saveProfiles(updatedProfiles);

      handleCloseQaModal();
      showToast('Question & answer updated');
    } else {
      // Adding new QA rule
      const item: QAItem = {
        id: `qa-${Date.now()}`,
        category: newCategory,
        question: trimmedQuestion,
        tag: trimmedTag,
        answer: trimmedAnswer,
        keywords: trimmedKeywords,
      };

      const next = [item, ...qaItems];
      setQaItems(next);

      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ customQaItems: next });
      } else {
        localStorage.setItem('applyr_custom_questions', JSON.stringify(next));
      }

      // Sync with stored profiles' customAnswers for autofill
      const newKey = trimmedQuestion.toLowerCase().trim();
      const updatedProfiles = profiles.map((p) => {
        const ca = { ...(p.customAnswers || {}) };
        ca[newKey] = trimmedAnswer;
        return { ...p, customAnswers: ca };
      });
      setProfiles(updatedProfiles);
      await saveProfiles(updatedProfiles);

      handleCloseQaModal();
      showToast('Added question override');
    }
  };

  const handleDeleteQARule = async (id: string) => {
    const target = qaItems.find((item) => item.id === id);
    const next = qaItems.filter((item) => item.id !== id);
    setQaItems(next);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ customQaItems: next });
    } else {
      localStorage.setItem('applyr_custom_questions', JSON.stringify(next));
    }

    if (target) {
      const key = target.question.toLowerCase().trim();
      const updatedProfiles = profiles.map((p) => {
        const ca = { ...(p.customAnswers || {}) };
        delete ca[key];
        return { ...p, customAnswers: ca };
      });
      setProfiles(updatedProfiles);
      await saveProfiles(updatedProfiles);
    }
    showToast('Question removed');
  };

  const handleImportEEODefaults = () => {
    setQaItems(DEFAULT_QA_ITEMS);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ customQaItems: DEFAULT_QA_ITEMS });
    } else {
      localStorage.setItem('applyr_custom_questions', JSON.stringify(DEFAULT_QA_ITEMS));
    }
    showToast('Imported common EEO questions');
  };

  // Cache Operations
  const handleClearAllCache = async () => {
    if (confirm('Clear all learned field mappings for all websites?')) {
      setCache({});
      await saveStoredCache({});
      showToast('Cleared all site mappings');
    }
  };

  // Settings
  const handleSaveSettings = async () => {
    await saveSettings(settings);
    showToast('Settings saved');
  };

  const handleRevertSettings = () => {
    setSettings({
      aiFallbackEnabled: false,
      confidenceThreshold: 0.6,
      aiProvider: 'gemini',
      aiModel: 'gemini-1.5-flash',
    });
    showToast('Reverted to default settings');
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeTab === 'profiles') handleSaveProfiles();
        if (activeTab === 'settings') handleSaveSettings();
      }
      if (e.key === 'Escape') {
        handleCloseQaModal();
        setQaSearchQuery('');
        setMappingSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, profiles, settings, qaItems]);

  // Filtered Q&A Items
  const filteredQaItems = qaItems.filter((item) => {
    const matchesCategory = qaFilter === 'all' || item.category === qaFilter;
    const q = qaSearchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.question.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  // Filtered Cached Hostnames
  const cachedHostnames = Object.keys(cache).filter((h) =>
    h.toLowerCase().includes(mappingSearchQuery.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
      {/* Hidden file inputs */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        onChange={handleImportJson}
        style={{ display: 'none' }}
      />
      <input
        ref={resumeInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleReplaceResume}
        style={{ display: 'none' }}
      />

      {/* CLEAN SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant z-50 flex flex-col justify-between">
        <div className="flex flex-col">
          {/* Clean Brand Header */}
          <div className="px-5 py-5 border-b border-outline-variant">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-on-surface">Applyr</span>
              <span className="h-2 w-2 rounded-full bg-primary inline-block"></span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Local-First Form Filler</p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1 px-3 pt-4">
            <button
              onClick={() => setActiveTab('profiles')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-colors text-left ${
                activeTab === 'profiles'
                  ? 'bg-surface-container-highest text-on-surface font-semibold text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">folder_shared</span>
                <span>Profiles</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                {profiles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('qa')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-colors text-left ${
                activeTab === 'qa'
                  ? 'bg-surface-container-highest text-on-surface font-semibold text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">help_outline</span>
                <span>Custom Q&amp;A</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                {qaItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('mappings')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-colors text-left ${
                activeTab === 'mappings'
                  ? 'bg-surface-container-highest text-on-surface font-semibold text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">tab_unselected</span>
                <span>Site Mappings</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                {Object.keys(cache).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-colors text-left ${
                activeTab === 'settings'
                  ? 'bg-surface-container-highest text-on-surface font-semibold text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Clean Local Storage Badge */}
        <div className="p-3 m-3 rounded-lg border border-outline-variant bg-surface-container-lowest flex items-center justify-between text-xs text-on-surface-variant">
          <div className="flex items-center gap-1.5 text-primary font-medium">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Local Storage Only</span>
          </div>
          <span className="text-[11px] text-on-surface-variant">0 Cloud Egress</span>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="pl-64">
        {/* CLEAN TOP HEADER */}
        <header className="sticky top-0 h-14 bg-surface/95 backdrop-blur-sm border-b border-outline-variant z-40 flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">Applyr</span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface">
              {activeTab === 'profiles' && 'Profiles'}
              {activeTab === 'qa' && 'Custom Q&A & EEO'}
              {activeTab === 'mappings' && 'Site Mappings'}
              {activeTab === 'settings' && 'Settings'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              Local Only
            </span>
            <img
              src="/rishu_pfp.jpeg"
              alt="Rishit Chaudhary"
              width="32"
              height="32"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/40 shadow-sm"
              style={{ width: '32px', height: '32px', borderRadius: '9999px', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="w-full p-8 max-w-6xl mx-auto">
          {/* ======================================================== */}
          {/* TAB 1: PROFILES */}
          {/* ======================================================== */}
          {activeTab === 'profiles' && currentProfile && (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left Column: Profiles List */}
              <div className="w-full lg:w-64 shrink-0 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                    Your Profiles
                  </h2>
                  <button
                    onClick={handleAddProfile}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px] text-primary">add</span>
                    <span>New</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {profiles.map((p) => {
                    const isActive = p.id === selectedProfileId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProfileId(p.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-surface-container-lowest border-primary shadow-sm ring-1 ring-primary'
                            : 'bg-surface-container-low border-outline-variant/60 hover:bg-surface-container-lowest'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-on-surface">{p.name}</span>
                          {isActive && (
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1 truncate">
                          {p.experience.currentTitle || 'Job Applicant'}
                          {p.experience.yearsExperience ? ` · ${p.experience.yearsExperience}y exp` : ''}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Profile Editor */}
              <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
                {/* Header & Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-outline-variant">
                  <div>
                    <h1 className="text-2xl font-bold text-on-surface">{currentProfile.name}</h1>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      Personal details, experience, links, and resume used for autofill.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleDuplicateProfile}
                      className="px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium transition-colors"
                      type="button"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={handleExportJson}
                      className="px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium transition-colors"
                      type="button"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => importInputRef.current?.click()}
                      className="px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium transition-colors"
                      type="button"
                    >
                      Import JSON
                    </button>
                    <button
                      onClick={handleDeleteProfile}
                      className="px-3 py-1.5 rounded bg-error/10 hover:bg-error/20 text-error text-xs font-medium transition-colors"
                      type="button"
                    >
                      Delete
                    </button>
                    <button
                      onClick={handleSaveProfiles}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-sm transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {isSaving ? 'sync' : 'save'}
                      </span>
                      <span>Save Profile</span>
                    </button>
                  </div>
                </div>

                {/* Section: Profile Identity & Resume */}
                <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col gap-4">
                  <h3 className="text-base font-semibold text-on-surface">Profile Identity &amp; Resume</h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-on-surface-variant">Profile Name</label>
                    <input
                      className="w-full max-w-md bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                      type="text"
                      value={currentProfile.name}
                      onChange={(e) => updateProfileField('name', e.target.value)}
                    />
                  </div>

                  {/* Resume Attachment Box */}
                  <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-on-surface">
                          {currentProfile.resumeFileName || 'resume.pdf'}
                        </div>
                        <div className="text-xs text-on-surface-variant">Attached resume for form uploads</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => showToast(`Downloaded ${currentProfile.resumeFileName}`)}
                        className="px-3 py-1.5 rounded bg-surface-container-lowest hover:bg-surface-container text-xs font-medium border border-outline-variant transition-colors"
                        type="button"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => resumeInputRef.current?.click()}
                        className="px-3 py-1.5 rounded bg-surface-container-lowest hover:bg-surface-container text-xs font-medium border border-outline-variant transition-colors"
                        type="button"
                      >
                        Replace File
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section: Personal & Contact Information */}
                <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col gap-4">
                  <h3 className="text-base font-semibold text-on-surface">Personal Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">First Name</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        value={currentProfile.personal.firstName}
                        onChange={(e) => updateNestedField('personal', 'firstName', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Last Name</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        value={currentProfile.personal.lastName}
                        onChange={(e) => updateNestedField('personal', 'lastName', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Email Address</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="email"
                        value={currentProfile.personal.email}
                        onChange={(e) => updateNestedField('personal', 'email', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Phone Number</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="tel"
                        value={currentProfile.personal.phone}
                        onChange={(e) => updateNestedField('personal', 'phone', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-medium text-on-surface-variant">
                        Location (City, State / Country)
                      </label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        value={currentProfile.personal.location}
                        onChange={(e) => updateNestedField('personal', 'location', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Campus ID / Register No.</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        placeholder="e.g. 23BCT0157"
                        value={currentProfile.personal.campusId || ''}
                        onChange={(e) => updateNestedField('personal', 'campusId', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Campus / Alternate Email</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="email"
                        placeholder="e.g. rishit.chaudhary2023@vitstudent.ac.in"
                        value={currentProfile.personal.campusEmail || ''}
                        onChange={(e) => updateNestedField('personal', 'campusEmail', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Gender</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        placeholder="e.g. Male"
                        value={currentProfile.personal.gender || ''}
                        onChange={(e) => updateNestedField('personal', 'gender', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Citizenship</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        placeholder="e.g. Indian"
                        value={currentProfile.personal.citizenship || ''}
                        onChange={(e) => updateNestedField('personal', 'citizenship', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-medium text-on-surface-variant">Languages Known</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        placeholder="e.g. English, French, Hindi"
                        value={currentProfile.personal.languages || ''}
                        onChange={(e) => updateNestedField('personal', 'languages', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Links & Socials */}
                <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col gap-4">
                  <h3 className="text-base font-semibold text-on-surface">Links &amp; Portfolios</h3>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="w-24 text-xs font-medium text-on-surface-variant shrink-0">LinkedIn</span>
                      <input
                        className="flex-1 bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={currentProfile.links.linkedin || ''}
                        onChange={(e) => updateNestedField('links', 'linkedin', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="w-24 text-xs font-medium text-on-surface-variant shrink-0">GitHub</span>
                      <input
                        className="flex-1 bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="url"
                        placeholder="https://github.com/username"
                        value={currentProfile.links.github || ''}
                        onChange={(e) => updateNestedField('links', 'github', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="w-24 text-xs font-medium text-on-surface-variant shrink-0">Portfolio</span>
                      <input
                        className="flex-1 bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="url"
                        placeholder="https://yourportfolio.com"
                        value={currentProfile.links.portfolio || ''}
                        onChange={(e) => updateNestedField('links', 'portfolio', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="w-24 text-xs font-medium text-on-surface-variant shrink-0">LeetCode</span>
                      <input
                        className="flex-1 bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="url"
                        placeholder="https://leetcode.com/u/username"
                        value={currentProfile.links.leetcode || ''}
                        onChange={(e) => updateNestedField('links', 'leetcode', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Experience */}
                <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col gap-4">
                  <h3 className="text-base font-semibold text-on-surface">Experience &amp; Bio</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Current / Target Title</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        value={currentProfile.experience.currentTitle}
                        onChange={(e) => updateNestedField('experience', 'currentTitle', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Years of Experience</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="number"
                        min="0"
                        max="50"
                        value={currentProfile.experience.yearsExperience || 0}
                        onChange={(e) => updateNestedField('experience', 'yearsExperience', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-on-surface-variant">Candidate Bio / Summary</label>
                      <span className="text-xs text-on-surface-variant">
                        {(currentProfile.experience.summary || '').length}/500
                      </span>
                    </div>
                    <textarea
                      className="w-full bg-surface-container-low rounded-lg p-3 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none leading-relaxed"
                      maxLength={500}
                      rows={3}
                      value={currentProfile.experience.summary || ''}
                      onChange={(e) => updateNestedField('experience', 'summary', e.target.value)}
                    />
                  </div>
                </div>

                {/* Section: Education */}
                <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col gap-4 mb-8">
                  <h3 className="text-base font-semibold text-on-surface">Education</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Degree</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        placeholder="e.g. B.S. Computer Science"
                        value={currentProfile.education.degree}
                        onChange={(e) => updateNestedField('education', 'degree', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Institution / University</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        placeholder="e.g. State University"
                        value={currentProfile.education.institution}
                        onChange={(e) => updateNestedField('education', 'institution', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Graduation Year</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="number"
                        value={currentProfile.education.graduationYear}
                        onChange={(e) => updateNestedField('education', 'graduationYear', Number(e.target.value))}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">GPA / CGPA</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        placeholder="e.g. 8.68 / 10"
                        value={currentProfile.education.gpa || ''}
                        onChange={(e) => updateNestedField('education', 'gpa', e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Major / Specialization</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        placeholder="e.g. Computer Science & Engineering (IoT)"
                        value={currentProfile.education.fieldOfStudy || ''}
                        onChange={(e) => updateNestedField('education', 'fieldOfStudy', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Campus</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        placeholder="e.g. Vellore"
                        value={currentProfile.education.campus || ''}
                        onChange={(e) => updateNestedField('education', 'campus', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">10th Board Score (%)</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        placeholder="e.g. 96.6"
                        value={currentProfile.education.tenthScore || ''}
                        onChange={(e) => updateNestedField('education', 'tenthScore', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">12th Board Score (%)</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        placeholder="e.g. 80"
                        value={currentProfile.education.twelfthScore || ''}
                        onChange={(e) => updateNestedField('education', 'twelfthScore', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Active Backlogs</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        placeholder="e.g. No"
                        value={currentProfile.education.activeBacklogs || ''}
                        onChange={(e) => updateNestedField('education', 'activeBacklogs', e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Certifications &amp; Honors</label>
                      <input
                        className="w-full bg-surface-container-low rounded-lg p-2.5 text-sm text-on-surface border border-outline-variant focus:bg-surface-container-lowest focus:border-primary focus:outline-none"
                        type="text"
                        placeholder="e.g. Amazon ML Summer School, Oracle AI Certified, etc."
                        value={currentProfile.education.certifications || ''}
                        onChange={(e) => updateNestedField('education', 'certifications', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: CUSTOM Q&A & EEO */}
          {/* ======================================================== */}
          {activeTab === 'qa' && (
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
                <div>
                  <h1 className="text-2xl font-bold text-on-surface">Custom Q&amp;A &amp; EEO Overrides</h1>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    Pre-set answers for recurring job application prompts and demographic self-identification.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleImportEEODefaults}
                    className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium transition-colors"
                    type="button"
                  >
                    Import EEO Defaults
                  </button>
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-sm transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add Question</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant">
                <div className="flex-1 flex items-center gap-2 px-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
                  <input
                    className="w-full bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-outline"
                    placeholder="Search questions or keywords..."
                    type="text"
                    value={qaSearchQuery}
                    onChange={(e) => setQaSearchQuery(e.target.value)}
                  />
                  {qaSearchQuery && (
                    <button onClick={() => setQaSearchQuery('')} className="text-xs text-on-surface-variant hover:text-on-surface">
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto">
                  <button
                    onClick={() => setQaFilter('all')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      qaFilter === 'all'
                        ? 'bg-surface-container-highest text-on-surface font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    All ({qaItems.length})
                  </button>
                  <button
                    onClick={() => setQaFilter('exact')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      qaFilter === 'exact'
                        ? 'bg-surface-container-highest text-on-surface font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    Exact ({qaItems.filter((i) => i.category === 'exact').length})
                  </button>
                  <button
                    onClick={() => setQaFilter('eeo')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      qaFilter === 'eeo'
                        ? 'bg-surface-container-highest text-on-surface font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    EEO ({qaItems.filter((i) => i.category === 'eeo').length})
                  </button>
                  <button
                    onClick={() => setQaFilter('behavioral')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      qaFilter === 'behavioral'
                        ? 'bg-surface-container-highest text-on-surface font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    Behavioral ({qaItems.filter((i) => i.category === 'behavioral').length})
                  </button>
                </div>
              </div>

              {/* Questions Table */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      <th className="py-3 px-4" scope="col">
                        Question / Matcher
                      </th>
                      <th className="py-3 px-4" scope="col">
                        Pre-set Answer
                      </th>
                      <th className="py-3 px-4 w-32" scope="col">
                        Type
                      </th>
                      <th className="py-3 px-4 w-24 text-right" scope="col">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-sm">
                    {filteredQaItems.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-4 align-top">
                          <div className="font-medium text-on-surface">{item.question}</div>
                          {item.tag && (
                            <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                              {item.tag}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 align-top">
                          <div
                            onClick={() => handleOpenEditModal(item)}
                            className="group/ans p-2 rounded bg-surface-container-low hover:bg-surface-container hover:border-primary/40 border border-transparent text-on-surface font-medium text-xs max-w-lg cursor-pointer transition-all flex items-start justify-between gap-2"
                            title="Click to edit answer"
                          >
                            <span className="break-words">{item.answer}</span>
                            <span className="material-symbols-outlined text-[14px] text-on-surface-variant opacity-0 group-hover/ans:opacity-100 transition-opacity shrink-0 mt-0.5">
                              edit
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 align-top">
                          <span
                            className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
                              item.category === 'exact'
                                ? 'bg-primary-fixed text-on-primary-fixed-variant'
                                : item.category === 'eeo'
                                ? 'bg-surface-container-high text-on-surface'
                                : 'bg-secondary-fixed text-on-secondary-fixed'
                            }`}
                          >
                            {item.category === 'exact' && 'Exact'}
                            {item.category === 'eeo' && 'EEO Standard'}
                            {item.category === 'behavioral' && 'Behavioral'}
                          </span>
                        </td>
                        <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Edit Question & Answer"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteQARule(item.id)}
                              className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                              title="Delete"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredQaItems.length === 0 && (
                  <div className="p-8 text-center text-sm text-on-surface-variant">
                    No matching questions found.
                  </div>
                )}
              </div>

              {/* Add / Edit Question Modal */}
              {isQaModalOpen && (
                <div className="fixed inset-0 bg-inverse-surface/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-on-surface">
                          {editingQaItem ? 'Edit Question & Answer' : 'Add Question Override'}
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {editingQaItem
                            ? 'Update the question prompt matcher, autofill response, and type.'
                            : 'Pre-set a reliable answer for a recurring application question.'}
                        </p>
                      </div>
                      <button
                        onClick={handleCloseQaModal}
                        className="p-1 text-on-surface-variant hover:text-on-surface rounded"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>

                    <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-on-surface-variant">
                          Question Prompt / Matcher
                        </label>
                        <input
                          className="w-full p-2.5 rounded-lg bg-surface border border-outline-variant text-sm text-on-surface focus:border-primary focus:outline-none"
                          placeholder="e.g. Expected salary or Campus ID / Register number"
                          type="text"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-on-surface-variant">Type</label>
                          <select
                            className="w-full p-2.5 rounded-lg bg-surface border border-outline-variant text-sm text-on-surface focus:border-primary focus:outline-none"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value as any)}
                          >
                            <option value="exact">Exact Answer</option>
                            <option value="eeo">EEO Compliance</option>
                            <option value="behavioral">Behavioral Prompt</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-on-surface-variant">Tag (Optional)</label>
                          <input
                            className="w-full p-2.5 rounded-lg bg-surface border border-outline-variant text-sm text-on-surface focus:border-primary focus:outline-none"
                            placeholder="e.g. VIT Campus, Academics, Salary"
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-on-surface-variant">Target Autofill Answer</label>
                        <textarea
                          className="w-full p-2.5 rounded-lg bg-surface border border-outline-variant text-sm text-on-surface focus:border-primary focus:outline-none"
                          placeholder="Enter the exact answer to fill..."
                          rows={3}
                          value={newAnswer}
                          onChange={(e) => setNewAnswer(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-on-surface-variant">
                          Search Keywords (Optional)
                        </label>
                        <input
                          className="w-full p-2.5 rounded-lg bg-surface border border-outline-variant text-sm text-on-surface focus:border-primary focus:outline-none"
                          placeholder="e.g. campus id register roll student number"
                          type="text"
                          value={newKeywords}
                          onChange={(e) => setNewKeywords(e.target.value)}
                        />
                        <span className="text-[11px] text-on-surface-variant">
                          Space-separated keywords for search and fuzzy matching. Defaults to question prompt if left empty.
                        </span>
                      </div>
                    </div>

                    <div className="p-4 border-t border-outline-variant bg-surface-container-low flex justify-end gap-2">
                      <button
                        onClick={handleCloseQaModal}
                        className="px-4 py-2 border border-outline-variant rounded-lg text-sm text-on-surface hover:bg-surface-container"
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveQARule}
                        className="px-4 py-2 bg-primary text-on-primary hover:bg-primary-container rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {editingQaItem ? 'check' : 'add'}
                        </span>
                        <span>{editingQaItem ? 'Save Changes' : 'Save Question'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: SITE MAPPINGS */}
          {/* ======================================================== */}
          {activeTab === 'mappings' && (
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
                <div>
                  <h1 className="text-2xl font-bold text-on-surface">Learned Site Mappings</h1>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    Field signatures remembered automatically from your manual corrections on job portals.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBuiltIns(!showBuiltIns)}
                    className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium transition-colors"
                    type="button"
                  >
                    {showBuiltIns ? 'Hide Built-ins' : 'View Built-in Support'}
                  </button>
                  <button
                    onClick={handleClearAllCache}
                    className="px-3.5 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error text-xs font-medium transition-colors"
                    type="button"
                  >
                    Clear All Mappings
                  </button>
                </div>
              </div>

              {/* Built-ins Banner (Optional) */}
              {showBuiltIns && (
                <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-on-surface">Built-in ATS Support</h3>
                  <p className="text-xs text-on-surface-variant">
                    Applyr natively detects standard fields on Greenhouse, Workday, Lever, and Ashby out of the box.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2.5 rounded bg-surface-container-low text-center">
                      <div className="font-semibold text-xs text-on-surface">Greenhouse</div>
                      <div className="text-[11px] text-on-surface-variant">Core ATS</div>
                    </div>
                    <div className="p-2.5 rounded bg-surface-container-low text-center">
                      <div className="font-semibold text-xs text-on-surface">Workday</div>
                      <div className="text-[11px] text-on-surface-variant">Enterprise Portal</div>
                    </div>
                    <div className="p-2.5 rounded bg-surface-container-low text-center">
                      <div className="font-semibold text-xs text-on-surface">Lever</div>
                      <div className="text-[11px] text-on-surface-variant">Candidate App</div>
                    </div>
                    <div className="p-2.5 rounded bg-surface-container-low text-center">
                      <div className="font-semibold text-xs text-on-surface">Ashby</div>
                      <div className="text-[11px] text-on-surface-variant">Modern ATS</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Bar */}
              {cachedHostnames.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-surface-container-lowest rounded-lg border border-outline-variant">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
                  <input
                    className="w-full bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-outline"
                    placeholder="Filter saved hostnames..."
                    type="text"
                    value={mappingSearchQuery}
                    onChange={(e) => setMappingSearchQuery(e.target.value)}
                  />
                </div>
              )}

              {/* List of Site Mappings or Clean Empty State */}
              {cachedHostnames.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-xl p-10 border border-outline-variant text-center flex flex-col items-center justify-center gap-2 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-1">
                    <span className="material-symbols-outlined text-[24px]">tab_unselected</span>
                  </div>
                  <h3 className="text-base font-semibold text-on-surface">No site mappings recorded yet</h3>
                  <p className="text-sm text-on-surface-variant max-w-md">
                    When you autofill job applications and correct any unmapped field, Applyr will remember your
                    selection for that specific website.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {cachedHostnames.map((host) => (
                    <div
                      key={host}
                      className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                        <span className="font-semibold text-sm text-on-surface">{host}</span>
                        <button
                          onClick={async () => {
                            const next = { ...cache };
                            delete next[host];
                            setCache(next);
                            await saveStoredCache(next);
                            showToast(`Deleted mappings for ${host}`);
                          }}
                          className="text-xs text-error hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="divide-y divide-outline-variant/40 text-xs">
                        {Object.entries(cache[host]).map(([sig, item]) => (
                          <div key={sig} className="py-2 flex justify-between items-center">
                            <span className="font-mono text-on-surface-variant truncate max-w-xs">{sig}</span>
                            <span className="font-semibold text-primary">{item.canonicalField}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: SETTINGS */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-6 max-w-2xl">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                <div>
                  <h1 className="text-2xl font-bold text-on-surface">Extension Settings</h1>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    Confidence thresholds, privacy controls, and local storage.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRevertSettings}
                    className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium transition-colors"
                    type="button"
                  >
                    Revert
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-sm transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Save Settings</span>
                  </button>
                </div>
              </div>

              {/* Setting 1: Confidence Threshold */}
              <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold text-on-surface">Classification Threshold</h3>
                    <span className="text-lg font-bold text-primary">
                      {Math.round(settings.confidenceThreshold * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Fields with matching confidence below this threshold will remain empty for manual review.
                  </p>
                </div>

                <div className="py-2">
                  <input
                    className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary focus:outline-none"
                    max="100"
                    min="40"
                    step="5"
                    type="range"
                    value={Math.round(settings.confidenceThreshold * 100)}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        confidenceThreshold: Number(e.target.value) / 100,
                      })
                    }
                  />
                  <div className="flex justify-between text-[11px] text-on-surface-variant mt-1">
                    <span>40% (More Aggressive)</span>
                    <span>60% (Default)</span>
                    <span>100% (Strict Only)</span>
                  </div>
                </div>
              </div>

              {/* Setting 2: Optional AI Fallback */}
              <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-on-surface">AI Fallback for Unmapped Fields</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Optionally use AI to analyze unknown field labels. Off by default.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      className="sr-only peer"
                      type="checkbox"
                      checked={settings.aiFallbackEnabled}
                      onChange={(e) => setSettings({ ...settings, aiFallbackEnabled: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant text-xs text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface">Privacy Notice:</strong> When enabled, only field labels and
                  HTML tag types are sent to classify the field. Your personal details (name, email, address, resume)
                  are <strong>never</strong> transmitted.
                </div>

                {settings.aiFallbackEnabled && (
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">Provider</label>
                      <select
                        className="w-full p-2.5 rounded-lg bg-surface border border-outline-variant text-sm text-on-surface focus:border-primary focus:outline-none"
                        value={settings.aiProvider || 'gemini'}
                        onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value as any })}
                      >
                        <option value="gemini">Google Gemini (Recommended)</option>
                        <option value="openai">OpenAI</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface-variant">API Key</label>
                      <input
                        type="password"
                        placeholder="Enter API key..."
                        className="w-full p-2.5 rounded-lg bg-surface border border-outline-variant text-sm text-on-surface focus:border-primary focus:outline-none"
                        value={settings.aiApiKey || ''}
                        onChange={(e) => setSettings({ ...settings, aiApiKey: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Setting 3: Storage Management */}
              <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col gap-4 mb-8">
                <h3 className="text-base font-semibold text-on-surface">Data &amp; Backup</h3>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExportJson}
                    className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-medium text-on-surface transition-colors"
                    type="button"
                  >
                    Export All Profiles Backup
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to erase all profiles and cached data?')) {
                        await saveProfiles([]);
                        await saveStoredCache({});
                        setProfiles([]);
                        setCache({});
                        showToast('All local data cleared');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-xs font-medium text-error transition-colors"
                    type="button"
                  >
                    Wipe Local Storage
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 z-50 text-sm animate-in slide-in-from-bottom-3 fade-in duration-150">
          <span className="material-symbols-outlined text-[18px] text-primary-fixed">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
