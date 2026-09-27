import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  Trash2,
  Volume2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Globe,
  Languages,
  ArrowRightLeft,
  Loader2,
  VolumeX,
  Smartphone
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import VoiceControls from './VoiceControls';
import { StorageManager } from './StorageManager';
import { SUPPORTED_LANGUAGES, getLanguageByCode, findBestVoiceForLanguage } from '../languages';
import { detectLanguage, translateText } from '../services/translationService';
import {
  isMobileDevice,
  unlockMobileAudio,
  retainUtterance,
  isSpeechSynthesisSupported
} from '../utils/mobileAudioHelper';

export default function TextToSpeech({
  language,
  onLanguageChange,
  restoredData,
  onSessionSaved,
  onShowToast,
  onSendToStt,
}) {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [status, setStatus] = useState('ready'); // ready, speaking, paused, error
  const [errorMessage, setErrorMessage] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  // Auto-Detect & Translation state
  const [autoDetect, setAutoDetect] = useState(true);
  const [detectedLang, setDetectedLang] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateTargetLang, setTranslateTargetLang] = useState('en-US');

  const utteranceRef = useRef(null);
  const detectTimeoutRef = useRef(null);

  // Initialize SpeechSynthesis and load voices
  useEffect(() => {
    if (!isSpeechSynthesisSupported()) {
      setIsSupported(false);
      setErrorMessage("Speech synthesis is not supported on this browser.");
      return;
    }

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available && available.length > 0) {
        setVoices(available);
      }
    };

    updateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    // Load saved settings
    const savedSettings = StorageManager.getSettings();
    if (savedSettings) {
      if (savedSettings.rate !== undefined) setRate(savedSettings.rate);
      if (savedSettings.pitch !== undefined) setPitch(savedSettings.pitch);
      if (savedSettings.volume !== undefined) setVolume(savedSettings.volume);
      if (savedSettings.ttsVoiceURI) setSelectedVoiceURI(savedSettings.ttsVoiceURI);
      if (savedSettings.autoDetectTts !== undefined) setAutoDetect(savedSettings.autoDetectTts);
    }

    // Unlock mobile audio on any tap inside this component
    const handleTouchUnlock = () => {
      unlockMobileAudio();
    };
    window.addEventListener('touchstart', handleTouchUnlock, { once: true, passive: true });
    window.addEventListener('click', handleTouchUnlock, { once: true, passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchUnlock);
      window.removeEventListener('click', handleTouchUnlock);
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Automatic language understanding for foreign text
  useEffect(() => {
    if (!autoDetect) return;
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 2) {
      setDetectedLang(null);
      setIsDetecting(false);
      return;
    }

    if (detectTimeoutRef.current) {
      clearTimeout(detectTimeoutRef.current);
    }

    setIsDetecting(true);
    detectTimeoutRef.current = setTimeout(async () => {
      try {
        const detected = await detectLanguage(trimmed);
        if (detected) {
          setDetectedLang(detected);
          // If the detected language differs from current language, switch language
          if (detected.code !== language) {
            onLanguageChange(detected.code);
            // Select matching voice for this foreign language
            const match = findBestVoiceForLanguage(voices, detected.code);
            if (match) {
              setSelectedVoiceURI(match.voiceURI);
            }
          }
        }
      } catch (err) {
        console.warn('Detection failed:', err);
      } finally {
        setIsDetecting(false);
      }
    }, 400);

    return () => {
      if (detectTimeoutRef.current) clearTimeout(detectTimeoutRef.current);
    };
  }, [text, autoDetect, voices]);

  // Sync voice selection when language changes
  useEffect(() => {
    if (voices.length === 0) return;
    const activeLang = (detectedLang && autoDetect) ? detectedLang.code : language;
    const match = findBestVoiceForLanguage(voices, activeLang);
    if (match) {
      setSelectedVoiceURI(match.voiceURI);
    }
  }, [language, detectedLang, autoDetect, voices]);

  // Handle restored data from Recents
  useEffect(() => {
    if (!restoredData) return;
    if (restoredData.type === 'tts') {
      if (restoredData.text !== undefined) setText(restoredData.text);
      if (restoredData.language) onLanguageChange(restoredData.language);
      if (restoredData.speed !== undefined) setRate(restoredData.speed);
      if (restoredData.pitch !== undefined) setPitch(restoredData.pitch);
      if (restoredData.volume !== undefined) setVolume(restoredData.volume);
      if (restoredData.voiceName && voices.length > 0) {
        const found = voices.find((v) => v.name === restoredData.voiceName || v.voiceURI === restoredData.voiceName);
        if (found) setSelectedVoiceURI(found.voiceURI);
      }
      onShowToast?.("TTS session restored successfully!", "success");
    }
  }, [restoredData]);

  // Settings changes
  const handleRateChange = (newRate) => {
    setRate(newRate);
    StorageManager.saveSettings({ rate: newRate });
  };

  const handlePitchChange = (newPitch) => {
    setPitch(newPitch);
    StorageManager.saveSettings({ pitch: newPitch });
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    StorageManager.saveSettings({ volume: newVol });
  };

  const handleVoiceChange = (uri) => {
    setSelectedVoiceURI(uri);
    StorageManager.saveSettings({ ttsVoiceURI: uri });
  };

  const handleToggleAutoDetect = () => {
    const nextVal = !autoDetect;
    setAutoDetect(nextVal);
    StorageManager.saveSettings({ autoDetectTts: nextVal });
    if (!nextVal) {
      setDetectedLang(null);
    }
  };

  // Speak logic with Mobile & Cross-device stability
  const handleSpeak = () => {
    if (!isSupported) {
      setErrorMessage("Speech synthesis is not supported on this browser.");
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMessage("Please enter or paste some text before starting Text-to-Speech.");
      onShowToast?.("Please enter some text before speaking.", "warning");
      return;
    }

    setErrorMessage('');

    // Unlock mobile audio explicitly
    unlockMobileAudio();

    try {
      window.speechSynthesis.cancel(); // cancel any pending or stuck audio
    } catch (e) {
      // ignore
    }

    // Determine the active speech language (prioritize detected foreign language if in auto-detect mode)
    const activeLangCode = (autoDetect && detectedLang) ? detectedLang.code : language;

    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = activeLangCode;

    // Resolve voice
    let selectedVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
    if (!selectedVoice || !selectedVoice.lang.toLowerCase().startsWith(activeLangCode.split('-')[0].toLowerCase())) {
      selectedVoice = findBestVoiceForLanguage(voices, activeLangCode);
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang || activeLangCode;
    }

    utterance.onstart = () => {
      setStatus('speaking');
    };

    utterance.onpause = () => {
      setStatus('paused');
    };

    utterance.onresume = () => {
      setStatus('speaking');
    };

    utterance.onend = () => {
      setStatus('ready');
      // Save session to storage
      const session = StorageManager.saveSession({
        type: 'tts',
        text: trimmed,
        language: utterance.lang || activeLangCode,
        voiceName: selectedVoice ? selectedVoice.name : 'System Default',
        speed: rate,
        pitch: pitch,
        volume: volume,
      });
      if (session && onSessionSaved) {
        onSessionSaved();
      }
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') {
        setStatus('ready');
        return;
      }
      console.error('Speech synthesis error:', e);
      setStatus('error');
      setErrorMessage(`Speech synthesis error: ${e.error || 'Check voice permissions'}`);
      onShowToast?.("Speech synthesis encountered an error.", "error");
    };

    // Retain in memory to prevent garbage collection cutoffs on iOS / Android
    retainUtterance(utterance, () => {
      setStatus('ready');
    });

    utteranceRef.current = utterance;

    // Resume queue if paused on mobile
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setStatus('paused');
    }
  };

  const handleResume = () => {
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setStatus('speaking');
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setStatus('ready');
    }
  };

  const handleClear = () => {
    handleStop();
    setText('');
    setErrorMessage('');
    setDetectedLang(null);
  };

  // Quick Translate Text
  const handleTranslateInput = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      onShowToast?.("Please enter text to translate.", "warning");
      return;
    }

    setIsTranslating(true);
    try {
      const currentCode = (autoDetect && detectedLang) ? detectedLang.code : language;
      const targetCode = translateTargetLang;

      const result = await translateText(trimmed, targetCode, currentCode);
      if (result.translatedText) {
        setText(result.translatedText);
        onLanguageChange(targetCode);
        onShowToast?.(`Translated to ${getLanguageByCode(targetCode).name}!`, "success");
      } else {
        onShowToast?.("Could not translate text. Please check connection.", "error");
      }
    } catch (err) {
      console.error('Translation error:', err);
      onShowToast?.("Translation service error.", "error");
    } finally {
      setIsTranslating(false);
    }
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const currentLangObj = getLanguageByCode(language);
  const activeVoiceObj = voices.find((v) => v.voiceURI === selectedVoiceURI);
  const isMobile = isMobileDevice();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all flex flex-col justify-between h-full">
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-sm">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Text to Voice
                </h2>
                {isMobile && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                    <Smartphone className="w-3 h-3" /> Mobile Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type in any language — automatically understands & speaks in that language
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                status === 'speaking'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 animate-pulse'
                  : status === 'paused'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  : status === 'error'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status === 'speaking'
                    ? 'bg-emerald-500'
                    : status === 'paused'
                    ? 'bg-amber-500'
                    : status === 'error'
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`}
              />
              {status === 'speaking'
                ? 'Speaking...'
                : status === 'paused'
                ? 'Paused'
                : status === 'error'
                ? 'Error'
                : 'Ready'}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Auto-Detect Language Intelligence Banner */}
        <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Foreign Language Auto-Detection:
              </span>{' '}
              {isDetecting ? (
                <span className="text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Detecting language...
                </span>
              ) : detectedLang ? (
                <span className="font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-900/60 px-2 py-0.5 rounded-md">
                  {detectedLang.flag} {detectedLang.name} detected — Speaking in {detectedLang.name}
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  Type or paste any foreign language (Spanish, French, Hindi, German, etc.)
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleAutoDetect}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              autoDetect
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {autoDetect ? 'Auto-Detect: ON' : 'Auto-Detect: OFF'}
          </button>
        </div>

        {/* Text Input Area */}
        <div className="mt-3 relative">
          <textarea
            id="tts-text-input"
            rows="5"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="Type or paste text in ANY language (English, Spanish, Hindi, French, German, Japanese, Tamil...)..."
            className="w-full p-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none shadow-inner"
          />

          {/* Counters & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 mt-1.5 px-1">
            <div className="flex items-center gap-3">
              <span>
                Characters: <strong className="text-slate-600 dark:text-slate-300">{charCount}</strong>
              </span>
              <span>
                Words: <strong className="text-slate-600 dark:text-slate-300">{wordCount}</strong>
              </span>
            </div>

            {text && (
              <button
                type="button"
                onClick={handleClear}
                id="tts-clear-btn"
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex items-center gap-1 text-xs font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Text
              </button>
            )}
          </div>
        </div>

        {/* Quick Translation Tool inside TTS */}
        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Translate text before speaking:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={translateTargetLang}
              onChange={(e) => setTranslateTargetLang(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  To {l.flag} {l.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleTranslateInput}
              disabled={isTranslating || !text.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Translate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Language & Voice Controls */}
        <div className="mt-4 space-y-4">
          <LanguageSelector
            id="tts-language-select"
            value={(autoDetect && detectedLang) ? detectedLang.code : language}
            onChange={(code) => {
              setAutoDetect(false);
              setDetectedLang(null);
              onLanguageChange(code);
            }}
            label="Speech Language & Dialect"
            helperText={
              activeVoiceObj
                ? `Voice: ${activeVoiceObj.name} (${activeVoiceObj.lang})`
                : `Voice synthesizes with native ${((autoDetect && detectedLang) ? detectedLang : currentLangObj).name} engine.`
            }
          />

          <VoiceControls
            voices={voices}
            selectedVoiceURI={selectedVoiceURI}
            onVoiceChange={handleVoiceChange}
            rate={rate}
            onRateChange={handleRateChange}
            pitch={pitch}
            onPitchChange={handlePitchChange}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            disabled={status === 'speaking'}
            selectedLanguage={(autoDetect && detectedLang) ? detectedLang.code : language}
          />
        </div>
      </div>

      {/* Main Playback Buttons */}
      <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2.5 items-center">
        {status === 'speaking' ? (
          <>
            <button
              type="button"
              id="tts-pause-btn"
              onClick={handlePause}
              className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
            <button
              type="button"
              id="tts-stop-btn"
              onClick={handleStop}
              className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          </>
        ) : status === 'paused' ? (
          <>
            <button
              type="button"
              id="tts-resume-btn"
              onClick={handleResume}
              className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Play className="w-4 h-4" />
              Resume
            </button>
            <button
              type="button"
              id="tts-stop-btn-paused"
              onClick={handleStop}
              className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          </>
        ) : (
          <button
            type="button"
            id="tts-speak-btn"
            onClick={handleSpeak}
            disabled={!text.trim()}
            className="w-full min-h-[46px] py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            Speak in {((autoDetect && detectedLang) ? detectedLang : currentLangObj).name}
          </button>
        )}
      </div>
    </div>
  );
}
