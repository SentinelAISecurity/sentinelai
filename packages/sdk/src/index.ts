import type {
  ApiResponse,
  PaginatedResponse,
  Audit,
  AuditResult,
  Contract,
  Monitor as MonitorType,
  Alert,
  Plugin as PluginType,
  Report,
  User,
  AuthChallenge,
  AuthResponse,
  DashboardData,
  DashboardStats,
  AIInsights,
} from "@sentinelai/shared";

export class SentinelAIClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string = "http://localhost:8000") {
    this.baseUrl = `${baseUrl}/api/v1`;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  /* Auth */

  /** Request a SEP-10 authentication challenge from the server */
  async sep10Challenge(address: string): Promise<AuthChallenge> {
    const response = await this.get<ApiResponse<AuthChallenge>>("/auth/challenge", { address });
    if (!response.success) {
      throw new Error(response.message ?? "Failed to get challenge");
    }
    return response.data;
  }

  /** Verify the signed SEP-10 challenge and get JWT tokens */
  async sep10Verify(
    address: string,
    signature: string,
    nonce: string,
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<ApiResponse<AuthResponse>>("/auth/verify", {
      address,
      signature,
      nonce,
    });
    if (response.success) {
      const data = response.data as unknown as AuthResponse;
      this.setTokens(data.accessToken, data.refreshToken);
    }
    return response;
  }

  /** @deprecated Use sep10Challenge instead */
  async getAuthChallenge(address: string): Promise<ApiResponse<AuthChallenge>> {
    return this.get("/auth/challenge", { address });
  }

  /** @deprecated Use sep10Verify instead */
  async verifyAuth(
    address: string,
    signature: string,
    nonce: string,
  ): Promise<ApiResponse<AuthResponse>> {
    return this.sep10Verify(address, signature, nonce);
  }

  /* Audits */
  async createAudit(data: Record<string, unknown>): Promise<ApiResponse<Audit>> {
    return this.post("/audits", data);
  }

  async getAudit(id: string): Promise<ApiResponse<Audit>> {
    return this.get(`/audits/${id}`);
  }

  async listAudits(params?: Record<string, string>): Promise<PaginatedResponse<Audit>> {
    return this.get("/audits", params);
  }

  async runAudit(id: string): Promise<ApiResponse<AuditResult>> {
    return this.post(`/audits/${id}/run`);
  }

  async getAuditResults(id: string): Promise<ApiResponse<AuditResult>> {
    return this.get(`/audits/${id}/results`);
  }

  /* Contracts */
  async uploadContract(data: Record<string, unknown>): Promise<ApiResponse<Contract>> {
    return this.post("/contracts", data);
  }

  async getContract(id: string): Promise<ApiResponse<Contract>> {
    return this.get(`/contracts/${id}`);
  }

  async listContracts(params?: Record<string, string>): Promise<PaginatedResponse<Contract>> {
    return this.get("/contracts", params);
  }

  /* Monitoring */
  async createMonitor(data: Record<string, unknown>): Promise<ApiResponse<MonitorType>> {
    return this.post("/monitors", data);
  }

  async listMonitors(): Promise<PaginatedResponse<MonitorType>> {
    return this.get("/monitors");
  }

  async toggleMonitor(id: string): Promise<ApiResponse<MonitorType>> {
    return this.post(`/monitors/${id}/toggle`);
  }

  /* Alerts */
  async listAlerts(params?: Record<string, string>): Promise<PaginatedResponse<Alert>> {
    return this.get("/alerts", params);
  }

  async acknowledgeAlert(id: string): Promise<ApiResponse<Alert>> {
    return this.post(`/alerts/${id}/acknowledge`);
  }

  /* Plugins */
  async listPlugins(): Promise<ApiResponse<PluginType[]>> {
    return this.get("/plugins");
  }

  async togglePlugin(id: string): Promise<ApiResponse<PluginType>> {
    return this.post(`/plugins/${id}/toggle`);
  }

  /* AI */
  async aiAnalyze(data: Record<string, unknown>): Promise<ApiResponse<AIInsights>> {
    return this.post("/ai/analyze", data);
  }

  async aiChat(message: string): Promise<ApiResponse<{ reply: string }>> {
    return this.post("/ai/chat", { message });
  }

  /* Reports */
  async generateReport(auditId: string): Promise<ApiResponse<Report>> {
    return this.post("/reports/generate", { auditId });
  }

  async getReport(id: string): Promise<ApiResponse<Report>> {
    return this.get(`/reports/${id}`);
  }

  /* Dashboard */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.get("/dashboard/stats");
  }

  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return this.get("/dashboard/data");
  }

  /* Private helpers */
  private async get<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.set(key, value);
      });
    }
    return this.request<T>(url.toString(), { method: "GET" });
  }

  private async post<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async request<T>(url: string, options: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error?.message ?? `Request failed with status ${response.status}`);
    }

    return json as T;
  }
}

export default SentinelAIClient;
