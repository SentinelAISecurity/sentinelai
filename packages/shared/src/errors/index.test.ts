import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  RateLimitError,
  PluginError,
  AIError,
  ContractAnalysisError,
} from "./index";

describe("AppError", () => {
  it("should create an error with correct properties", () => {
    const error = new AppError("TEST_CODE", "Test message", 418, { key: "value" });
    expect(error.code).toBe("TEST_CODE");
    expect(error.message).toBe("Test message");
    expect(error.statusCode).toBe(418);
    expect(error.details).toEqual({ key: "value" });
    expect(error.name).toBe("AppError");
    expect(error).toBeInstanceOf(Error);
  });

  it("should use default statusCode 500", () => {
    const error = new AppError("CODE", "msg");
    expect(error.statusCode).toBe(500);
  });

  it("should use empty details by default", () => {
    const error = new AppError("CODE", "msg");
    expect(error.details).toEqual({});
  });

  it("should serialize to JSON correctly", () => {
    const error = new AppError("TEST", "message", 400, { field: "name" });
    const json = error.toJSON();
    expect(json).toEqual({
      code: "TEST",
      message: "message",
      statusCode: 400,
      details: { field: "name" },
    });
  });
});

describe("NotFoundError", () => {
  it("should create with resource name and id", () => {
    const error = new NotFoundError("User", "123");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("User with id '123' not found");
    expect(error.statusCode).toBe(404);
    expect(error.details).toEqual({ resource: "User", id: "123" });
  });

  it("should create with resource name only", () => {
    const error = new NotFoundError("Resource");
    expect(error.message).toBe("Resource not found");
    expect(error.details).toEqual({ resource: "Resource", id: undefined });
  });
});

describe("UnauthorizedError", () => {
  it("should use default message", () => {
    const error = new UnauthorizedError();
    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.message).toBe("Authentication required");
    expect(error.statusCode).toBe(401);
  });

  it("should accept custom message", () => {
    const error = new UnauthorizedError("Custom auth message");
    expect(error.message).toBe("Custom auth message");
  });
});

describe("ForbiddenError", () => {
  it("should use default message", () => {
    const error = new ForbiddenError();
    expect(error.code).toBe("FORBIDDEN");
    expect(error.message).toBe("Insufficient permissions");
    expect(error.statusCode).toBe(403);
  });

  it("should accept custom message", () => {
    const error = new ForbiddenError("No access");
    expect(error.message).toBe("No access");
  });
});

describe("ValidationError", () => {
  it("should create with message and details", () => {
    const error = new ValidationError("Invalid input", { field: "email", reason: "invalid format" });
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Invalid input");
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ field: "email", reason: "invalid format" });
  });

  it("should use empty details by default", () => {
    const error = new ValidationError("Bad request");
    expect(error.details).toEqual({});
  });
});

describe("RateLimitError", () => {
  it("should use default retryAfter", () => {
    const error = new RateLimitError();
    expect(error.code).toBe("RATE_LIMITED");
    expect(error.statusCode).toBe(429);
    expect(error.details).toEqual({ retryAfterSeconds: 60 });
  });

  it("should accept custom retryAfter", () => {
    const error = new RateLimitError(30);
    expect(error.details).toEqual({ retryAfterSeconds: 30 });
  });
});

describe("PluginError", () => {
  it("should create with plugin name", () => {
    const error = new PluginError("Plugin crashed", "my-plugin", { stack: "..." });
    expect(error.code).toBe("PLUGIN_ERROR");
    expect(error.message).toBe("Plugin crashed");
    expect(error.statusCode).toBe(500);
    expect(error.details).toEqual({ pluginName: "my-plugin", stack: "..." });
  });
});

describe("AIError", () => {
  it("should create with provider", () => {
    const error = new AIError("API timeout", "openai");
    expect(error.code).toBe("AI_ERROR");
    expect(error.message).toBe("API timeout");
    expect(error.details).toEqual({ provider: "openai" });
  });
});

describe("ContractAnalysisError", () => {
  it("should create with details", () => {
    const error = new ContractAnalysisError("Compilation failed", { compiler: "0.8.0" });
    expect(error.code).toBe("CONTRACT_ANALYSIS_ERROR");
    expect(error.message).toBe("Compilation failed");
    expect(error.details).toEqual({ compiler: "0.8.0" });
  });
});
