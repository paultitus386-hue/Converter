import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TextToSpeech from './components/TextToSpeech';
import SpeechToText from './components/SpeechToText';
import Recents from './components/Recents';
import { StorageManager } from './components/StorageManager';
import {
  Volume2,
  Mic,
  History,
  LayoutGrid,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Layers
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState(() => StorageManager.getTheme());
  const [activeSection, setActiveSection] = useState('tts'); // 'tts', 'stt', 'recents'
  const [viewMode, setViewMode] = useState('focused'); // 'focused' or 'all'
  const [ttsLanguage, setTtsLanguage] = useState(() => {
    const s = StorageManager.getSettings();
    return (s && s.ttsLanguage) || 'en-US';
  });
  const [sttLanguage, setSttLanguage] = useState(() => {
    const s = StorageManager.getSettings();
    return (s && s.sttLanguage) || 'en-US';
  });
  const [sessions, setSessions] = useState([]);
  const [restoredData, setRestoredData] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    StorageManager.saveTheme(theme);
  }, [theme]);

  const loadSessions = () => {
    const loaded = StorageManager.getSessions();
    setSessions(loaded);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleTtsLanguageChange = (lang) => {
    setTtsLanguage(lang);
    StorageManager.saveSettings({ ttsLanguage: lang });
  };

  const handleSttLanguageChange = (lang) => {
    setSttLanguage(lang);
    StorageManager.saveSettings({ sttLanguage: lang });
  };

  const handleRestoreSession = (session) => {
    setRestoredData(session);
    if (session.type === 'tts') {
      setActiveSection('tts');
    } else {
      setActiveSection('stt');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#0a0f1d] text-slate-800 dark:text-slate-100 transition-colors duration-200 antialiased font-sans">
      <Header theme={theme} onToggleTheme={handleToggleTheme} />

      {/* Sub-header Navigation Bar */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          
          {/* Section Selector Tabs */}
          <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 shadow-inner">
            <button
              type="button"
              id="tab-btn-tts"
              onClick={() => setActiveSection('tts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeSection === 'tts'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>1. Text to Voice</span>
            </button>

            <button
              type="button"
              id="tab-btn-stt"
              onClick={() => setActiveSection('stt')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeSection === 'stt'
                  ? 'bg-white dark:bg-emerald-600 text-emerald-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>2. Voice to Text</span>
            </button>

            <button
              type="button"
              id="tab-btn-recents"
              onClick={() => setActiveSection('recents')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeSection === 'recents'
                  ? 'bg-white dark:bg-amber-600 text-amber-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>3. Recents & Storage</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                {sessions.length}
              </span>
            </button>
          </div>

          {/* View Mode Toggle: Focused vs All Sections */}
          <button
            type="button"
            onClick={() => setViewMode(prev => prev === 'focused' ? 'all' : 'focused')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            {viewMode === 'focused' ? (
              <>
                <LayoutGrid className="w-4 h-4 text-indigo-500" />
                <span>View All 3 Sections</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Focus Active Section</span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Toast Notification Banner */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 max-w-md px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 transition-all duration-300 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-950/95 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-50/95 dark:bg-rose-950/95 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-50/95 dark:bg-amber-950/95 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-indigo-50/95 dark:bg-indigo-950/95 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0 text-indigo-500" />}
            <span className="text-xs font-semibold flex-1">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic Layout: Either 3 separate dedicated views OR full dashboard */}
        {viewMode === 'focused' ? (
          <div className="max-w-4xl mx-auto">
            {activeSection === 'tts' && (
              <div className="animate-fade-in">
                <TextToSpeech
                  language={ttsLanguage}
                  onLanguageChange={handleTtsLanguageChange}
                  restoredData={restoredData}
                  onSessionSaved={loadSessions}
                  onShowToast={showToast}
                />
              </div>
            )}

            {activeSection === 'stt' && (
              <div className="animate-fade-in">
                <SpeechToText
                  language={sttLanguage}
                  onLanguageChange={handleSttLanguageChange}
                  restoredData={restoredData}
                  onSessionSaved={loadSessions}
                  onShowToast={showToast}
                />
              </div>
            )}

            {activeSection === 'recents' && (
              <div className="animate-fade-in">
                <Recents
                  sessions={sessions}
                  onRestore={handleRestoreSession}
                  onRefresh={loadSessions}
                  onShowToast={showToast}
                />
              </div>
            )}
          </div>
        ) : (
          /* All 3 Sections Displayed Together */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 h-full">
              <TextToSpeech
                language={ttsLanguage}
                onLanguageChange={handleTtsLanguageChange}
                restoredData={restoredData}
                onSessionSaved={loadSessions}
                onShowToast={showToast}
              />
            </div>
            <div className="lg:col-span-4 h-full">
              <SpeechToText
                language={sttLanguage}
                onLanguageChange={handleSttLanguageChange}
                restoredData={restoredData}
                onSessionSaved={loadSessions}
                onShowToast={showToast}
              />
            </div>
            <div className="lg:col-span-4 h-full">
              <Recents
                sessions={sessions}
                onRestore={handleRestoreSession}
                onRefresh={loadSessions}
                onShowToast={showToast}
              />
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-400">
        <p>Voice Converter • Section 1: Text to Voice | Section 2: Voice to Text | Section 3: Recents & Storage</p>
      </footer>
    </div>
  );
}
