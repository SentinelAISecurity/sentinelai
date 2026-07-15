"""Webhook endpoints for external integrations."""
from fastapi import APIRouter, BackgroundTasks, Request

router = APIRouter()


@router.post("/transaction")
async def transaction_webhook(request: Request):
    """Handle incoming transaction webhooks from blockchain events."""
    body = await request.json()

    return {
        "received": True,
        "txHash": body.get("txHash", "unknown"),
        "status": "processing",
    }
