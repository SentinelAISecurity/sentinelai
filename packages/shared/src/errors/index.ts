export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "AppError";
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      "NOT_FOUND",
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      404,
      { resource, id },
    );
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super("UNAUTHORIZED", message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super("FORBIDDEN", message, 403);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super("VALIDATION_ERROR", message, 400, details);
    this.name = "ValidationError";
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSeconds: number = 60) {
    super("RATE_LIMITED", "Too many requests, please try again later", 429, {
      retryAfterSeconds,
    });
    this.name = "RateLimitError";
  }
}

export class PluginError extends AppError {
  constructor(message: string, pluginName: string, details: Record<string, unknown> = {}) {
    super("PLUGIN_ERROR", message, 500, { pluginName, ...details });
    this.name = "PluginError";
  }
}

export class AIError extends AppError {
  constructor(message: string, provider: string, details: Record<string, unknown> = {}) {
    super("AI_ERROR", message, 500, { provider, ...details });
    this.name = "AIError";
  }
}

export class ContractAnalysisError extends AppError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super("CONTRACT_ANALYSIS_ERROR", message, 500, details);
    this.name = "ContractAnalysisError";
  }
}
