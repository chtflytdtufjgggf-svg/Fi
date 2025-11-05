import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface InputBarProps {
  onSubmit: (query: string) => void;
  disabled?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onSubmit, disabled }) => {
  const [query, setQuery] = useState('');
  const { t, lang } = useLocalization();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSubmit(query.trim());
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('inputPlaceholder')}
          disabled={disabled}
          className="w-full pl-4 pr-12 py-3 bg-gray-900/50 border border-cyan-400/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 backdrop-blur-sm disabled:opacity-50"
          style={{ textShadow: '0 0 5px #00e5ff' }}
        />
        <button
          type="submit"
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t('submitQuery')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${lang === 'ar' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 12h14" />
          </svg>
        </button>
      </div>
    </form>
  );
};
