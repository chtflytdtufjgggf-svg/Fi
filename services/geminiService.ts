import { Type } from "@google/genai";

export const responseSchema = {
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
