import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { GraphVisualization } from './components/GraphVisualization';
import { ChatPanel } from './components/ChatPanel';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { responseSchema } from './services/geminiService';
import { useLocalization } from './hooks/useLocalization';
import { initialGraphData } from './data/initialGraphData';
import type { GraphData, SwarmResponse, ChatMessage } from './types';

const App: React.FC = () => {
  const { t } = useLocalization();

  const getInitialGraphData = (): GraphData => {
    const savedGraph = localStorage.getItem('graphData');
    return savedGraph ? JSON.parse(savedGraph) : initialGraphData;
  };

  const getInitialChatHistory = (): ChatMessage[] => {
    const savedChat = localStorage.getItem('chatHistory');
    return savedChat ? JSON.parse(savedChat) : [];
  };

  const [graphData, setGraphData] = useState<GraphData>(getInitialGraphData);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(getInitialChatHistory);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    localStorage.setItem('graphData', JSON.stringify(graphData));
  }, [graphData]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleQuerySubmit = useCallback(async (query: string) => {
    setIsLoading(true);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      explanation: query,
    };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are the LLM_Orchestrator for "Project: The Living Archive". Your purpose is to manage a swarm of specialized AI agents to analyze a user's query against a graph database of creative concepts. Your process for every query is: 1. Decompose the user's query. 2. Delegate tasks to your swarm of Analysts, Explorers, and Dreamers. 3. Receive and weigh their inputs. 4. Synthesize their findings into a single, cohesive, insightful response. 5. Propose potential new nodes (characters, concepts, etc.) and links (relationships) to add to the graph. These are suggestions for a 'Temporal Context Layer'. You MUST return a JSON object that conforms to the provided schema. The 'explanation' should be a rich, narrative-style text embodying the swarm's intelligence. The 'suggestions' field should contain new nodes and links. Ensure suggested node 'id' values are unique, lowercase, and snake_case, and that links only connect existing or newly suggested nodes.`;

      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
            model: "gemini-2.5-pro",
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
            }
        });
      }

      const prompt = `CURRENT GRAPH DATA: ${JSON.stringify(graphData, null, 2)}\n\nUSER QUERY: "${query}"`;
      const resultStream = await chatRef.current.sendMessageStream({ message: prompt });

      let aggregatedResponse: SwarmResponse = { explanation: "", suggestions: null };
      let accumulatedText = "";
      const modelMessageId = (Date.now() + 1).toString();

      // Add a placeholder for the model's response
      setChatHistory(prev => [
        ...prev,
        { id: modelMessageId, role: 'model', explanation: '...' }
      ]);
      
      for await (const chunk of resultStream) {
        accumulatedText += chunk.text;
        try {
          // Clean the text: remove markdown fences and trim
          let cleanText = accumulatedText.trim();
          if (cleanText.startsWith("```json")) {
            cleanText = cleanText.substring(7);
          }
          if (cleanText.endsWith("```")) {
            cleanText = cleanText.substring(0, cleanText.length - 3);
          }
          cleanText = cleanText.trim();

          // Attempt to parse the accumulating text as JSON
          const parsed = JSON.parse(cleanText);
          aggregatedResponse = parsed;
          // Update the streaming message in real-time
          setChatHistory(prev => prev.map(msg => 
            msg.id === modelMessageId ? { ...msg, explanation: parsed.explanation, suggestions: parsed.suggestions } : msg
          ));
        } catch (e) {
          // JSON is not yet complete, continue accumulating
        }
      }
      
      // Final update with the complete response
      setChatHistory(prev => prev.map(msg => 
        msg.id === modelMessageId ? { ...msg, explanation: aggregatedResponse.explanation, suggestions: aggregatedResponse.suggestions, isMerged: false } : msg
      ));

    } catch (error) {
      console.error("Error querying Swarm Consciousness:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        explanation: `An error occurred. Please check the console for details.`
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [graphData]);

  const handleMerge = useCallback((messageId: string) => {
    const message = chatHistory.find(m => m.id === messageId);
    const suggestedChanges = message?.suggestions;
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

    setChatHistory(prev => prev.map(msg => msg.id === messageId ? { ...msg, isMerged: true } : msg));
  }, [chatHistory]);
  
  const handleClearChat = useCallback(() => {
    setChatHistory([]);
    chatRef.current = null; // Reset the chat session
  }, []);

  const memoizedGraph = useMemo(() => <GraphVisualization data={graphData} />, [graphData]);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {memoizedGraph}
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-10 flex justify-between items-center">
        <h1 className="text-2xl sm:text-4xl font-thin tracking-widest text-cyan-200 uppercase" style={{ textShadow: '0 0 8px #00e5ff' }}>
          {t('title')}
        </h1>
        <LanguageSwitcher />
      </header>
      
      <ChatPanel
        messages={chatHistory}
        isLoading={isLoading}
        onSubmit={handleQuerySubmit}
        onMerge={handleMerge}
        onClear={handleClearChat}
      />
    </div>
  );
};

export default App;