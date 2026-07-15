"""Monitor endpoints."""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_auth
from app.db.session import get_db
from app.models.user import User
from app.schemas.monitor import (
    MonitorCreateRequest,
    MonitorResponse,
    MonitorEventResponse,
)

router = APIRouter()


@router.post("/", response_model=MonitorResponse)
async def create_monitor(
    request: MonitorCreateRequest,
    current_user: User = Depends(require_auth),
):
    """Create a new contract monitor."""
    now = datetime.now(timezone.utc).isoformat()
    return MonitorResponse(
        id=f"mon_{int(datetime.now(timezone.utc).timestamp())}",
        userId=str(current_user.id),
        contractId=request.contractId,
        name=request.name,
        description=request.description,
        chainId=request.chainId,
        contractAddress=request.contractAddress,
        isActive=True,
        checkInterval=request.checkInterval,
        rules=[r.model_dump() for r in request.rules],
        lastCheckedAt=None,
        totalAlerts=0,
        createdAt=now,
        updatedAt=now,
    )


@router.get("/", response_model=list[MonitorResponse])
async def list_monitors(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100, alias="pageSize"),
    current_user: User = Depends(require_auth),
):
    """List all monitors for the current user."""
    return []


@router.get("/{monitor_id}", response_model=MonitorResponse)
async def get_monitor(
    monitor_id: str,
    current_user: User = Depends(require_auth),
):
    """Get a specific monitor."""
    now = datetime.now(timezone.utc).isoformat()
    return MonitorResponse(
        id=monitor_id,
        userId=str(current_user.id),
        contractId="contract_001",
        name="Monitor",
        chainId="stellar-testnet",
        contractAddress="GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
        isActive=True,
        checkInterval=300,
        rules=[],
        createdAt=now,
        updatedAt=now,
    )


@router.post("/{monitor_id}/toggle", response_model=MonitorResponse)
async def toggle_monitor(
    monitor_id: str,
    current_user: User = Depends(require_auth),
):
    """Toggle a monitor on/off."""
    now = datetime.now(timezone.utc).isoformat()
    return MonitorResponse(
        id=monitor_id,
        userId=str(current_user.id),
        contractId="contract_001",
        name="Monitor",
        chainId="stellar-testnet",
        contractAddress="GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
        isActive=True,
        checkInterval=300,
        rules=[],
        createdAt=now,
        updatedAt=now,
    )
