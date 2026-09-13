/**
 * Applyr Content Script Entry Point
 * Listens for RUN_FILL messages, orchestrates scanning, classification, filling,
 * and correction tracking.
 */

import { scanForm } from './scanner';
import { classifyField } from '../core/classifier';
import { fillFieldsSequentially } from './filler';
import { startCorrectionMonitoring } from './corrections';
import { clearHighlights } from './highlighter';
import { ExtensionMessage, FillResultSummary, FieldGuess, DetectedField } from '../core/types';

// Prevent duplicate listener attachment
if (!(window as unknown as { __applyrInjected?: boolean }).__applyrInjected) {
  (window as unknown as { __applyrInjected?: boolean }).__applyrInjected = true;

  chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === 'RUN_FILL') {
      (async () => {
        try {
          const { profile, cache, settings } = message;
          const hostname = window.location.hostname;

          clearHighlights();

          // 1. Scan Form DOM
          const scanResult = scanForm(document);
          const detectedFields = scanResult.fields;

          // 2. Classify fields
          const classifiedItems: Array<{ field: DetectedField; guess: FieldGuess }> = [];
          const unmappedFieldsForAi: Array<Omit<DetectedField, 'element'>> = [];

          for (const field of detectedFields) {
            const guess = classifyField(field, profile, cache, settings.confidenceThreshold);
            classifiedItems.push({ field, guess });

            if (guess.confidence < settings.confidenceThreshold && settings.aiFallbackEnabled) {
              unmappedFieldsForAi.push({
                id: field.id,
                name: field.name,
                type: field.type,
                htmlType: field.htmlType,
                placeholder: field.placeholder,
                autocomplete: field.autocomplete,
                labelText: field.labelText,
                nearbyText: field.nearbyText,
                fieldSignature: field.fieldSignature,
              });
            }
          }

          // 3. Optional AI Fallback for unmapped fields (Phase 6)
          if (unmappedFieldsForAi.length > 0 && settings.aiFallbackEnabled) {
            try {
              const aiResponse = await new Promise<any>((resolve) => {
                chrome.runtime.sendMessage(
                  {
                    type: 'BATCH_AI_CLASSIFY',
                    hostname,
                    fields: unmappedFieldsForAi,
                  },
                  (res) => resolve(res)
                );
              });

              if (aiResponse && Array.isArray(aiResponse.results)) {
                for (const aiResult of aiResponse.results) {
                  const match = classifiedItems.find(
                    (item) => item.field.fieldSignature === aiResult.fieldSignature
                  );
                  if (match && aiResult.canonicalField) {
                    match.guess = {
                      canonicalField: aiResult.canonicalField,
                      confidence: aiResult.confidence,
                      source: 'ai',
                      reason: 'Classified via AI fallback',
                      targetValue: match.field.element
                        ? classifyField(match.field, profile, {
                            [match.field.fieldSignature]: {
                              canonicalField: aiResult.canonicalField,
                              confidence: aiResult.confidence,
                              lastUpdated: Date.now(),
                              source: 'ai',
                            },
                          }).targetValue
                        : undefined,
                    };
                  }
                }
              }
            } catch (aiErr) {
              console.warn('AI fallback classification request failed:', aiErr);
            }
          }

          // 4. Fill fields sequentially
          const outcomes = await fillFieldsSequentially(classifiedItems, settings.confidenceThreshold);

          // 5. Start monitoring for manual corrections
          startCorrectionMonitoring(detectedFields, profile, hostname, (h, sig, canonical) => {
            chrome.runtime.sendMessage({
              type: 'LEARN_CORRECTION',
              hostname: h,
              fieldSignature: sig,
              canonicalField: canonical,
            });
          });

          // 6. Summarize results
          const filledCount = outcomes.filter((o) => o.actionTaken === 'filled' || o.actionTaken === 'prompt-manual-file').length;
          const reviewNeeded = outcomes.filter((o) => o.actionTaken === 'skipped-low-confidence').length;

          const flagged = outcomes
            .filter((o) => o.actionTaken !== 'filled')
            .map((o) => ({
              name: o.field.name || o.field.id,
              labelText: o.field.labelText || o.field.placeholder || 'Unnamed field',
              confidence: o.guess.confidence,
              reason: o.guess.reason || 'Low confidence match',
              actionTaken: o.actionTaken,
            }));

          const summary: FillResultSummary = {
            totalScanned: detectedFields.length,
            filledCount,
            reviewNeededCount: reviewNeeded,
            flaggedFields: flagged,
            hasCrossOriginIframes: scanResult.hasCrossOriginIframes,
            resumeFilePrompt: profile.resumeFileName,
          };

          sendResponse({ type: 'FILL_RESULT', result: summary });
        } catch (err) {
          console.error('Fatal error in content script execution:', err);
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
        }
      })();

      return true; // Keep message channel open for async response
    }
  });
}
