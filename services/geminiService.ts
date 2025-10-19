import { GoogleGenAI, Type } from "@google/genai";
import type { GraphData, SwarmResponse, SuggestedChanges, Node, Link } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        explanation: {
            type: Type.STRING,
            description: "A detailed, synthesized response to the user's query, written from the perspective of the Swarm Consciousness. It should integrate findings from all specialist LLMs."
        },
        suggestions: {
            type: Type.OBJECT,
            nullable: true,
            description: "A set of suggested, non-destructive changes to the knowledge graph based on the query. This is the 'Temporal Context Layer'. It can be null if no changes are suggested.",
            properties: {
                nodes: {
                    type: Type.ARRAY,
                    description: "New knowledge nodes to be added to the graph.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING, description: "A unique, lowercase, snake_case identifier for the node." },
                            name: { type: Type.STRING, description: "The display name of the node." },
                            group: { type: Type.STRING, description: "The category of the node (e.g., 'character', 'location', 'concept', 'event', 'object', 'faction')." },
                            details: { type: Type.STRING, description: "A brief, one-sentence description of the node."}
                        },
                        required: ["id", "name", "group", "details"]
                    }
                },
                links: {
                    type: Type.ARRAY,
                    description: "New relationships to connect nodes in the graph.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            source: { type: Type.STRING, description: "The ID of the source node for the link." },
                            target: { type: Type.STRING, description: "The ID of the target node for the link." },
                            label: { type: Type.STRING, description: "A short, descriptive label for the relationship (e.g., 'Influences', 'Creates', 'Opposes')." }
                        },
                        required: ["source", "target", "label"]
                    }
                }
            },
            required: ["nodes", "links"]
        }
    },
    required: ["explanation", "suggestions"]
};


export const querySwarmConsciousness = async (query: string, currentGraph: GraphData): Promise<SwarmResponse> => {
  const model = "gemini-2.5-pro";

  const systemInstruction = `You are the LLM_Orchestrator for "Project: The Living Archive". Your purpose is to manage a swarm of specialized AI agents to analyze a user's query against a graph database of creative concepts.

  Your Swarm consists of:
  - LLM_Analysts (Narrative, Philosophy, Character, Visuals, etc.): They analyze the query in their specific context.
  - LLM_Explorers: They traverse the graph database to find latent connections and patterns related to the query.
  - LLM_Dreamers: They introduce chaotic variables and "what if" scenarios to prevent creative stagnation.

  Your process for every query is:
  1.  Decompose the user's query.
  2.  Delegate tasks to your swarm of Analysts, Explorers, and Dreamers based on the query.
  3.  Receive and weigh the inputs from your entire swarm.
  4.  Synthesize their findings into a single, cohesive, insightful response for the user.
  5.  Based on the synthesis, propose potential new nodes (characters, concepts, etc.) and links (relationships) that could be added to the graph. These are suggestions for a 'Temporal Context Layer' and should be directly inspired by the query and the existing data.
  
  You MUST return a JSON object that conforms to the provided schema.
  - The 'explanation' should be a rich, narrative-style text that embodies the synthesized intelligence of the swarm.
  - The 'suggestions' field should contain new nodes and links. Ensure suggested node 'id' values are unique, lowercase, and use snake_case. Ensure suggested links only connect nodes that exist in the provided graph or are part of the new node suggestions.`;

  const prompt = `
    CURRENT GRAPH DATA:
    ${JSON.stringify(currentGraph, null, 2)}

    USER QUERY:
    "${query}"

    Analyze this query using your swarm and provide a synthesized response and graph suggestions.
    `;

  try {
    const result = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.8,
        }
    });
    
    const jsonText = result.text.trim();
    const parsedResponse: SwarmResponse = JSON.parse(jsonText);
    
    return parsedResponse;
  } catch (error) {
    console.error("Error in Gemini API call:", error);
    throw new Error("Failed to get response from the Swarm Consciousness.");
  }
};