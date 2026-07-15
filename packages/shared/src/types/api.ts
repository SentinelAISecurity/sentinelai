export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  requestId: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  timestamp: string;
  requestId: string;
}

export interface ApiQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  filters?: Record<string, string | string[]>;
}

export enum ApiEndpoint {
  // Auth
  AUTH_CHALLENGE = "/api/v1/auth/challenge",
  AUTH_VERIFY = "/api/v1/auth/verify",
  AUTH_REFRESH = "/api/v1/auth/refresh",
  AUTH_LOGOUT = "/api/v1/auth/logout",
  AUTH_ME = "/api/v1/auth/me",

  // Audits
  AUDITS = "/api/v1/audits",
  AUDIT_BY_ID = "/api/v1/audits/:id",
  AUDIT_RUN = "/api/v1/audits/:id/run",
  AUDIT_RESULTS = "/api/v1/audits/:id/results",
  AUDIT_REPORT = "/api/v1/audits/:id/report",

  // Contracts
  CONTRACTS = "/api/v1/contracts",
  CONTRACT_BY_ID = "/api/v1/contracts/:id",
  CONTRACT_ANALYZE = "/api/v1/contracts/:id/analyze",
  CONTRACT_VERIFY_SOURCE = "/api/v1/contracts/:id/verify-source",

  // Monitoring
  MONITORS = "/api/v1/monitors",
  MONITOR_BY_ID = "/api/v1/monitors/:id",
  MONITOR_TOGGLE = "/api/v1/monitors/:id/toggle",
  MONITOR_EVENTS = "/api/v1/monitors/:id/events",

  // Alerts
  ALERTS = "/api/v1/alerts",
  ALERT_BY_ID = "/api/v1/alerts/:id",
  ALERT_ACKNOWLEDGE = "/api/v1/alerts/:id/acknowledge",
  ALERT_RESOLVE = "/api/v1/alerts/:id/resolve",

  // Plugins
  PLUGINS = "/api/v1/plugins",
  PLUGIN_BY_ID = "/api/v1/plugins/:id",
  PLUGIN_TOGGLE = "/api/v1/plugins/:id/toggle",
  PLUGIN_DISCOVER = "/api/v1/plugins/discover",

  // AI
  AI_ANALYZE = "/api/v1/ai/analyze",
  AI_EXPLAIN = "/api/v1/ai/explain",
  AI_SUGGEST_FIX = "/api/v1/ai/suggest-fix",
  AI_SUMMARY = "/api/v1/ai/summary",
  AI_CHAT = "/api/v1/ai/chat",

  // Reports
  REPORTS = "/api/v1/reports",
  REPORT_BY_ID = "/api/v1/reports/:id",
  REPORT_GENERATE = "/api/v1/reports/generate",
  REPORT_EXPORT = "/api/v1/reports/:id/export",

  // Dashboard
  DASHBOARD_STATS = "/api/v1/dashboard/stats",
  DASHBOARD_DATA = "/api/v1/dashboard/data",
  DASHBOARD_ACTIVITY = "/api/v1/dashboard/activity",

  // Webhook
  WEBHOOK_TX = "/api/v1/webhooks/transaction",
}
