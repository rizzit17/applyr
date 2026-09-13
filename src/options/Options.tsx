import React, { useEffect, useState } from 'react';
import {
  User,
  Database,
  Sliders,
  Plus,
  Copy,
  Trash2,
  Download,
  Upload,
  Save,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  Briefcase,
  GraduationCap,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
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

export const Options: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'cache' | 'settings'>('profiles');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [cache, setCache] = useState<FieldMappingCache>({});
  const [settings, setSettings] = useState<Settings>({
    aiFallbackEnabled: false,
    confidenceThreshold: 0.6,
    aiProvider: 'gemini',
    aiModel: 'gemini-1.5-flash',
  });
  const [toastMessage, setToastMessage] = useState<string>('');

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
    }
    load();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
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
    await saveProfiles(profiles);
    showToast('Profiles saved successfully!');
  };

  const handleAddProfile = () => {
    const newId = `profile_${Date.now()}`;
    const newProfile: Profile = {
      id: newId,
      name: `New Profile ${profiles.length + 1}`,
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
    if (confirm(`Delete profile "${currentProfile.name}"?`)) {
      const next = profiles.filter((p) => p.id !== currentProfile.id);
      setProfiles(next);
      setSelectedProfileId(next[0].id);
      await saveProfiles(next);
      showToast('Profile deleted.');
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
    showToast('Profiles exported as JSON.');
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

  // Custom Answers CRUD
  const handleAddCustomAnswer = () => {
    if (!currentProfile) return;
    const answers = { ...(currentProfile.customAnswers || {}), 'new question': 'answer' };
    updateProfileField('customAnswers', answers);
  };

  const handleUpdateCustomAnswerKey = (oldKey: string, newKey: string) => {
    if (!currentProfile || !currentProfile.customAnswers) return;
    const answers = { ...currentProfile.customAnswers };
    const val = answers[oldKey];
    delete answers[oldKey];
    answers[newKey] = val;
    updateProfileField('customAnswers', answers);
  };

  const handleUpdateCustomAnswerVal = (key: string, val: string) => {
    if (!currentProfile || !currentProfile.customAnswers) return;
    const answers = { ...currentProfile.customAnswers, [key]: val };
    updateProfileField('customAnswers', answers);
  };

  const handleDeleteCustomAnswer = (key: string) => {
    if (!currentProfile || !currentProfile.customAnswers) return;
    const answers = { ...currentProfile.customAnswers };
    delete answers[key];
    updateProfileField('customAnswers', answers);
  };

  // Cache Operations
  const handleDeleteSiteCache = async (hostname: string) => {
    const next = { ...cache };
    delete next[hostname];
    setCache(next);
    await saveStoredCache(next);
    showToast(`Deleted cache for ${hostname}`);
  };

  const handleClearAllCache = async () => {
    if (confirm('Clear all learned field mappings across all websites?')) {
      setCache({});
      await saveStoredCache({});
      showToast('Learned mappings cleared.');
    }
  };

  // Settings
  const handleSaveSettings = async () => {
    await saveSettings(settings);
    showToast('Settings saved.');
  };

  return (
    <div className="options-layout">
      {/* Left Navigation Sidebar */}
      <aside className="sidebar">
        <div className="brand-header">
          <div className="logo-badge">
            <Sparkles size={20} color="#FFFFFF" />
          </div>
          <div className="brand-text">
            <h1>Applyr</h1>
            <p>Local-First Configuration</p>
          </div>
        </div>

        <nav className="nav-menu">
          <button
            className={`nav-item ${activeTab === 'profiles' ? 'active' : ''}`}
            onClick={() => setActiveTab('profiles')}
          >
            <User size={18} />
            <span>Profiles</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'cache' ? 'active' : ''}`}
            onClick={() => setActiveTab('cache')}
          >
            <Database size={18} />
            <span>Site Mappings</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Sliders size={18} />
            <span>Settings</span>
          </button>
        </nav>

        {activeTab === 'profiles' && (
          <div className="profiles-sidebar-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-label">Your Profiles</span>
              <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={handleAddProfile}>
                <Plus size={14} />
                <span>New</span>
              </button>
            </div>

            {profiles.map((p) => (
              <div
                key={p.id}
                className={`profile-pill ${p.id === selectedProfileId ? 'active' : ''}`}
                onClick={() => setSelectedProfileId(p.id)}
              >
                <span>{p.name}</span>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>
                  {p.experience?.yearsExperience ? `${p.experience.yearsExperience}y` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">
        {/* TAB 1: PROFILES */}
        {activeTab === 'profiles' && currentProfile && (
          <div>
            <div className="content-header">
              <div className="content-title">
                <h2>Edit Profile: {currentProfile.name}</h2>
                <p>Personal details, experience, links, and custom Q&A answers.</p>
              </div>
              <div className="header-buttons">
                <button className="btn btn-secondary" onClick={handleDuplicateProfile}>
                  <Copy size={14} />
                  <span>Duplicate</span>
                </button>
                <button className="btn btn-secondary" onClick={handleExportJson}>
                  <Download size={14} />
                  <span>Export JSON</span>
                </button>
                <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                  <Upload size={14} />
                  <span>Import JSON</span>
                  <input type="file" accept=".json" onChange={handleImportJson} style={{ display: 'none' }} />
                </label>
                <button className="btn btn-danger" onClick={handleDeleteProfile}>
                  <Trash2 size={14} />
                </button>
                <button className="btn btn-primary" onClick={handleSaveProfiles}>
                  <Save size={14} />
                  <span>Save Profile</span>
                </button>
              </div>
            </div>

            {/* Profile Name & Resume */}
            <div className="card-section">
              <h3>
                <User size={18} color="#818CF8" />
                Profile Identity
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Profile Name</label>
                  <input
                    type="text"
                    value={currentProfile.name}
                    onChange={(e) => updateProfileField('name', e.target.value)}
                    placeholder="e.g. Backend, ML, Fullstack"
                  />
                </div>
                <div className="form-group">
                  <label>Default Resume Attachment File Name</label>
                  <input
                    type="text"
                    value={currentProfile.resumeFileName}
                    onChange={(e) => updateProfileField('resumeFileName', e.target.value)}
                    placeholder="e.g. jane_doe_resume.pdf"
                  />
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="card-section">
              <h3>
                <User size={18} color="#818CF8" />
                Personal & Contact Info
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={currentProfile.personal.firstName}
                    onChange={(e) => updateNestedField('personal', 'firstName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={currentProfile.personal.lastName}
                    onChange={(e) => updateNestedField('personal', 'lastName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={currentProfile.personal.email}
                    onChange={(e) => updateNestedField('personal', 'email', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={currentProfile.personal.phone}
                    onChange={(e) => updateNestedField('personal', 'phone', e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Location (City, State / Country)</label>
                  <input
                    type="text"
                    value={currentProfile.personal.location}
                    onChange={(e) => updateNestedField('personal', 'location', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Online Profiles & Links */}
            <div className="card-section">
              <h3>
                <LinkIcon size={18} color="#818CF8" />
                Links & Portfolios
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>LinkedIn URL</label>
                  <input
                    type="url"
                    value={currentProfile.links.linkedin || ''}
                    onChange={(e) => updateNestedField('links', 'linkedin', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>GitHub URL</label>
                  <input
                    type="url"
                    value={currentProfile.links.github || ''}
                    onChange={(e) => updateNestedField('links', 'github', e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Portfolio / Personal Website</label>
                  <input
                    type="url"
                    value={currentProfile.links.portfolio || ''}
                    onChange={(e) => updateNestedField('links', 'portfolio', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Experience & Summary */}
            <div className="card-section">
              <h3>
                <Briefcase size={18} color="#818CF8" />
                Experience & Summary
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Current / Target Job Title</label>
                  <input
                    type="text"
                    value={currentProfile.experience.currentTitle}
                    onChange={(e) => updateNestedField('experience', 'currentTitle', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Total Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={currentProfile.experience.yearsExperience}
                    onChange={(e) => updateNestedField('experience', 'yearsExperience', Number(e.target.value))}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Candidate Summary / Cover Letter Statement</label>
                  <textarea
                    value={currentProfile.experience.summary}
                    onChange={(e) => updateNestedField('experience', 'summary', e.target.value)}
                    placeholder="Short bio used for summary fields and 'why are you interested' questions"
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="card-section">
              <h3>
                <GraduationCap size={18} color="#818CF8" />
                Education
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Degree</label>
                  <input
                    type="text"
                    value={currentProfile.education.degree}
                    onChange={(e) => updateNestedField('education', 'degree', e.target.value)}
                    placeholder="B.S. Computer Science"
                  />
                </div>
                <div className="form-group">
                  <label>Institution / University</label>
                  <input
                    type="text"
                    value={currentProfile.education.institution}
                    onChange={(e) => updateNestedField('education', 'institution', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Graduation Year</label>
                  <input
                    type="number"
                    value={currentProfile.education.graduationYear}
                    onChange={(e) => updateNestedField('education', 'graduationYear', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Custom Answers & EEO Overrides */}
            <div className="card-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3>
                  <MessageSquare size={18} color="#818CF8" />
                  Custom Q&A & EEO Overrides
                </h3>
                <button className="btn btn-secondary" onClick={handleAddCustomAnswer}>
                  <Plus size={14} />
                  <span>Add Question</span>
                </button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Pre-populate answers for recurring application questions (e.g. sponsorship, authorization, gender, veteran status).
              </p>

              {currentProfile.customAnswers &&
                Object.entries(currentProfile.customAnswers).map(([qKey, val]) => (
                  <div key={qKey} className="qa-row">
                    <input
                      type="text"
                      value={qKey}
                      onChange={(e) => handleUpdateCustomAnswerKey(qKey, e.target.value)}
                      placeholder="Question keywords..."
                    />
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleUpdateCustomAnswerVal(qKey, e.target.value)}
                      placeholder="Pre-set answer..."
                    />
                    <button className="btn btn-danger" onClick={() => handleDeleteCustomAnswer(qKey)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 2: LEARNED CACHE */}
        {activeTab === 'cache' && (
          <div>
            <div className="content-header">
              <div className="content-title">
                <h2>Learned Site Mappings</h2>
                <p>Per-hostname field signatures learned from your manual corrections.</p>
              </div>
              <div>
                <button className="btn btn-danger" onClick={handleClearAllCache}>
                  <Trash2 size={14} />
                  <span>Clear Entire Cache</span>
                </button>
              </div>
            </div>

            {Object.keys(cache).length === 0 ? (
              <div className="card-section" style={{ textAlign: 'center', padding: '40px' }}>
                <Database size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <h3>No site mappings recorded yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  When you autofill a job form and make manual corrections, Applyr will automatically record the mappings here.
                </p>
              </div>
            ) : (
              Object.entries(cache).map(([hostname, fields]) => (
                <div key={hostname} className="card-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>{hostname}</h3>
                    <button className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => handleDeleteSiteCache(hostname)}>
                      <Trash2 size={12} />
                      <span>Delete Mappings</span>
                    </button>
                  </div>

                  <table className="cache-table">
                    <thead>
                      <tr>
                        <th>Field Signature</th>
                        <th>Mapped Canonical Field</th>
                        <th>Source</th>
                        <th>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(fields).map(([sig, entry]) => (
                        <tr key={sig}>
                          <td><code>{sig}</code></td>
                          <td><strong>{entry.canonicalField}</strong></td>
                          <td>
                            <span className={`badge ${entry.source === 'ai' ? 'badge-ai' : 'badge-correction'}`}>
                              {entry.source}
                            </span>
                          </td>
                          <td>{Math.round(entry.confidence * 100)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div>
            <div className="content-header">
              <div className="content-title">
                <h2>Extension Settings</h2>
                <p>Confidence thresholds and optional metadata-only AI fallback.</p>
              </div>
              <button className="btn btn-primary" onClick={handleSaveSettings}>
                <Save size={14} />
                <span>Save Settings</span>
              </button>
            </div>

            {/* Threshold Setting */}
            <div className="card-section">
              <h3>
                <Sliders size={18} color="#818CF8" />
                Classification Threshold
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Fields with classification confidence below this threshold will be left empty and visually highlighted for your review.
              </p>

              <div className="form-group" style={{ maxWidth: '400px' }}>
                <label>
                  Minimum Confidence Threshold: <strong>{Math.round(settings.confidenceThreshold * 100)}%</strong>
                </label>
                <input
                  type="range"
                  min="0.4"
                  max="0.9"
                  step="0.05"
                  value={settings.confidenceThreshold}
                  onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            {/* AI Fallback (Optional) */}
            <div className="card-section">
              <h3>
                <Sparkles size={18} color="#818CF8" />
                Optional AI Fallback (Off by Default)
              </h3>

              <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '12px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#FBBF24', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                  <AlertTriangle size={16} />
                  Privacy & Data Disclosure
                </div>
                <p style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: 1.5 }}>
                  Enabling AI fallback sends <strong>only field metadata</strong> (label text, input type, placeholder) to the external LLM to classify unmapped fields.
                  <strong> No personal values (names, addresses, phone numbers) are ever sent.</strong>
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.aiFallbackEnabled}
                    onChange={(e) => setSettings({ ...settings, aiFallbackEnabled: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Enable AI Fallback for unmapped fields</span>
                </label>
              </div>

              {settings.aiFallbackEnabled && (
                <div className="form-grid">
                  <div className="form-group">
                    <label>AI Provider</label>
                    <select
                      value={settings.aiProvider || 'gemini'}
                      onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value as any })}
                    >
                      <option value="gemini">Google Gemini API (Recommended)</option>
                      <option value="openai">OpenAI API</option>
                      <option value="openrouter">OpenRouter</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Model Name</label>
                    <input
                      type="text"
                      value={settings.aiModel || 'gemini-1.5-flash'}
                      onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
                      placeholder="e.g. gemini-1.5-flash or gpt-4o-mini"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>API Key</label>
                    <input
                      type="password"
                      value={settings.aiApiKey || ''}
                      onChange={(e) => setSettings({ ...settings, aiApiKey: e.target.value })}
                      placeholder="Enter your API key (stored securely in chrome.storage.local)"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notice">
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
