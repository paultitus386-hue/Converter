import React from 'react';
import { Sliders, Volume2, Gauge, Activity } from 'lucide-react';

export default function VoiceControls({
  voices,
  selectedVoiceURI,
  onVoiceChange,
  rate,
  onRateChange,
  pitch,
  onPitchChange,
  volume,
  onVolumeChange,
  disabled = false,
  selectedLanguage,
}) {
  // Filter voices that match the language or show all if none match
  const matchingVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(selectedLanguage.split('-')[0].toLowerCase())
  );

  return (
    <div className="space-y-4 pt-1">
      {/* Voice Selection */}
      <div className="flex flex-col space-y-1.5">
        <div className="flex justify-between items-center">
          <label
            htmlFor="voice-select"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            Voice Selection
          </label>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {matchingVoices.length > 0
              ? `${matchingVoices.length} voice${matchingVoices.length > 1 ? 's' : ''} for selected language`
              : `${voices.length} total system voices`}
          </span>
        </div>

        <div className="relative">
          <select
            id="voice-select"
            value={selectedVoiceURI}
            onChange={(e) => onVoiceChange(e.target.value)}
            disabled={disabled || voices.length === 0}
            className="w-full appearance-none px-3 py-2 pr-8 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {voices.length === 0 ? (
              <option value="">No voices available</option>
            ) : (
              <>
                {matchingVoices.length > 0 && (
                  <optgroup label="Matching Selected Language">
                    {matchingVoices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang}) {voice.default ? '— Default' : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="All Available System Voices">
                  {voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </optgroup>
              </>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Speed / Rate */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-indigo-500" />
              Speed
            </span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {rate.toFixed(1)}x
            </span>
          </div>
          <input
            id="tts-speed-slider"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={rate}
            onChange={(e) => onRateChange(parseFloat(e.target.value))}
            disabled={disabled}
            aria-label="Speech Speed"
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
        </div>

        {/* Pitch */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-purple-500" />
              Pitch
            </span>
            <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
              {pitch.toFixed(1)}
            </span>
          </div>
          <input
            id="tts-pitch-slider"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={pitch}
            onChange={(e) => onPitchChange(parseFloat(e.target.value))}
            disabled={disabled}
            aria-label="Speech Pitch"
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>0.5</span>
            <span>1.0</span>
            <span>2.0</span>
          </div>
        </div>

        {/* Volume */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
              Volume
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <input
            id="tts-volume-slider"
            type="range"
            min="0"
            max="1.0"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            disabled={disabled}
            aria-label="Speech Volume"
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
