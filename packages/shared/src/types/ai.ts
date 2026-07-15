export enum AIProvider {
  OPENAI = "openai",
  LLAMA = "llama",
  CLAUDE = "claude",
  GEMINI = "gemini",
  CUSTOM = "custom",
}

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
  customHeaders: Record<string, string>;
}

export interface AIPrompt {
  system: string;
  user: string;
  template: string;
  variables: Record<string, string>;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider;
  tokensUsed: AIUsage;
  finishReason: string;
  duration: number;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIVulnerabilityExplanation {
  vulnerabilityId: string;
  title: string;
  plainEnglish: string;
  exploitScenario: string;
  impact: string;
  remediation: string;
  secureExample: string;
  confidence: number;
}

export interface AIFixSuggestion {
  vulnerabilityId: string;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  tradeoffs: string[];
  bestPractices: string[];
}

export interface AISummary {
  auditId: string;
  executiveSummary: string;
  riskAssessment: string;
  keyFindings: string[];
  overallScore: number;
  recommendations: string[];
}

export interface AIInsights {
  summary: AISummary;
  vulnerabilityExplanations: AIVulnerabilityExplanation[];
  fixSuggestions: AIFixSuggestion[];
}
