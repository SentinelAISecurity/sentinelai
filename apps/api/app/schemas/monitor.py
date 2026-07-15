"""Monitor schemas."""
from typing import Optional
from pydantic import BaseModel, Field


class MonitorRuleCreate(BaseModel):
    type: str
    name: str
    description: str = ""
    isEnabled: bool = True
    threshold: dict = {}
    targetAddresses: list = []
    targetFunctions: list = []
    targetEvents: list = []
    notificationChannels: list = ["in_app"]


class MonitorCreateRequest(BaseModel):
    contractId: str
    name: str
    description: Optional[str] = None
    chainId: str = "stellar-testnet"
    contractAddress: str
    checkInterval: int = 300  # seconds
    rules: list[MonitorRuleCreate] = []


class MonitorResponse(BaseModel):
    id: str
    userId: str
    contractId: str
    name: str
    description: Optional[str] = None
    chainId: str
    contractAddress: str
    isActive: bool = True
    checkInterval: int
    rules: list = []
    lastCheckedAt: Optional[str] = None
    totalAlerts: int = 0
    createdAt: str
    updatedAt: str


class MonitorEventResponse(BaseModel):
    id: str
    monitorId: str
    txHash: str
    blockNumber: int
    timestamp: str
    ruleType: str
    description: str
    data: dict = {}
