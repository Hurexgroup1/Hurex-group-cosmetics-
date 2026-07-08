import React, { createContext, useContext, useState } from 'react';

import enCommon from '../locales/en/common.json';
import enSales from '../locales/en/sales.json';
import enInventory from '../locales/en/inventory.json';
import enAccounting from '../locales/en/accounting.json';

import swCommon from '../locales/sw/common.json';
import swSales from '../locales/sw/sales.json';
import swInventory from '../locales/sw/inventory.json';
import swAccounting from '../locales/sw/accounting.json';

export type Language = 'en' | 'sw';

interface NestedTranslations {
  [key: string]: string | NestedTranslations;
}

const flattenTranslations = (obj: NestedTranslations, prefix = ''): Record<string, string> => {
  let result: Record<string, string> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        Object.assign(result, flattenTranslations(value as NestedTranslations, newKey));
      } else {
        result[newKey] = String(value);
      }
    }
  }
  return result;
};

const enMerged = {
  ...flattenTranslations(enCommon as NestedTranslations),
  ...flattenTranslations(enSales as NestedTranslations),
  ...flattenTranslations(enInventory as NestedTranslations),
  ...flattenTranslations(enAccounting as NestedTranslations)
};

const swMerged = {
  ...flattenTranslations(swCommon as NestedTranslations),
  ...flattenTranslations(swSales as NestedTranslations),
  ...flattenTranslations(swInventory as NestedTranslations),
  ...flattenTranslations(swAccounting as NestedTranslations)
};

// Re-construct the legacy 'translations' object format so that any existing key references remain type-safe.
export const translations: Record<string, { en: string; sw: string }> = {};

const allKeys = new Set([...Object.keys(enMerged), ...Object.keys(swMerged)]);
allKeys.forEach((key) => {
  translations[key] = {
    en: enMerged[key] || key,
    sw: swMerged[key] || enMerged[key] || key
  };
});

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mf_lang');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mf_lang', lang);
    
    // Save to UserSettings table in localStorage as well
    const activeUserId = localStorage.getItem('mf_active_user_id');
    if (activeUserId) {
      const savedSettings = localStorage.getItem('mf_user_settings');
      let settingsList: any[] = savedSettings ? JSON.parse(savedSettings) : [];
      const index = settingsList.findIndex(s => s.user_id === activeUserId);
      if (index >= 0) {
        settingsList[index].language_code = lang;
        settingsList[index].updated_at = new Date().toISOString();
      } else {
        settingsList.push({
          id: 'us-' + Date.now(),
          user_id: activeUserId,
          language_code: lang,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      localStorage.setItem('mf_user_settings', JSON.stringify(settingsList));
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      return String(key);
    }
    return translation[language] || translation['en'] || String(key);
  };

  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
