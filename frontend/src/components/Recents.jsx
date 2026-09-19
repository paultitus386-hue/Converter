import React, { useState } from 'react';
import {
  History,
  Volume2,
  Mic,
  RotateCcw,
  Trash2,
  Sparkles,
  AlertTriangle,
  Clock,
  Globe
} from 'lucide-react';
import { StorageManager } from './StorageManager';

export default function Recents({
  sessions,
  onRestore,
  onRefresh,
  onShowToast,
}) {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    const success = StorageManager.deleteSession(id);
    if (success) {
      onRefresh();
      onShowToast?.("Session deleted.", "info");
    }
  };

  const handleClearAll = () => {
    const success = StorageManager.clearAllSessions();
    if (success) {
      setShowConfirmClear(false);
      onRefresh();
      onShowToast?.("All stored sessions cleared.", "info");
    }
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (isToday) {
        return `Today, ${timeStr}`;
      }
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-all flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Recents & Storage
              {sessions.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {sessions.length}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Locally preserved voice conversions
            </p>
          </div>
        </div>

        {sessions.length > 0 && (
          <button
            type="button"
            id="recents-clear-all-btn"
            onClick={() => setShowConfirmClear(true)}
            className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Confirmation Modal / Bar */}
      {showConfirmClear && (
        <div className="my-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-200 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Clear all stored sessions?
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="confirm-clear-yes"
              onClick={handleClearAll}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
            >
              Yes, Clear
            </button>
            <button
              type="button"
              id="confirm-clear-no"
              onClick={() => setShowConfirmClear(false)}
              className="px-2.5 py-1 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="mt-4 flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-1">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <History className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No recent sessions yet.
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
              Your previous voice conversions will appear here automatically.
            </p>
          </div>
        ) : (
          sessions.map((sess) => {
            const isTTS = sess.type === 'tts';
            const previewText = isTTS ? sess.text : sess.transcription;

            return (
              <div
                key={sess.id}
                className="group relative p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-200 cursor-pointer"
                onClick={() => onRestore(sess)}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Type Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        isTTS
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      }`}
                    >
                      {isTTS ? (
                        <>
                          <Volume2 className="w-3 h-3" />
                          Text → Speech
                        </>
                      ) : (
                        <>
                          <Mic className="w-3 h-3" />
                          Speech → Text
                        </>
                      )}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {sess.language || 'en-US'}
                    </span>
                  </div>

                  {/* Date */}
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {formatDate(sess.timestamp)}
                  </span>
                </div>

                {/* Content Preview */}
                <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed">
                  "{previewText}"
                </p>

                {/* Metadata Details for TTS */}
                {isTTS && sess.voiceName && (
                  <p className="mt-1 text-[10px] text-slate-400">
                    Voice: {sess.voiceName} • {sess.speed}x • Pitch {sess.pitch}
                  </p>
                )}

                {/* Actions Hover Bar */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:underline">
                    <RotateCcw className="w-3 h-3" />
                    Restore Session
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteSession(sess.id, e)}
                    aria-label="Delete session"
                    className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
