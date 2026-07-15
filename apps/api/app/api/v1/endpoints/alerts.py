"""Alert endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_auth
from app.db.session import get_db
from app.models.user import User
from app.schemas.alert import AlertResponse

router = APIRouter()


@router.get("/", response_model=list[AlertResponse])
async def list_alerts(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100, alias="pageSize"),
    severity: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(require_auth),
):
    """List alerts for the current user."""
    return []


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: str,
    current_user: User = Depends(require_auth),
):
    """Get a specific alert."""
    return AlertResponse(
        id=alert_id,
        monitorId="mon_001",
        userId=str(current_user.id),
        contractId="contract_001",
        title="Sample Alert",
        description="A sample alert description",
        severity="medium",
        status="active",
        category="monitoring",
        createdAt="2024-01-01T00:00:00Z",
        updatedAt="2024-01-01T00:00:00Z",
    )


@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    alert_id: str,
    current_user: User = Depends(require_auth),
):
    """Acknowledge an alert."""
    return AlertResponse(
        id=alert_id,
        monitorId="mon_001",
        userId=str(current_user.id),
        contractId="contract_001",
        title="Acknowledged Alert",
        description="This alert has been acknowledged.",
        severity="medium",
        status="acknowledged",
        category="monitoring",
        createdAt="2024-01-01T00:00:00Z",
        updatedAt="2024-01-01T00:00:00Z",
    )


@router.post("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: str,
    current_user: User = Depends(require_auth),
):
    """Resolve an alert."""
    return AlertResponse(
        id=alert_id,
        monitorId="mon_001",
        userId=str(current_user.id),
        contractId="contract_001",
        title="Resolved Alert",
        description="This alert has been resolved.",
        severity="medium",
        status="resolved",
        category="monitoring",
        createdAt="2024-01-01T00:00:00Z",
        updatedAt="2024-01-01T00:00:00Z",
    )
