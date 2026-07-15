"""AI schemas."""
from typing import Optional
from pydantic import BaseModel


class AIAnalyzeRequest(BaseModel):
    auditId: str
    vulnerabilities: list = []


class AIChatRequest(BaseModel):
    message: str
    context: str = ""


class AIChatResponse(BaseModel):
    reply: str
    confidence: float = 0.0
    tokensUsed: int = 0
