
import React, { useState, useCallback, useMemo } from 'react';
import { GraphVisualization } from './components/GraphVisualization';
import { InputBar } from './components/InputBar';
import { ResponsePanel } from './components/ResponsePanel';
import { LoadingIndicator } from './components/LoadingIndicator';
import { querySwarmConsciousness } from './services/geminiService';
import { initialGraphData } from './data/initialGraphData';
import type { GraphData, Node, Link, SuggestedChanges } from './types';

const App: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>(initialGraphData);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [suggestedChanges, setSuggestedChanges] = useState<SuggestedChanges | null>(null);

  const handleQuerySubmit = useCallback(async (query: string) => {
    setIsLoading(true);
    setAiResponse(null);
    setSuggestedChanges(null);

    try {
      const response = await querySwarmConsciousness(query, graphData);
      setAiResponse(response.explanation);
      if(response.suggestions) {
        setSuggestedChanges(response.suggestions);
      }
    } catch (error) {
      console.error("Error querying Swarm Consciousness:", error);
      setAiResponse(`An error occurred while processing your request. Please check the console for details.`);
    } finally {
      setIsLoading(false);
    }
  }, [graphData]);
  
  const handleMerge = useCallback(() => {
    if (!suggestedChanges) return;

    setGraphData(prevData => {
      const newNodes = [...prevData.nodes];
      const newLinks = [...prevData.links];
      const existingNodeIds = new Set(prevData.nodes.map(n => n.id));

      suggestedChanges.nodes.forEach(newNode => {
        if (!existingNodeIds.has(newNode.id)) {
          newNodes.push(newNode);
          existingNodeIds.add(newNode.id);
        }
      });
      
      const existingLinkIds = new Set(prevData.links.map(l => `${l.source}-${l.target}`));
      suggestedChanges.links.forEach(newLink => {
          const sourceExists = existingNodeIds.has(newLink.source);
          const targetExists = existingNodeIds.has(newLink.target);
          const linkId = `${newLink.source}-${newLink.target}`;
          const reverseLinkId = `${newLink.target}-${newLink.source}`;

          if (sourceExists && targetExists && !existingLinkIds.has(linkId) && !existingLinkIds.has(reverseLinkId)) {
              newLinks.push({source: newLink.source, target: newLink.target, label: newLink.label});
              existingLinkIds.add(linkId);
          }
      });
      
      return { nodes: newNodes, links: newLinks };
    });

    setSuggestedChanges(null); // Clear suggestions after merging
  }, [suggestedChanges]);

  const handleDismiss = useCallback(() => {
    setAiResponse(null);
    setSuggestedChanges(null);
  }, []);
  
  const memoizedGraph = useMemo(() => <GraphVisualization data={graphData} />, [graphData]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {memoizedGraph}
      <div className="absolute top-0 left-0 p-4 sm:p-6 z-10">
        <h1 className="text-2xl sm:text-4xl font-thin tracking-widest text-cyan-200 uppercase" style={{ textShadow: '0 0 8px #00e5ff' }}>
          Project: The Living Archive
        </h1>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col items-center">
        {(isLoading || aiResponse) && (
          <div className="w-full max-w-4xl mb-4">
            {isLoading && <LoadingIndicator />}
            {aiResponse && (
              <ResponsePanel
                response={aiResponse}
                suggestions={suggestedChanges}
                onMerge={handleMerge}
                onDismiss={handleDismiss}
              />
            )}
          </div>
        )}
        {!isLoading && <InputBar onSubmit={handleQuerySubmit} />}
      </div>
    </div>
  );
};

export default App;
