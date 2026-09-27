import { SUPPORTED_LANGUAGES, findLanguageByShortCode, getLanguageByCode } from '../languages';

/**
 * Fast offline heuristic detection based on Unicode script ranges and distinctive words
 */
export function detectLanguageOffline(text) {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();
  if (!clean) return null;

  // 1. Unicode Script Range Check (Instant & 100% accurate for non-Latin scripts)
  if (/[\u0C80-\u0CFF]/.test(clean)) return getLanguageByCode('kn-IN'); // Kannada
  if (/[\u0B80-\u0BFF]/.test(clean)) return getLanguageByCode('ta-IN'); // Tamil
  if (/[\u0C00-\u0C7F]/.test(clean)) return getLanguageByCode('te-IN'); // Telugu
  if (/[\u0D00-\u0D7F]/.test(clean)) return getLanguageByCode('ml-IN'); // Malayalam
  if (/[\u0980-\u09FF]/.test(clean)) return getLanguageByCode('bn-IN'); // Bengali
  if (/[\u0A80-\u0AFF]/.test(clean)) return getLanguageByCode('gu-IN'); // Gujarati
  if (/[\u0A00-\u0A7F]/.test(clean)) return getLanguageByCode('pa-IN'); // Punjabi
  if (/[\u0900-\u097F]/.test(clean)) return getLanguageByCode('hi-IN'); // Hindi / Devanagari

  // East Asian Scripts
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(clean)) return getLanguageByCode('ja-JP'); // Japanese (Hiragana/Katakana)
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(clean)) return getLanguageByCode('ko-KR'); // Korean
  if (/[\u4E00-\u9FFF]/.test(clean)) return getLanguageByCode('zh-CN'); // Chinese Hanzi

  // Middle Eastern & Cyrillic
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(clean)) {
    return clean.includes('ہے') || clean.includes('میں') ? getLanguageByCode('ur-IN') : getLanguageByCode('ar-SA');
  }
  if (/[\u0400-\u04FF]/.test(clean)) return getLanguageByCode('ru-RU'); // Russian/Cyrillic
  if (/[\u0E00-\u0E7F]/.test(clean)) return getLanguageByCode('th-TH'); // Thai
  if (/[\u0370-\u03FF]/.test(clean)) return getLanguageByCode('el-GR'); // Greek

  // 2. Distinctive Latin script markers & vocabulary checks
  const lower = clean.toLowerCase();

  // Spanish markers
  if (/[¿¡ñ]/.test(lower) || /\b(hola|gracias|buenos|días|noches|estás|cómo|por favor|este|pero|amigo)\b/i.test(lower)) {
    return getLanguageByCode('es-ES');
  }

  // French markers
  if (/[çœæ]/.test(lower) || /\b(bonjour|merci|beaucoup|s'il vous plaît|oui|avec|dans|pour|c'est|nous|vous)\b/i.test(lower)) {
    return getLanguageByCode('fr-FR');
  }

  // German markers
  if (/[äöüß]/.test(lower) || /\b(guten tag|danke|bitte|hallo|nicht|und|ist|wir|sie|der|die|das)\b/i.test(lower)) {
    return getLanguageByCode('de-DE');
  }

  // Italian markers
  if (/\b(ciao|grazie|buongiorno|per favore|questo|quello|della|degli|molto|tutto)\b/i.test(lower)) {
    return getLanguageByCode('it-IT');
  }

  // Portuguese markers
  if (/[ãõ]/.test(lower) || /\b(olá|obrigado|obrigada|você|não|tudo bem|bom dia)\b/i.test(lower)) {
    return getLanguageByCode('pt-BR');
  }

  // Default to null if Latin text isn't unambiguously identifiable offline
  return null;
}

/**
 * Detect language of text using online service with offline fallback
 */
export async function detectLanguage(text) {
  if (!text || !text.trim()) {
    return getLanguageByCode('en-US');
  }

  const clean = text.trim();

  // Try fast offline heuristic first
  const offlineMatch = detectLanguageOffline(clean);
  if (offlineMatch) {
    return offlineMatch;
  }

  // If text is short English words or standard ASCII, check with translation endpoint
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(clean.slice(0, 500))}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      // data[2] is detected source language (e.g. "es", "fr", "de", "hi", etc.)
      const detectedShort = data[2] || (Array.isArray(data[8]) && data[8][0] && data[8][0][0]);
      if (detectedShort) {
        return findLanguageByShortCode(detectedShort);
      }
    }
  } catch (e) {
    // Network unavailable or aborted, fallback gracefully
  }

  return getLanguageByCode('en-US');
}

/**
 * Translate text from source language to target language
 */
export async function translateText(text, targetLangCode = 'en-US', sourceLangCode = 'auto') {
  if (!text || !text.trim()) {
    return {
      translatedText: '',
      detectedSourceLang: 'en-US',
      success: true,
    };
  }

  const clean = text.trim();
  const targetLang = getLanguageByCode(targetLangCode);
  const targetShort = targetLang.short || 'en';

  const sourceShort =
    sourceLangCode === 'auto'
      ? 'auto'
      : (getLanguageByCode(sourceLangCode).short || 'auto');

  // Attempt 1: Google GTX Translate API
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceShort}&tl=${targetShort}&dt=t&q=${encodeURIComponent(clean)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      let combined = '';
      if (Array.isArray(data[0])) {
        combined = data[0].map((chunk) => chunk[0]).filter(Boolean).join('');
      }

      const detectedShort = data[2] || (sourceShort !== 'auto' ? sourceShort : 'en');
      const detectedLang = findLanguageByShortCode(detectedShort);

      return {
        translatedText: combined || clean,
        detectedSourceLang: detectedLang.code,
        detectedLangObj: detectedLang,
        targetLangObj: targetLang,
        success: true,
      };
    }
  } catch (err) {
    console.warn('Google GTX Translate API failed, trying fallback:', err);
  }

  // Attempt 2: MyMemory API Fallback
  try {
    const sPair = sourceShort === 'auto' ? 'en' : sourceShort;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${sPair}|${targetShort}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.responseData && data.responseData.translatedText) {
        return {
          translatedText: data.responseData.translatedText,
          detectedSourceLang: sourceLangCode === 'auto' ? 'en-US' : sourceLangCode,
          detectedLangObj: getLanguageByCode(sourceLangCode),
          targetLangObj: targetLang,
          success: true,
        };
      }
    }
  } catch (err) {
    console.error('All translation APIs failed:', err);
  }

  // If completely offline or all APIs failed, return original with notice
  return {
    translatedText: clean,
    detectedSourceLang: sourceLangCode === 'auto' ? 'en-US' : sourceLangCode,
    detectedLangObj: getLanguageByCode(sourceLangCode),
    targetLangObj: targetLang,
    success: false,
    error: 'Translation service is currently unreachable. Please check your internet connection.',
  };
}
