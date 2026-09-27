export const SUPPORTED_LANGUAGES = [
  // Major International Languages
  { code: 'en-US', short: 'en', name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', short: 'en', name: 'English (UK)', nativeName: 'English (UK)', flag: '🇬🇧' },
  { code: 'en-IN', short: 'en', name: 'English (India)', nativeName: 'English (India)', flag: '🇮🇳' },
  { code: 'es-ES', short: 'es', name: 'Spanish (Spain)', nativeName: 'Español (España)', flag: '🇪🇸' },
  { code: 'es-MX', short: 'es', name: 'Spanish (Mexico)', nativeName: 'Español (México)', flag: '🇲🇽' },
  { code: 'fr-FR', short: 'fr', name: 'French (France)', nativeName: 'Français (France)', flag: '🇫🇷' },
  { code: 'fr-CA', short: 'fr', name: 'French (Canada)', nativeName: 'Français (Canada)', flag: '🇨🇦' },
  { code: 'de-DE', short: 'de', name: 'German (Germany)', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', short: 'it', name: 'Italian (Italy)', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt-BR', short: 'pt', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', short: 'pt', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'ru-RU', short: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja-JP', short: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', short: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', short: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', short: 'zh', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'ar-SA', short: 'ar', name: 'Arabic (Saudi Arabia)', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'ar-AE', short: 'ar', name: 'Arabic (UAE)', nativeName: 'العربية (الإمارات)', flag: '🇦🇪' },
  { code: 'nl-NL', short: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'tr-TR', short: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl-PL', short: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'vi-VN', short: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th-TH', short: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'id-ID', short: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'uk-UA', short: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'sv-SE', short: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'el-GR', short: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },

  // Indian Regional Languages
  { code: 'hi-IN', short: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'kn-IN', short: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ta-IN', short: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te-IN', short: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ml-IN', short: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr-IN', short: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'bn-IN', short: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu-IN', short: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa-IN', short: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur-IN', short: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
];

export const POPULAR_LANGUAGES = [
  'en-US',
  'es-ES',
  'fr-FR',
  'de-DE',
  'hi-IN',
  'ja-JP',
  'zh-CN',
  'kn-IN',
  'ta-IN',
  'te-IN',
  'ar-SA',
  'ru-RU',
];

/**
 * Find language object by full code (e.g. 'es-ES' or 'en-US')
 */
export function getLanguageByCode(code) {
  if (!code) return SUPPORTED_LANGUAGES[0];
  const normalized = code.toLowerCase().replace('_', '-');
  return (
    SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase() === normalized) ||
    SUPPORTED_LANGUAGES.find((l) => l.short.toLowerCase() === normalized.split('-')[0]) ||
    SUPPORTED_LANGUAGES[0]
  );
}

/**
 * Find language object by short 2-letter code (e.g. 'es', 'hi', 'fr')
 */
export function findLanguageByShortCode(shortCode) {
  if (!shortCode) return SUPPORTED_LANGUAGES[0];
  const s = shortCode.toLowerCase().trim();
  return (
    SUPPORTED_LANGUAGES.find((l) => l.short.toLowerCase() === s) ||
    SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase().startsWith(s)) ||
    SUPPORTED_LANGUAGES[0]
  );
}

/**
 * Match best available browser synthesis voice for a language code
 */
export function findBestVoiceForLanguage(voices, langCode) {
  if (!voices || voices.length === 0) return null;
  const targetCode = (langCode || 'en-US').toLowerCase().replace('_', '-');
  const shortCode = targetCode.split('-')[0];

  // 1. Exact match (e.g. 'es-ES' === 'es-ES')
  const exact = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === targetCode);
  if (exact) return exact;

  // 2. Prefix match (e.g. 'es' matches 'es-MX' or 'es-US')
  const prefix = voices.find((v) => v.lang.toLowerCase().startsWith(shortCode));
  if (prefix) return prefix;

  // 3. Fallback to default voice or first
  return voices.find((v) => v.default) || voices[0];
}
