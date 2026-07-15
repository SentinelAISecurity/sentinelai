"""Contract schemas."""
from typing import Optional
from pydantic import BaseModel, Field


class ContractCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    sourceCode: Optional[str] = None
    address: Optional[str] = None
    chainId: Optional[str] = None
    compiler: Optional[str] = None
    compilerVersion: Optional[str] = None


class ContractResponse(BaseModel):
    id: str
    userId: str
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    chainId: Optional[str] = None
    compiler: Optional[str] = None
    compilerVersion: Optional[str] = None
    status: str = "active"
    createdAt: str
    updatedAt: str
    lastAuditedAt: Optional[str] = None
