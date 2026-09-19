import React from 'react';
import { Languages } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../languages';

export default function LanguageSelector({
  value,
  onChange,
  id = 'language-select',
  label = 'Language',
  helperText,
}) {
  return (
    <div className="flex flex-col space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
        >
          <Languages className="w-3.5 h-3.5 text-indigo-500" />
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-3 py-2 pr-8 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="py-1">
              {lang.flag} {lang.name} ({lang.code})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
