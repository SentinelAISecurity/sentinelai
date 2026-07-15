"""Dashboard endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_auth
from app.db.session import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardStatsResponse, DashboardDataResponse

router = APIRouter()


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user: User = Depends(require_auth),
):
    """Get dashboard statistics for the current user."""
    return DashboardStatsResponse(
        totalAudits=12,
        totalContracts=8,
        activeMonitors=3,
        totalVulnerabilities=24,
        securityScore=72,
        averageAuditTime=45.5,
        criticalResolved=3,
        highResolved=7,
    )


@router.get("/data", response_model=DashboardDataResponse)
async def get_dashboard_data(
    current_user: User = Depends(require_auth),
):
    """Get full dashboard data for the current user."""
    return DashboardDataResponse(
        stats=DashboardStatsResponse(
            totalAudits=12,
            totalContracts=8,
            activeMonitors=3,
            totalVulnerabilities=24,
            securityScore=72,
            averageAuditTime=45.5,
            criticalResolved=3,
            highResolved=7,
        ),
        severityDistribution={
            "critical": 3,
            "high": 7,
            "medium": 8,
            "low": 4,
            "info": 2,
            "gas": 0,
        },
        vulnerabilityTimeline=[
            {"date": "2024-01-01", "audits": 3, "vulnerabilities": 8, "fixed": 5},
            {"date": "2024-01-08", "audits": 4, "vulnerabilities": 6, "fixed": 4},
            {"date": "2024-01-15", "audits": 5, "vulnerabilities": 10, "fixed": 7},
        ],
        recentAudits=[],
        recentAlerts=[],
        topVulnerabilities=[
            {"category": "reentrancy", "count": 5, "severity": "CRITICAL", "trend": "DOWN"},
            {"category": "access_control", "count": 7, "severity": "HIGH", "trend": "STABLE"},
            {"category": "oracle_manipulation", "count": 3, "severity": "HIGH", "trend": "UP"},
        ],
        contractHealth=[],
        activityFeed=[],
    )
