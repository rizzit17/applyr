import React, { useEffect, useState } from 'react';
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
    setStatusMessage('Filling form fields...');

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
              setStatusMessage('No supported form found on this page.');
            }
          }
        );
      } else {
        // Mock preview simulation for testing/dev
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
              {
                name: 'eeo_race',
                labelText: 'Demographic self-identification category',
                confidence: 0.7,
                reason: 'EEO standard match',
                actionTaken: 'skipped-low-confidence',
              },
            ],
            hasCrossOriginIframes: false,
            resumeFilePrompt: activeProfile?.resumeFileName || 'resume.pdf',
          });
        }, 400);
      }
    } catch (err) {
      console.error('Error triggering fill:', err);
      setFilling(false);
      setStatusMessage('Failed to trigger fill.');
    }
  };

  const handleResetSiteCache = async () => {
    if (!currentHostname) return;
    try {
      const cache = await getStoredCache();
      if (cache[currentHostname]) {
        delete cache[currentHostname];
        await saveStoredCache(cache);
        setStatusMessage(`Cleared mappings for ${currentHostname}`);
        setTimeout(() => setStatusMessage(''), 2500);
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
      <div className="w-[360px] p-6 flex items-center justify-center bg-surface min-h-[260px]">
        <div className="flex items-center gap-2 text-xs text-primary font-medium">
          <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
          <span>Loading Applyr...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[360px] bg-surface text-on-surface flex flex-col gap-4 p-4 antialiased select-none font-body-md">
      {/* Clean Header */}
      <header className="flex items-center justify-between pb-3 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-on-surface tracking-tight">Applyr</span>
          <span className="h-2 w-2 rounded-full bg-primary inline-block"></span>
          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[11px] font-semibold">
            Local Only
          </span>
        </div>
        <button
          onClick={openOptions}
          className="p-1 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
          title="Open Settings & Profiles"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
        </button>
      </header>

      {/* Profile Selector Card */}
      <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col gap-2">
        <label
          htmlFor="popup-profile-select"
          className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
        >
          Active Profile
        </label>

        <select
          id="popup-profile-select"
          value={activeId}
          onChange={handleProfileChange}
          disabled={filling}
          className="w-full bg-surface-container-low rounded-lg p-2 text-sm text-on-surface border border-outline-variant focus:border-primary focus:outline-none cursor-pointer"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.experience.currentTitle ? `(${p.experience.currentTitle})` : ''}
            </option>
          ))}
        </select>

        {activeProfile && (
          <div className="pt-2 mt-1 border-t border-outline-variant/50 flex flex-col gap-1 text-xs text-on-surface-variant">
            <div className="flex justify-between items-center">
              <span>Candidate:</span>
              <span className="font-semibold text-on-surface">
                {activeProfile.personal.firstName} {activeProfile.personal.lastName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Resume File:</span>
              <span className="text-primary truncate max-w-[180px]">
                {activeProfile.resumeFileName}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Fill Button */}
      <button
        id="fill-trigger-btn"
        onClick={handleFill}
        disabled={filling || !activeProfile}
        className="w-full py-2.5 px-4 bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        type="button"
      >
        {filling ? (
          <>
            <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
            <span>Filling Form...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>Fill Application Form</span>
          </>
        )}
      </button>

      {/* Status feedback */}
      {statusMessage && (
        <div className="text-xs text-center text-on-surface-variant">
          {statusMessage}
        </div>
      )}

      {/* Fill Results Strip */}
      {fillResult && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant shadow-sm">
          <div
            className={`flex items-center gap-2 p-2 rounded text-xs font-semibold ${
              fillResult.reviewNeededCount === 0
                ? 'bg-primary-fixed text-on-primary-fixed-variant'
                : 'bg-secondary-fixed text-on-secondary-fixed'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {fillResult.reviewNeededCount === 0 ? 'check_circle' : 'warning'}
            </span>
            <span>
              Filled {fillResult.filledCount} of {fillResult.totalScanned} fields
              {fillResult.reviewNeededCount > 0 && ` · ${fillResult.reviewNeededCount} need review`}
            </span>
          </div>

          {/* Resume Prompt */}
          {fillResult.resumeFilePrompt && (
            <div className="p-2 rounded bg-primary-fixed/20 border border-primary-fixed-dim text-xs text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[16px]">picture_as_pdf</span>
              <span className="truncate">
                Attach resume: <strong>{fillResult.resumeFilePrompt}</strong>
              </span>
            </div>
          )}

          {/* Flagged Fields for Review */}
          {fillResult.flaggedFields.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[11px] font-semibold text-on-surface-variant">
                Fields to double check:
              </span>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {fillResult.flaggedFields.map((f, i) => (
                  <div
                    key={i}
                    className="p-1.5 rounded bg-surface-container text-xs flex justify-between items-center"
                  >
                    <span className="text-on-surface truncate max-w-[220px]" title={f.labelText}>
                      {f.labelText}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-semibold">
                      {Math.round(f.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clean Footer */}
      <footer className="pt-2 border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant">
        {currentHostname ? (
          <button
            onClick={handleResetSiteCache}
            className="hover:text-primary transition-colors flex items-center gap-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[13px]">history</span>
            <span>Reset site cache</span>
          </button>
        ) : (
          <div></div>
        )}
        <button
          onClick={openOptions}
          className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
          type="button"
        >
          <span>Dashboard</span>
          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};
