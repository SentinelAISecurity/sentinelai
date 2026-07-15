import { AIProvider } from "@sentinelai/shared";
import type {
  AIConfig,
  AIResponse,
  AIPrompt,
  AIVulnerabilityExplanation,
  AIFixSuggestion,
  AISummary,
  Vulnerability,
} from "@sentinelai/shared";

export class AIEngine {
  private config: AIConfig;
  private provider: AIProvider;

  constructor(config: Partial<AIConfig> = {}) {
    this.config = {
      provider: AIProvider.OPENAI,
      apiKey: process.env.OPENAI_API_KEY ?? "",
      model: "gpt-4-turbo-preview",
      baseUrl: "https://api.openai.com/v1",
      maxTokens: 4096,
      temperature: 0.3,
      topP: 0.9,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      systemPrompt: "You are a senior smart contract security auditor. You specialize in Soroban (Rust) Stellar smart contract security analysis, vulnerability detection, and secure code remediation.",
      customHeaders: {},
      ...config,
    };
    this.provider = this.config.provider;
  }

  async explainVulnerability(
    vulnerability: Vulnerability,
  ): Promise<AIVulnerabilityExplanation> {
    const prompt = this.buildPrompt("explain_vulnerability", {
      title: vulnerability.title,
      description: vulnerability.description,
      severity: vulnerability.severity,
      category: vulnerability.category,
      code: vulnerability.vulnerableCode,
      fileName: vulnerability.fileName,
    });

    const response = await this.call(prompt);

    return {
      vulnerabilityId: vulnerability.id,
      title: vulnerability.title,
      plainEnglish: this.extractSection(response.content, "PLAIN_ENGLISH") ?? response.content,
      exploitScenario: this.extractSection(response.content, "EXPLOIT_SCENARIO") ?? "",
      impact: this.extractSection(response.content, "IMPACT") ?? "",
      remediation: this.extractSection(response.content, "REMEDIATION") ?? "",
      secureExample: this.extractSection(response.content, "SECURE_EXAMPLE") ?? "",
      confidence: 0.9,
    };
  }

  async suggestFix(vulnerability: Vulnerability): Promise<AIFixSuggestion> {
    const prompt = this.buildPrompt("suggest_fix", {
      title: vulnerability.title,
      description: vulnerability.description,
      code: vulnerability.vulnerableCode,
      category: vulnerability.category,
    });

    const response = await this.call(prompt);

    return {
      vulnerabilityId: vulnerability.id,
      originalCode: vulnerability.vulnerableCode,
      fixedCode: this.extractSection(response.content, "FIXED_CODE") ?? "",
      explanation: this.extractSection(response.content, "EXPLANATION") ?? "",
      tradeoffs: this.extractList(response.content, "TRADEOFFS"),
      bestPractices: this.extractList(response.content, "BEST_PRACTICES"),
    };
  }

  async generateSummary(
    vulnerabilities: Vulnerability[],
    contractName: string,
  ): Promise<AISummary> {
    const vulnSummary = vulnerabilities
      .map((v) => `- [${v.severity}] ${v.title} (${v.category})`)
      .join("\n");

    const prompt = this.buildPrompt("generate_summary", {
      contractName,
      vulnerabilityCount: String(vulnerabilities.length),
      vulnerabilityList: vulnSummary,
      criticalCount: String(vulnerabilities.filter((v) => v.severity === "CRITICAL").length),
      highCount: String(vulnerabilities.filter((v) => v.severity === "HIGH").length),
    });

    const response = await this.call(prompt);

    const scoreStr = this.extractSection(response.content, "OVERALL_SCORE");
    const overallScore = scoreStr ? parseInt(scoreStr, 10) : 0;

    return {
      auditId: "",
      executiveSummary: this.extractSection(response.content, "EXECUTIVE_SUMMARY") ?? "",
      riskAssessment: this.extractSection(response.content, "RISK_ASSESSMENT") ?? "",
      keyFindings: this.extractList(response.content, "KEY_FINDINGS"),
      overallScore: isNaN(overallScore) ? 0 : overallScore,
      recommendations: this.extractList(response.content, "RECOMMENDATIONS"),
    };
  }

  async chat(userMessage: string, context: string = ""): Promise<string> {
    const prompt: AIPrompt = {
      system: this.config.systemPrompt,
      user: userMessage,
      template: "chat",
      variables: { context },
    };

    const response = await this.call(prompt);
    return response.content;
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }

  updateConfig(update: Partial<AIConfig>): void {
    this.config = { ...this.config, ...update };
    if (update.provider) {
      this.provider = update.provider;
    }
  }

  /* Private helpers */

