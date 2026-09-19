import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Copy,
  Check,
  Download,
  Trash2,
  AlertCircle,
  Radio,
  FileText,
  Volume2
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { StorageManager } from './StorageManager';

export default function SpeechToText({
  language,
  onLanguageChange,
  restoredData,
  onSessionSaved,
  onShowToast,
}) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef(null);
  const finalAccumulatorRef = useRef('');

  // Detect SpeechRecognition support
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage(
        "Speech recognition isn't supported by this browser. Please use Chrome, Edge, or a Chromium-based browser for live voice-to-text."
      );
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Handle restored data from Recents
  useEffect(() => {
    if (!restoredData) return;
    if (restoredData.type === 'stt') {
      if (restoredData.transcription) {
        setFinalText(restoredData.transcription);
        finalAccumulatorRef.current = restoredData.transcription;
      }
      if (restoredData.language) {
        onLanguageChange(restoredData.language);
      }
      onShowToast?.("STT session restored successfully!", "success");
    }
  }, [restoredData]);

  // Start / Stop listening
  const startListening = () => {
    if (!isSupported) {
      setErrorMessage(
        "Speech recognition is not supported in this browser. Please try Google Chrome or Microsoft Edge."
      );
      return;
    }

    setErrorMessage('');
    setInterimText('');

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
        onShowToast?.("Listening started. Speak clearly into your microphone.", "info");
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += transcript + ' ';
          } else {
            currentInterim += transcript;
          }
        }

        if (currentFinal) {
          const updated = (finalAccumulatorRef.current + ' ' + currentFinal).trim();
          finalAccumulatorRef.current = updated;
          setFinalText(updated);
        }

        setInterimText(currentInterim);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage(
            "Microphone permission is required to use Speech-to-Text. Please allow microphone access in your browser settings."
          );
          onShowToast?.("Microphone permission denied.", "error");
        } else if (event.error === 'no-speech') {
          // No speech detected, keep waiting or inform
        } else if (event.error === 'network') {
          setErrorMessage("Network error during speech recognition. Ensure you are connected to the internet.");
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
        // If we captured transcribed text, save session to storage
        const currentText = finalAccumulatorRef.current.trim();
        if (currentText) {
          const saved = StorageManager.saveSession({
            type: 'stt',
            transcription: currentText,
            language: language,
          });
          if (saved && onSessionSaved) {
            onSessionSaved();
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setErrorMessage("Could not access speech recognition service.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    setInterimText('');

    const currentText = finalAccumulatorRef.current.trim();
    if (currentText) {
      const saved = StorageManager.saveSession({
        type: 'stt',
        transcription: currentText,
        language: language,
      });
      if (saved && onSessionSaved) {
        onSessionSaved();
      }
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClear = () => {
    if (isListening) stopListening();
    setFinalText('');
    setInterimText('');
    finalAccumulatorRef.current = '';
    setErrorMessage('');
  };

  const handleCopy = async () => {
    if (!finalText) return;
    try {
      await navigator.clipboard.writeText(finalText);
      setCopied(true);
      onShowToast?.("Copied transcription to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      onShowToast?.("Failed to copy text.", "error");
    }
  };

  const handleDownload = () => {
    if (!finalText) return;
    try {
      const element = document.createElement("a");
      const file = new Blob([finalText], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `transcription-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      onShowToast?.("Transcription downloaded as .txt!", "success");
    } catch (e) {
      onShowToast?.("Failed to download text.", "error");
    }
  };

  const wordCount = finalText.trim() ? finalText.trim().split(/\s+/).length : 0;
  const charCount = finalText.length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all flex flex-col justify-between h-full">
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Speech to Text
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live speech recognition with continuous transcription
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isListening
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 animate-pulse'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isListening ? 'bg-rose-500' : 'bg-slate-400'
                }`}
              />
              {isListening ? 'Listening...' : 'Ready'}
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

        {/* Language Selection */}
        <div className="mt-4">
          <LanguageSelector
            id="stt-language-select"
            value={language}
            onChange={onLanguageChange}
            label="Recognition Language"
            helperText="Select the dialect or language you will speak into the microphone."
          />
        </div>

        {/* Big Mic Listening Control */}
        <div className="mt-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/60 dark:from-slate-800/40 dark:to-slate-800/20 border border-slate-200/60 dark:border-slate-800/60 text-center">
          <div className="relative">
            {/* Animated sound ripple waves when listening */}
            {isListening && (
              <>
                <span className="absolute -inset-3 rounded-full bg-purple-500/20 animate-ping" />
                <span className="absolute -inset-6 rounded-full bg-purple-500/10 animate-pulse" />
              </>
            )}

            <button
              type="button"
              id="stt-toggle-mic-btn"
              onClick={handleToggleListening}
              disabled={!isSupported}
              aria-label={isListening ? "Stop listening" : "Start listening"}
              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-95 ${
                isListening
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 ring-4 ring-rose-300/50 dark:ring-rose-800/50'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isListening ? (
                <MicOff className="w-7 h-7" />
              ) : (
                <Mic className="w-7 h-7" />
              )}
            </button>
          </div>

          <span className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isListening ? "Listening... Click to Stop" : "Click to Start Listening"}
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Microphone permission is requested only upon clicking.
          </p>
        </div>

        {/* Live / Interim Transcription display */}
        {isListening && (
          <div className="mt-4 p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/50 animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">
              <Radio className="w-3.5 h-3.5 animate-pulse text-purple-600" />
              Live Interim Words:
            </div>
            <p className="text-sm italic text-purple-900 dark:text-purple-200 min-h-[20px]">
              {interimText || "Listening for speech..."}
            </p>
          </div>
        )}

        {/* Finalized Transcription Display */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              Final Transcription
            </label>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Chars: <strong className="text-slate-600 dark:text-slate-300">{charCount}</strong></span>
              <span>Words: <strong className="text-slate-600 dark:text-slate-300">{wordCount}</strong></span>
            </div>
          </div>

          <div
            id="stt-transcription-box"
            tabIndex={0}
            className="w-full min-h-[110px] max-h-[160px] overflow-y-auto p-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 shadow-inner select-text"
          >
            {finalText ? (
              <p className="whitespace-pre-wrap leading-relaxed">{finalText}</p>
            ) : (
              <p className="text-slate-400 italic">
                Your finalized transcription will appear here as you speak...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 items-center">
        <button
          type="button"
          id="stt-copy-btn"
          onClick={handleCopy}
          disabled={!finalText}
          className="flex-1 min-w-[90px] py-2 px-3 rounded-xl font-medium text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>

        <button
          type="button"
          id="stt-download-btn"
          onClick={handleDownload}
          disabled={!finalText}
          className="flex-1 min-w-[100px] py-2 px-3 rounded-xl font-medium text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
        >
          <Download className="w-3.5 h-3.5" />
          Download TXT
        </button>

        <button
          type="button"
          id="stt-clear-btn"
          onClick={handleClear}
          disabled={!finalText && !interimText}
          className="py-2 px-3 rounded-xl font-medium text-xs border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
    </div>
  );
}
