import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { Language } from '../lib/i18n';

interface LanguageSelectorFirstTimeProps {
  onSelect: (lang: Language) => void;
}

export default function LanguageSelectorFirstTime({ onSelect }: LanguageSelectorFirstTimeProps) {
  const [selectedLang, setSelectedLang] = useState<Language>('en');

  const handleContinue = () => {
    onSelect(selectedLang);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-950 p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-xl p-8 relative overflow-hidden">
        
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />
        
        {/* Logo Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center border border-blue-100/50 dark:border-blue-800/30">
            <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin-slow" />
          </div>
        </div>

        {/* Branding header */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-black text-zinc-800 dark:text-white uppercase tracking-tight leading-none">
            HUREX GROUP
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 font-medium">
            Choose Your Language / Chagua Lugha Yako
          </p>
        </div>

        {/* Language Options Grid */}
        <div className="space-y-3 mb-8">
          {/* English Option */}
          <button
            onClick={() => setSelectedLang('en')}
            className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
              selectedLang === 'en'
                ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 ring-2 ring-blue-600/10'
                : 'border-zinc-150 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/55 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl leading-none" role="img" aria-label="USA flag">🇺🇸</span>
              <div>
                <p className="font-extrabold text-xs">English</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Use system in English</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
              selectedLang === 'en'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
            }`}>
              {selectedLang === 'en' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>

          {/* Swahili Option */}
          <button
            onClick={() => setSelectedLang('sw')}
            className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
              selectedLang === 'sw'
                ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 ring-2 ring-blue-600/10'
                : 'border-zinc-150 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/55 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl leading-none" role="img" aria-label="Tanzania flag">🇹🇿</span>
              <div>
                <p className="font-extrabold text-xs">Kiswahili</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Tumia mfumo kwa Kiswahili</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
              selectedLang === 'sw'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
            }`}>
              {selectedLang === 'sw' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleContinue}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition duration-250 shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
        >
          {selectedLang === 'en' ? 'Continue' : 'Endelea'}
        </button>

        {/* Security / System disclaimer */}
        <div className="text-center mt-6 text-[9px] text-zinc-400 dark:text-zinc-500 leading-normal">
          HUREX GROUP OF COMPANIES LTD &copy; 2026.
        </div>
      </div>
    </div>
  );
}
