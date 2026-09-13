import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Profile, FillResultSummary } from '../core/types';
import {
  getStoredProfiles,
  getActiveProfileId,
  setActiveProfileId,
  getStoredCache,
  saveStoredCache,
} from '../core/schema';

export const Popup: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [filling, setFilling] = useState<boolean>(false);
  const [fillResult, setFillResult] = useState<FillResultSummary | null>(null);
  const [currentHostname, setCurrentHostname] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedProfiles, currentActiveId] = await Promise.all([
          getStoredProfiles(),
          getActiveProfileId(),
        ]);

        setProfiles(loadedProfiles);
        setActiveId(currentActiveId);

        // Get current tab hostname
        if (typeof chrome !== 'undefined' && chrome.tabs) {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab?.url) {
            try {
              const url = new URL(tab.url);
              setCurrentHostname(url.hostname);
            } catch {
              // Ignore non-standard URLs
            }
          }
        }
      } catch (err) {
        console.error('Failed to load popup data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleProfileChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setActiveId(newId);
    await setActiveProfileId(newId);
  };

  const handleFill = async () => {
    if (!activeId) return;
    setFilling(true);
    setFillResult(null);
    setStatusMessage('Scanning DOM & filling fields...');

    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage(
          { type: 'TRIGGER_FILL', profileId: activeId },
          (response) => {
            setFilling(false);
            if (response && response.result) {
              setFillResult(response.result);
              setStatusMessage('');
            } else {
              setStatusMessage('Unable to complete fill on this page.');
            }
          }
        );
      } else {
        // Fallback demo simulation for testing
        setTimeout(() => {
          setFilling(false);
          setFillResult({
            totalScanned: 16,
            filledCount: 14,
            reviewNeededCount: 2,
            flaggedFields: [
              {
                name: 'custom_question',
                labelText: 'Are you legally authorized to work in the United States?',
                confidence: 0.65,
                reason: 'Custom question match',
                actionTaken: 'skipped-low-confidence',
              },
            ],
            hasCrossOriginIframes: false,
            resumeFilePrompt: 'jane_doe_backend_resume.pdf',
          });
        }, 600);
      }
    } catch (err) {
      console.error('Error triggering fill:', err);
      setFilling(false);
      setStatusMessage('Fill trigger failed.');
    }
  };

  const handleResetSiteCache = async () => {
    if (!currentHostname) return;
    try {
      const cache = await getStoredCache();
      if (cache[currentHostname]) {
        delete cache[currentHostname];
        await saveStoredCache(cache);
        setStatusMessage(`Cleared learned mappings for ${currentHostname}`);
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to reset site cache:', err);
    }
  };

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('/src/options/index.html', '_blank');
    }
  };

  const activeProfile = profiles.find((p) => p.id === activeId) || profiles[0];

  if (loading) {
    return (
      <div className="popup-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="popup-container">
      {/* Header */}
      <header className="header">
        <div className="logo-section">
          <div className="logo-icon">
            <Sparkles size={16} color="#FFFFFF" />
          </div>
          <div>
            <h1 className="brand-title">Applyr</h1>
          </div>
          <span className="brand-badge">Local</span>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={openOptions} title="Profile & Cache Settings">
            <SettingsIcon size={16} />
          </button>
        </div>
      </header>

      {/* Profile Selector */}
      <div className="card">
        <label className="card-label" htmlFor="profile-select">
          Select Active Profile
        </label>
        <select
          id="profile-select"
          className="profile-select"
          value={activeId}
          onChange={handleProfileChange}
          disabled={filling}
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.experience.currentTitle || 'Profile'})
            </option>
          ))}
        </select>

        {activeProfile && (
          <div className="profile-preview">
            <div className="preview-row">
              <span>Candidate:</span>
              <span className="preview-val">
                {activeProfile.personal.firstName} {activeProfile.personal.lastName}
              </span>
            </div>
            <div className="preview-row">
              <span>Resume File:</span>
              <span className="preview-val">{activeProfile.resumeFileName}</span>
            </div>
          </div>
        )}
      </div>

      {/* Fill Trigger Button */}
      <button
        id="fill-trigger-btn"
        className="fill-button"
        onClick={handleFill}
        disabled={filling || !activeProfile}
      >
        {filling ? (
          <>
            <div className="spinner" />
            <span>Filling Form...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>Fill This Form</span>
          </>
        )}
      </button>

      {/* In-flight status message */}
      {statusMessage && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
          {statusMessage}
        </div>
      )}

      {/* Fill Results Section */}
      {fillResult && (
        <div className="results-section">
          <div
            className={`result-banner ${
              fillResult.reviewNeededCount === 0 ? 'success' : 'warning'
            }`}
          >
            {fillResult.reviewNeededCount === 0 ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            <span>
              Filled {fillResult.filledCount} of {fillResult.totalScanned} fields
              {fillResult.reviewNeededCount > 0 && ` • ${fillResult.reviewNeededCount} need review`}
            </span>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number success">{fillResult.filledCount}</div>
              <div className="stat-label">Auto-Filled</div>
            </div>
            <div className="stat-box">
              <div className="stat-number warning">{fillResult.reviewNeededCount}</div>
              <div className="stat-label">Need Review</div>
            </div>
          </div>

          {/* Resume Prompt */}
          {fillResult.resumeFilePrompt && (
            <div className="resume-notice">
              <FileText size={16} color="#818CF8" />
              <span>
                Attach resume manually: <strong>{fillResult.resumeFilePrompt}</strong>
              </span>
            </div>
          )}

          {/* Cross-origin iframe limitation notice */}
          {fillResult.hasCrossOriginIframes && (
            <div className="alert-box">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Notice:</strong> Some form sections are in cross-origin iframes and cannot be
                scanned due to browser security.
              </div>
            </div>
          )}

          {/* Flagged Fields for Review */}
          {fillResult.flaggedFields.length > 0 && (
            <div>
              <span className="card-label">Fields Requiring Eyeball Check:</span>
              <div className="flagged-list">
                {fillResult.flaggedFields.map((f, i) => (
                  <div key={i} className="flagged-item">
                    <span className="flagged-name" title={f.labelText}>
                      {f.labelText}
                    </span>
                    <span className="flagged-badge">
                      {Math.round(f.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        {currentHostname ? (
          <button
            className="footer-link"
            onClick={handleResetSiteCache}
            title={`Reset learned mappings for ${currentHostname}`}
          >
            <RotateCcw size={12} />
            <span>Reset site cache</span>
          </button>
        ) : (
          <div />
        )}
        <button className="footer-link" onClick={openOptions}>
          <span>Options</span>
          <ExternalLink size={12} />
        </button>
      </footer>
    </div>
  );
};
