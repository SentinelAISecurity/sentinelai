"""API v1 router configuration."""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    audits,
    contracts,
    monitors,
    alerts,
    plugins,
    ai,
    reports,
    dashboard,
    webhooks,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(audits.router, prefix="/audits", tags=["Audits"])
api_router.include_router(contracts.router, prefix="/contracts", tags=["Contracts"])
api_router.include_router(monitors.router, prefix="/monitors", tags=["Monitoring"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(plugins.router, prefix="/plugins", tags=["Plugins"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
