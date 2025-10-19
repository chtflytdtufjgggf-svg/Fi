
import React, { useState, useEffect } from 'react';

const swarmPhases = [
  "Decomposing query for LLM_Orchestrator...",
  "Delegating to LLM_Analysts...",
  "LLM_Explorers traversing knowledge graph...",
  "Identifying latent patterns and connections...",
  "Consulting LLM_Dreamers for chaotic variables...",
  "Synthesizing swarm inputs...",
  "Compiling temporal context layer...",
];

export const LoadingIndicator: React.FC = () => {
  const [phase, setPhase] = useState(swarmPhases[0]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % swarmPhases.length;
      setPhase(swarmPhases[index]);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900/70 border border-cyan-400/30 rounded-lg p-4 backdrop-blur-md flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyan-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="text-cyan-200 transition-all duration-300">{phase}</span>
    </div>
  );
};
