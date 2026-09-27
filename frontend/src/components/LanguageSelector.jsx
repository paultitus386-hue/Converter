import React, { useState } from 'react';
import { Languages, Search } from 'lucide-react';
import { SUPPORTED_LANGUAGES, POPULAR_LANGUAGES, getLanguageByCode } from '../languages';

export default function LanguageSelector({
  value,
  onChange,
  id = 'language-select',
  label = 'Language',
  helperText,
  showPopularChips = true,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const currentLang = getLanguageByCode(value);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      lang.name.toLowerCase().includes(term) ||
      (lang.nativeName && lang.nativeName.toLowerCase().includes(term)) ||
      lang.code.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
          >
            <Languages className="w-3.5 h-3.5 text-indigo-500" />
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <Search className="w-3 h-3" />
          {showSearch ? 'Hide Search' : 'Search Language'}
        </button>
      </div>

      {/* Quick Search Input */}
      {showSearch && (
        <div className="relative animate-fade-in">
          <input
            type="text"
            placeholder="Type to filter languages (e.g. Spanish, Hindi, French)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      )}

      {/* Main Select Dropdown */}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none min-h-[44px] px-3.5 py-2.5 pr-8 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
        >
          {filteredLanguages.map((lang) => (
            <option key={lang.code} value={lang.code} className="py-1">
              {lang.flag} {lang.name} {lang.nativeName ? `(${lang.nativeName})` : ''} - [{lang.code}]
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Quick Language Chips */}
      {showPopularChips && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
            Quick:
          </span>
          {POPULAR_LANGUAGES.slice(0, 7).map((pCode) => {
            const pLang = getLanguageByCode(pCode);
            const isSelected = value === pLang.code;
            return (
              <button
                key={pLang.code}
                type="button"
                onClick={() => onChange(pLang.code)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{pLang.flag}</span>
                <span>{pLang.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
