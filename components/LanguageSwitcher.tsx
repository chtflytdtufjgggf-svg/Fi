import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

export const LanguageSwitcher: React.FC = () => {
  const { lang, toggleLang } = useLocalization();

  return (
    <button
      onClick={toggleLang}
      className="px-3 py-1 text-sm bg-gray-900/50 border border-cyan-400/30 rounded-md text-cyan-200 hover:bg-cyan-900/70 transition-colors backdrop-blur-sm"
    >
      {lang === 'en' ? 'العربية' : 'English'}
    </button>
  );
};
