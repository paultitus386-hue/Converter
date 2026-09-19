const SESSIONS_STORAGE_KEY = 'voice_converter_sessions';
const SETTINGS_STORAGE_KEY = 'voice_converter_settings';
const THEME_STORAGE_KEY = 'voice_converter_theme';
const MAX_SESSIONS = 20;

export const StorageManager = {
  getSessions: () => {
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.slice(0, MAX_SESSIONS);
    } catch (e) {
      console.warn('Failed to read sessions from localStorage (possibly corrupted):', e);
      return [];
    }
  },

  saveSession: (sessionData) => {
    try {
      const sessions = StorageManager.getSessions();
      const newSession = {
        id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString(),
        ...sessionData,
      };

      // Avoid immediate identical duplicates
      const isDuplicate = sessions.length > 0 && 
        sessions[0].type === newSession.type &&
        ((newSession.type === 'tts' && sessions[0].text === newSession.text && sessions[0].language === newSession.language) ||
         (newSession.type === 'stt' && sessions[0].transcription === newSession.transcription && sessions[0].language === newSession.language));

      if (isDuplicate) {
        return sessions[0];
      }

      const updated = [newSession, ...sessions].slice(0, MAX_SESSIONS);
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
      return newSession;
    } catch (e) {
      console.warn('Failed to save session to localStorage:', e);
      return null;
    }
  },

  deleteSession: (id) => {
    try {
      const sessions = StorageManager.getSessions();
      const updated = sessions.filter((s) => s.id !== id);
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.warn('Failed to delete session from localStorage:', e);
      return false;
    }
  },

  clearAllSessions: () => {
    try {
      localStorage.removeItem(SESSIONS_STORAGE_KEY);
      return true;
    } catch (e) {
      console.warn('Failed to clear sessions from localStorage:', e);
      return false;
    }
  },

  getSettings: () => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to read settings from localStorage:', e);
      return null;
    }
  },

  saveSettings: (settings) => {
    try {
      const existing = StorageManager.getSettings() || {};
      const updated = { ...existing, ...settings };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
    }
  },

  getTheme: () => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    } catch (e) {
      return 'light';
    }
  },

  saveTheme: (theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  }
};
