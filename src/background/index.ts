/**
 * Applyr Background Service Worker (Manifest V3)
 * Non-persistent event router, storage orchestrator, and AI caller.
 * Follows architecture.md and antigravity_prompt.md.
 */

import {
  getStoredProfiles,
  getActiveProfileId,
  getStoredCache,
  saveStoredCache,
  getStoredSettings,
} from '../core/schema';
import { batchClassifyFieldsWithAi } from '../core/ai';
import { ExtensionMessage } from '../core/types';

// Handle incoming messages
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === 'GET_ACTIVE_DATA') {
        const profiles = await getStoredProfiles();
        const activeProfileId = await getActiveProfileId();
        const settings = await getStoredSettings();
        sendResponse({
          type: 'ACTIVE_DATA_RESPONSE',
          profiles,
          activeProfileId,
          settings,
        });
        return;
      }

      if (message.type === 'TRIGGER_FILL') {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab || !activeTab.id || !activeTab.url) {
          sendResponse({
            type: 'FILL_RESULT',
            result: {
              totalScanned: 0,
              filledCount: 0,
              reviewNeededCount: 0,
              flaggedFields: [],
              hasCrossOriginIframes: false,
            },
          });
          return;
        }

        const tabUrl = new URL(activeTab.url);
        const hostname = tabUrl.hostname;

        const profiles = await getStoredProfiles();
        const profile = profiles.find((p) => p.id === message.profileId) || profiles[0];
        const cache = await getStoredCache();
        const siteCache = cache[hostname] || {};
        const settings = await getStoredSettings();

        // Ensure content script is ready; if not, inject it on-demand
        try {
          await chrome.tabs.sendMessage(activeTab.id, {
            type: 'RUN_FILL',
            profile,
            cache: siteCache,
            settings,
          });
        } catch {
          // Injection fallback if content script wasn't loaded
          await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ['src/content/index.js'],
          });

          // Give a brief moment for injection
          await new Promise((r) => setTimeout(r, 100));

          const res = await chrome.tabs.sendMessage(activeTab.id, {
            type: 'RUN_FILL',
            profile,
            cache: siteCache,
            settings,
          });
          sendResponse(res);
          return;
        }

        // Wait for fill result relayed by content script
        const result = await chrome.tabs.sendMessage(activeTab.id, {
          type: 'RUN_FILL',
          profile,
          cache: siteCache,
          settings,
        });
        sendResponse(result);
        return;
      }

      if (message.type === 'LEARN_CORRECTION') {
        const { hostname, fieldSignature, canonicalField } = message;
        const cache = await getStoredCache();
        if (!cache[hostname]) {
          cache[hostname] = {};
        }

        cache[hostname][fieldSignature] = {
          canonicalField,
          confidence: 0.95,
          lastUpdated: Date.now(),
          source: 'user-correction',
        };

        await saveStoredCache(cache);
        sendResponse({ success: true });
        return;
      }

      if (message.type === 'BATCH_AI_CLASSIFY') {
        const { hostname, fields } = message;
        const settings = await getStoredSettings();
        const aiResults = await batchClassifyFieldsWithAi(
          fields.map((f) => ({
            fieldSignature: f.fieldSignature,
            name: f.name,
            labelText: f.labelText,
            placeholder: f.placeholder,
            type: f.type,
            nearbyText: f.nearbyText,
          })),
          settings
        );

        // Immediately cache successful AI classifications per design spec
        if (aiResults.length > 0) {
          const cache = await getStoredCache();
          if (!cache[hostname]) {
            cache[hostname] = {};
          }

          for (const res of aiResults) {
            cache[hostname][res.fieldSignature] = {
              canonicalField: res.canonicalField,
              confidence: res.confidence,
              lastUpdated: Date.now(),
              source: 'ai',
            };
          }

          await saveStoredCache(cache);
        }

        sendResponse({ results: aiResults });
        return;
      }
    } catch (err) {
      console.error('Service worker error:', err);
      sendResponse({ error: String(err) });
    }
  })();

  return true; // Keep message channel open for async responses
});
