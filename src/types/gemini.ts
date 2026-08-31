export interface GeminiConfig {
  apiKey: string;
  model: 'gemini-2.5-flash' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
  temperature: number;
}

export interface GeminiReasoningResponse {
  executiveSummary: string;
  regionalMorphometryInsights: string[];
  connectomeDysconnectivityFindings: string[];
  xaiModelInterpretation: string;
  differentialConsiderations: string[];
  suggestedFollowUpInvestigations: string[];
  fullMarkdownReport: string;
  rawJson?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}
