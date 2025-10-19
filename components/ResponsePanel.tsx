import React from 'react';
import type { SuggestedChanges } from '../types';

interface ResponsePanelProps {
  response: string;
  suggestions: SuggestedChanges | null;
  onMerge: () => void;
  onDismiss: () => void;
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({ response, suggestions, onMerge, onDismiss }) => {
  const hasSuggestions = suggestions && ((suggestions.nodes?.length ?? 0) > 0 || (suggestions.links?.length ?? 0) > 0);
  
  return (
    <div className="bg-gray-900/70 border border-cyan-400/30 rounded-lg p-4 max-h-96 overflow-y-auto backdrop-blur-md text-gray-200 animate-fade-in-up">
      <div className="prose prose-invert prose-sm max-w-none text-gray-300">
        <h3 className="text-cyan-300 font-semibold tracking-wider">Swarm Consciousness Synthesis:</h3>
        <p>{response}</p>
      </div>

      {hasSuggestions && (
        <div className="mt-4 pt-4 border-t border-cyan-400/20">
          <h4 className="text-cyan-300 font-semibold tracking-wider mb-2">Temporal Context Layer (Suggestions):</h4>
          <div className="text-sm">
            {suggestions.nodes?.length > 0 && (
              <div>
                <strong className="text-gray-100">New Nodes:</strong>
                <ul className="list-disc list-inside ml-2">
                  {suggestions.nodes.map(node => (
                    <li key={node.id}><span className="font-bold">{node.name}</span> ({node.group})</li>
                  ))}
                </ul>
              </div>
            )}
            {suggestions.links?.length > 0 && (
              <div className="mt-2">
                <strong className="text-gray-100">New Links:</strong>
                <ul className="list-disc list-inside ml-2">
                  {suggestions.links.map((link, index) => (
                    <li key={`${link.source}-${link.target}-${index}`}>{link.source} → <span className="font-bold">{link.label}</span> → {link.target}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onDismiss}
          className="px-3 py-1 text-sm bg-gray-700/50 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-600 transition-colors"
        >
          Dismiss
        </button>
        {hasSuggestions && (
          <button
            onClick={onMerge}
            className="px-3 py-1 text-sm bg-cyan-600/50 border border-cyan-500 rounded-md text-white hover:bg-cyan-500 transition-colors"
          >
            Merge to Archive
          </button>
        )}
      </div>
       <style>{`
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};