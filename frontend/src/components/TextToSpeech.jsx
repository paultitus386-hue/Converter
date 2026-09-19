import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Trash2, Volume2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import VoiceControls from './VoiceControls';
import { StorageManager } from './StorageManager';

export default function TextToSpeech({
  language,
  onLanguageChange,
  restoredData,
  onSessionSaved,
  onShowToast,
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

  const utteranceRef = useRef(null);

  // Check speech synthesis support and load voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      setErrorMessage("Speech synthesis is not supported by your browser.");
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
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Sync voice selection when voices list or language changes
  useEffect(() => {
    if (voices.length === 0) return;

    // Check if current selectedVoiceURI still exists and matches
    const currentVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
    const langPrefix = language.split('-')[0].toLowerCase();

    if (!currentVoice || !currentVoice.lang.toLowerCase().startsWith(langPrefix)) {
      // Find a voice that matches current language
      const match = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
                    voices.find((v) => v.default) ||
                    voices[0];
      if (match) {
        setSelectedVoiceURI(match.voiceURI);
      }
    }
  }, [voices, language]);

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

  // Save settings changes
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

  // Speak logic
  const handleSpeak = () => {
    if (!isSupported) {
      setErrorMessage("Speech synthesis isn't supported by this browser.");
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMessage("Please enter some text before starting Text-to-Speech.");
      onShowToast?.("Please enter some text before speaking.", "warning");
      return;
    }

    setErrorMessage('');
    window.speechSynthesis.cancel(); // cancel any active speech

    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const selectedVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = language;
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
      // Save completed session to storage
      const session = StorageManager.saveSession({
        type: 'tts',
        text: trimmed,
        language: utterance.lang || language,
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
      // In some browsers, manual cancel fires an 'interrupted' error which is normal
      if (e.error === 'interrupted' || e.error === 'canceled') {
        setStatus('ready');
        return;
      }
      console.error('Speech synthesis error:', e);
      setStatus('error');
      setErrorMessage("Speech synthesis failed. Please check voice settings or try another voice.");
      onShowToast?.("Speech synthesis encountered an error.", "error");
    };

    utteranceRef.current = utterance;
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
  };

  // Word & character count
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const currentVoiceObj = voices.find((v) => v.voiceURI === selectedVoiceURI);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all flex flex-col justify-between h-full">
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Text to Speech
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Natural voice synthesis from written text
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
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

        {/* Textarea */}
        <div className="mt-4 relative">
          <textarea
            id="tts-text-input"
            rows="5"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="Type or paste your text here..."
            className="w-full p-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none shadow-inner"
          />

          {/* Counters & Clear */}
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5 px-1">
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
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Controls Section */}
        <div className="mt-4 space-y-4">
          <LanguageSelector
            id="tts-language-select"
            value={language}
            onChange={onLanguageChange}
            label="Speech Language"
            helperText={
              currentVoiceObj
                ? `Active voice: ${currentVoiceObj.name}`
                : "No matching voice found for this language in browser."
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
            selectedLanguage={language}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2.5 items-center">
        {status !== 'speaking' && status !== 'paused' ? (
          <button
            type="button"
            id="tts-speak-btn"
            onClick={handleSpeak}
            disabled={!isSupported || !text.trim()}
            className="flex-1 min-w-[120px] py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            Speak
          </button>
        ) : status === 'speaking' ? (
          <button
            type="button"
            id="tts-pause-btn"
            onClick={handlePause}
            className="flex-1 min-w-[120px] py-2.5 px-4 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Pause className="w-4 h-4 fill-white" />
            Pause
          </button>
        ) : (
          <button
            type="button"
            id="tts-resume-btn"
            onClick={handleResume}
            className="flex-1 min-w-[120px] py-2.5 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            Resume
          </button>
        )}

        <button
          type="button"
          id="tts-stop-btn"
          onClick={handleStop}
          disabled={status === 'ready'}
          className="py-2.5 px-4 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Square className="w-4 h-4 fill-current" />
          Stop
        </button>
      </div>
    </div>
  );
}
