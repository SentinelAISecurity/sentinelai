"""Dashboard schemas."""
from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    totalAudits: int = 0
    totalContracts: int = 0
    activeMonitors: int = 0
    totalVulnerabilities: int = 0
    securityScore: int = 0
    averageAuditTime: float = 0.0
    criticalResolved: int = 0
    highResolved: int = 0


class DashboardDataResponse(BaseModel):
    stats: DashboardStatsResponse
    severityDistribution: dict = {}
    vulnerabilityTimeline: list = []
    recentAudits: list = []
    recentAlerts: list = []
    topVulnerabilities: list = []
    contractHealth: list = []
    activityFeed: list = []
