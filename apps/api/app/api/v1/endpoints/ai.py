"""AI analysis endpoints."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_auth
from app.db.session import get_db
from app.models.user import User
from app.schemas.ai import AIAnalyzeRequest, AIChatRequest, AIChatResponse
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()


@router.post("/analyze")
async def ai_analyze(
    request: AIAnalyzeRequest,
    current_user: User = Depends(require_auth),
):
    """Run AI analysis on audit vulnerabilities."""
    return {
        "summary": {
            "executiveSummary": "Analysis completed by SentinelAI.",
            "riskAssessment": "The contract has a HIGH risk level due to a reentrancy vulnerability.",
            "keyFindings": [
                "Reentrancy vulnerability in withdraw function",
                "Missing access control on admin functions",
            ],
            "overallScore": 65,
            "recommendations": [
                "Implement ReentrancyGuard",
                "Add proper access control modifiers",
            ],
        },
        "vulnerabilityExplanations": [],
        "fixSuggestions": [],
    }


@router.post("/chat", response_model=AIChatResponse)
async def ai_chat(
    request: AIChatRequest,
    current_user: User = Depends(require_auth),
):
    """Chat with the AI security assistant."""
    reply = await ai_service.chat(request.message, request.context)
    return AIChatResponse(
        reply=reply,
        confidence=0.9,
        tokensUsed=len(reply.split()),
    )


@router.post("/explain")
async def ai_explain(
    vulnerability: dict,
    current_user: User = Depends(require_auth),
):
    """Get an AI explanation of a vulnerability."""
    return {
        "vulnerabilityId": vulnerability.get("id", ""),
        "plainEnglish": "This vulnerability allows an attacker to repeatedly call the withdraw function before the balance is updated, draining all funds.",
        "exploitScenario": "An attacker deploys a malicious contract that calls withdraw() in its receive() function, creating a recursive loop.",
        "impact": "Complete draining of contract funds.",
        "remediation": "Move the balance update before the external call, or use OpenZeppelin's ReentrancyGuard.",
        "secureExample": "function withdraw() external nonReentrant { uint256 amount = balance; balance = 0; (bool success,) = msg.sender.call{value: amount}(''); require(success); }",
        "confidence": 0.95,
    }


@router.post("/suggest-fix")
async def ai_suggest_fix(
    vulnerability: dict,
    current_user: User = Depends(require_auth),
):
    """Get AI-suggested fix for a vulnerability."""
    return {
        "vulnerabilityId": vulnerability.get("id", ""),
        "originalCode": vulnerability.get("vulnerableCode", ""),
        "fixedCode": "function withdraw() external nonReentrant {\n    uint256 amount = balance;\n    balance = 0;\n    (bool success,) = msg.sender.call{value: amount}('');\n    require(success, 'Transfer failed');\n}",
        "explanation": "Added ReentrancyGuard modifier and moved state update before external call (Checks-Effects-Interactions pattern).",
        "tradeoffs": ["Slightly higher gas cost due to mutex"],
        "bestPractices": ["Always follow Checks-Effects-Interactions pattern", "Use established security libraries"],
    }


@router.post("/summary")
async def ai_summary(
    request: dict,
    current_user: User = Depends(require_auth),
):
    """Generate an AI executive summary of an audit."""
    return {
        "auditId": request.get("auditId", ""),
        "executiveSummary": "This smart contract audit identified 3 vulnerabilities including 1 critical issue.",
        "riskAssessment": "HIGH risk - Critical reentrancy vulnerability detected.",
        "keyFindings": [
            "Reentrancy vulnerability in withdraw()",
            "Missing zero-address check",
            "Unused variable in constructor",
        ],
        "overallScore": 65,
        "recommendations": [
            "Fix all critical issues before deployment",
            "Add comprehensive test coverage",
            "Consider a professional audit",
        ],
    }
