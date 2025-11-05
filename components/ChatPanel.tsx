import React, { useEffect, useRef } from 'react';
import { InputBar } from './InputBar';
import { LoadingIndicator } from './LoadingIndicator';
import { useLocalization } from '../hooks/useLocalization';
import type { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSubmit: (query: string) => void;
  onMerge: (messageId: string) => void;
  onClear: () => void;
}

const ModelResponseMessage: React.FC<{ message: ChatMessage; onMerge: (id: string) => void; }> = ({ message, onMerge }) => {
  const { t } = useLocalization();
  const hasSuggestions = message.suggestions && ((message.suggestions.nodes?.length ?? 0) > 0 || (message.suggestions.links?.length ?? 0) > 0);

  return (
    <div className="bg-gray-900/70 border border-cyan-400/30 rounded-lg p-4 backdrop-blur-md text-gray-200 animate-fade-in">
      <div className="prose prose-invert prose-sm max-w-none text-gray-300">
        <h3 className="text-cyan-300 font-semibold tracking-wider">{t('synthesisTitle')}</h3>
        <p>{message.explanation}</p>
      </div>

      {hasSuggestions && (
        <div className="mt-4 pt-4 border-t border-cyan-400/20">
          <h4 className="text-cyan-300 font-semibold tracking-wider mb-2">{t('suggestionsTitle')}</h4>
          <div className="text-sm">
            {message.suggestions.nodes?.length > 0 && (
              <div>
                <strong className="text-gray-100">{t('newNodes')}</strong>
                <ul className="list-disc list-inside">
                  {message.suggestions.nodes.map(node => (
                    <li key={node.id}><span className="font-bold">{node.name}</span> ({node.group})</li>
                  ))}
                </ul>
              </div>
            )}
            {message.suggestions.links?.length > 0 && (
              <div className="mt-2">
                <strong className="text-gray-100">{t('newLinks')}</strong>
                <ul className="list-disc list-inside">
                  {message.suggestions.links.map((link, index) => (
                    <li key={`${link.source}-${link.target}-${index}`}>{link.source} → <span className="font-bold">{link.label}</span> → {link.target}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {hasSuggestions && (
         <div className="flex justify-end mt-4">
            <button
              onClick={() => onMerge(message.id)}
              disabled={message.isMerged}
              className="px-3 py-1 text-sm bg-cyan-600/50 border border-cyan-500 rounded-md text-white hover:bg-cyan-500 transition-colors disabled:bg-gray-600 disabled:border-gray-500 disabled:cursor-not-allowed"
            >
              {message.isMerged ? t('merged') : t('merge')}
            </button>
        </div>
      )}
      <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
};


export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading, onSubmit, onMerge, onClear }) => {
  const { t } = useLocalization();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  return (
    <div className="absolute top-0 right-0 bottom-0 w-full max-w-md md:max-w-lg lg:max-w-xl p-4 z-10 flex flex-col h-full">
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-4 pt-24 pb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'user' ? (
              <p className="max-w-[80%] bg-cyan-900/50 rounded-lg px-4 py-2 text-white self-end">{msg.explanation}</p>
            ) : (
              <div className="max-w-[95%]">
                <ModelResponseMessage message={msg} onMerge={onMerge} />
              </div>
            )}
          </div>
        ))}
         <div ref={messagesEndRef} />
      </div>

      <div className="w-full flex-shrink-0 mt-2">
        {isLoading && <div className="mb-4"><LoadingIndicator /></div>}
        <div className="flex items-center space-x-2">
            <div className="flex-grow">
                <InputBar onSubmit={onSubmit} disabled={isLoading} />
            </div>
            {messages.length > 0 && (
                <button
                    onClick={onClear}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title={t('clearChat')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
