export interface Node {
  id: string;
  name: string;
  group: string;
  details?: string;
}

export interface Link {
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export interface SuggestedChanges {
    nodes: Node[];
    links: {
        source: string;
        target: string;
        label: string;
    }[];
}

export interface SwarmResponse {
    explanation: string;
    suggestions: SuggestedChanges | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  explanation: string;
  suggestions?: SuggestedChanges | null;
  isMerged?: boolean;
}
