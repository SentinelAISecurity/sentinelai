"""Report schemas."""
from typing import Optional
from pydantic import BaseModel


class ReportGenerateRequest(BaseModel):
    auditId: str
    format: str = "markdown"


class ReportResponse(BaseModel):
    id: str
    auditId: str
    userId: str
    contractId: str
    format: str
    title: str
    summary: str
    hash: str
    ipfsHash: Optional[str] = None
    ipfsUri: Optional[str] = None
    txHash: Optional[str] = None
    generatedBy: str
    createdAt: str


class ReportExportRequest(BaseModel):
    format: str = "pdf"
