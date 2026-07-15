"""Audit schemas."""
from typing import Optional
from pydantic import BaseModel, Field


class AuditCreateRequest(BaseModel):
    contractId: str
    type: str = "file_upload"
    sourceCode: Optional[str] = None
    githubUrl: Optional[str] = None
    contractAddress: Optional[str] = None
    chainId: Optional[str] = None
    options: Optional[dict] = None


class AuditResponse(BaseModel):
    id: str
    userId: str
    contractId: str
    type: str
    status: str
    securityScore: int = 0
    vulnerabilitiesFound: int = 0
    criticalCount: int = 0
    highCount: int = 0
    mediumCount: int = 0
    lowCount: int = 0
    infoCount: int = 0
    gasScore: int = 0
    duration: int = 0
    sourceHash: str = ""
    reportHash: Optional[str] = None
    reportUri: Optional[str] = None
    txHash: Optional[str] = None
    metadata: dict = {}
    createdAt: str
    updatedAt: str
    completedAt: Optional[str] = None


class AuditResultResponse(BaseModel):
    auditId: str
    contractId: str
    securityScore: int
    vulnerabilities: list = []
    summary: dict
    recommendations: list = []
    gasAnalysis: Optional[dict] = None
    aiInsights: Optional[dict] = None
