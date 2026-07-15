"""Alert schemas."""
from typing import Optional
from pydantic import BaseModel


class AlertResponse(BaseModel):
    id: str
    monitorId: str
    userId: str
    contractId: str
    title: str
    description: str
    severity: str
    status: str
    category: str
    txHash: Optional[str] = None
    blockNumber: Optional[int] = None
    data: dict = {}
    acknowledgedAt: Optional[str] = None
    resolvedAt: Optional[str] = None
    createdAt: str
    updatedAt: str