  private async call(prompt: AIPrompt): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const systemPrompt = this.resolveTemplate(prompt.system, prompt.variables);
      const userPrompt = this.resolveTemplate(prompt.user, prompt.variables);

      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
          ...this.config.customHeaders,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          top_p: this.config.topP,
          frequency_penalty: this.config.frequencyPenalty,
          presence_penalty: this.config.presencePenalty,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI provider error (${response.status}): ${errorText}`);
      }

      const data = await response.json() as {
        choices?: Array<{
          message?: { content?: string };
          finish_reason?: string;
        }>;
        model?: string;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
      };
      const duration = Date.now() - startTime;

      return {
        content: data.choices?.[0]?.message?.content ?? "",
        model: data.model ?? this.config.model,
        provider: this.provider,
        tokensUsed: {
          promptTokens: data.usage?.prompt_tokens ?? 0,
          completionTokens: data.usage?.completion_tokens ?? 0,
          totalTokens: data.usage?.total_tokens ?? 0,
        },
        finishReason: data.choices?.[0]?.finish_reason ?? "stop",
        duration,
      };
    } catch (error) {
      throw new Error(
        `AI call failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private buildPrompt(template: string, variables: Record<string, string>): AIPrompt {
    const templates: Record<string, { system: string; user: string }> = {
      explain_vulnerability: {
        system: `You are a senior smart contract security auditor. Given a vulnerability found during a smart contract audit, explain it in plain English so that a developer with basic Soroban/Rust knowledge can understand the risk, how it could be exploited, the potential impact, and how to fix it. Use the following format:

PLAIN_ENGLISH:
[Explain the vulnerability in simple, non-technical language]

EXPLOIT_SCENARIO:
[Describe a realistic scenario of how an attacker could exploit this]

IMPACT:
[Describe the potential financial or security impact]

REMEDIATION:
[Explain step by step how to fix this vulnerability]

SECURE_EXAMPLE:
[Provide a complete secure code example in Rust/Soroban]`,
        user: `Vulnerability: ${variables.title}
Severity: ${variables.severity}
Category: ${variables.category}
Description: ${variables.description}

Vulnerable Code:
\`\`\`solidity
${variables.code}
\`\`\`

File: ${variables.fileName}`,
      },
      suggest_fix: {
        system: `You are a senior Soroban/Stellar security auditor. Suggest a secure fix for the given vulnerability. Provide the fixed code and explain the changes. Use this format:

FIXED_CODE:
[The corrected Rust/Soroban code]

EXPLANATION:
[Why this fix works and what was changed]

TRADEOFFS:
- [Tradeoff 1]
- [Tradeoff 2]

BEST_PRACTICES:
- [Best practice 1]
- [Best practice 2]`,
        user: `Vulnerability: ${variables.title}
Category: ${variables.category}
Description: ${variables.description}

Vulnerable Code:
\`\`\`solidity
${variables.code}
\`\`\``,
      },
      generate_summary: {
        system: `You are a senior smart contract security auditor. Generate an executive summary of a completed audit. Be concise but thorough. Use this format:

EXECUTIVE_SUMMARY:
[2-3 sentences summarizing the audit results]

RISK_ASSESSMENT:
[Overall risk level and reasoning]

KEY_FINDINGS:
- [Finding 1]
- [Finding 2]
- [Finding 3]

OVERALL_SCORE:
[Number between 0-100]

RECOMMENDATIONS:
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]`,
        user: `Contract: ${variables.contractName}
Total vulnerabilities found: ${variables.vulnerabilityCount}
Critical: ${variables.criticalCount}, High: ${variables.highCount}

Findings:
${variables.vulnerabilityList}`,
      },
      chat: {
        system: this.config.systemPrompt,
        user: `Context: ${variables.context}\n\nUser question: ${variables.user ?? ""}`,
      },
    };

    const tmpl = templates[template];
    if (!tmpl) {
      throw new Error(`Unknown prompt template: ${template}`);
    }

    return {
      system: tmpl.system,
      user: tmpl.user,
      template,
      variables,
    };
  }

  private resolveTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\$\{(\w+)\}/g, (_, key: string) => variables[key] ?? "");
  }

  private extractSection(content: string, sectionName: string): string | null {
    const regex = new RegExp(`${sectionName}:?\s*\n([\\s\\S]*?)(?:\n[A-Z_]+:?\s*\n|$)`, "m");
    const match = content.match(regex);
    return match ? match[1]?.trim() ?? null : null;
  }

  private extractList(content: string, sectionName: string): string[] {
    const section = this.extractSection(content, sectionName);
    if (!section) return [];

    return section
      .split("\n")
      .map((line) => line.trim().replace(/^[-\*\d+\.]\s*/, ""))
      .filter((line) => line.length > 0);
  }
}

export { AIProvider } from "@sentinelai/shared";
export type {
  AIConfig,
  AIResponse,
  AIPrompt,
  AIVulnerabilityExplanation,
  AIFixSuggestion,
  AISummary,
  AIInsights,
} from "@sentinelai/shared";
