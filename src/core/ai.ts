import { Settings } from './types';

export interface AiFieldBatchInput {
  fieldSignature: string;
  name: string;
  labelText: string;
  placeholder: string;
  type: string;
  nearbyText: string;
}

export interface AiClassificationResult {
  fieldSignature: string;
  canonicalField: string;
  confidence: number;
}

const CANONICAL_KEYS = [
  'personal.firstName',
  'personal.lastName',
  'personal.fullName',
  'personal.email',
  'personal.phone',
  'personal.location',
  'personal.city',
  'personal.state',
  'personal.country',
  'links.linkedin',
  'links.github',
  'links.portfolio',
  'links.leetcode',
  'experience.currentTitle',
  'experience.yearsExperience',
  'experience.summary',
  'education.degree',
  'education.institution',
  'education.graduationYear',
  'education.gpa',
  'education.fieldOfStudy',
  'resumeFileName',
  'customAnswers.why do you want to work here',
  'customAnswers.why are you interested in this role',
  'customAnswers.tell us about a challenging project',
  'customAnswers.what technologies are you most proficient in',
  'customAnswers.notice period',
  'customAnswers.authorized to work in us',
  'customAnswers.authorized to work in india',
  'customAnswers.require sponsorship',
  'customAnswers.gender',
  'customAnswers.veteran status',
  'customAnswers.disability status',
];

/**
 * Batches unmapped field metadata and requests LLM classification.
 * PRIVACY GUARD: No personal profile values are ever sent, ONLY field metadata and canonical keys.
 */
export async function batchClassifyFieldsWithAi(
  fields: AiFieldBatchInput[],
  settings: Settings
): Promise<AiClassificationResult[]> {
  if (!settings.aiFallbackEnabled || !settings.aiApiKey || fields.length === 0) {
    return [];
  }

  const prompt = `You are a strict field classifier for web application forms.
Your task is to map each unidentified web form field to the single best canonical key from this list:
${JSON.stringify(CANONICAL_KEYS, null, 2)}

If a field does not match any key, return null for canonicalField.

Input Fields:
${JSON.stringify(fields, null, 2)}

Respond ONLY with valid JSON array of objects in this exact format:
[
  {
    "fieldSignature": string,
    "canonicalField": string | null,
    "confidence": number (between 0.0 and 0.8)
  }
]`;

  try {
    const provider = settings.aiProvider || 'gemini';
    let rawText = '';

    if (provider === 'gemini') {
      const model = settings.aiModel || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        settings.aiApiKey
      )}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const json = await response.json();
      rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    } else {
      // OpenAI / OpenRouter / Anthropic compatible endpoint
      const endpoint =
        provider === 'openrouter'
          ? 'https://openrouter.ai/api/v1/chat/completions'
          : 'https://api.openai.com/v1/chat/completions';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.aiApiKey}`,
        },
        body: JSON.stringify({
          model: settings.aiModel || (provider === 'openrouter' ? 'meta-llama/llama-3.3-70b-instruct' : 'gpt-4o-mini'),
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const json = await response.json();
      rawText = json?.choices?.[0]?.message?.content || '[]';
    }

    // Clean JSON response (remove markdown backticks if any)
    const cleaned = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    const results: AiClassificationResult[] = [];

    const items = Array.isArray(parsed) ? parsed : parsed.fields || parsed.results || [];
    for (const item of items) {
      if (item.fieldSignature && item.canonicalField && CANONICAL_KEYS.includes(item.canonicalField)) {
        results.push({
          fieldSignature: item.fieldSignature,
          canonicalField: item.canonicalField,
          confidence: Math.min(0.8, Number(item.confidence) || 0.7), // Capped at 0.8 per design doc
        });
      }
    }

    return results;
  } catch (err) {
    console.error('AI classification fallback failed:', err);
    return [];
  }
}
