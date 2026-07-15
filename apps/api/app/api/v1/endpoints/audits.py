"""Audit endpoints."""
from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_auth
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit import (
    AuditCreateRequest,
    AuditResponse,
    AuditResultResponse,
)
# AI router is registered directly in the main router

router = APIRouter()


@router.post("/", response_model=AuditResponse)
async def create_audit(
    request: AuditCreateRequest,
    current_user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Create a new audit request."""
    audit = {
        "id": f"audit_{int(datetime.now(timezone.utc).timestamp())}",
        "userId": str(current_user.id),
        "contractId": request.contractId,
        "type": request.type,
        "status": "pending",
        "securityScore": 0,
        "vulnerabilitiesFound": 0,
        "criticalCount": 0,
        "highCount": 0,
        "mediumCount": 0,
        "lowCount": 0,
        "infoCount": 0,
        "gasScore": 0,
        "duration": 0,
        "sourceHash": "",
        "metadata": request.options or {},
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "completedAt": None,
    }

    return AuditResponse(
        id=audit["id"],
        userId=audit["userId"],
        contractId=audit["contractId"],
        type=audit["type"],
        status=audit["status"],
        securityScore=audit["securityScore"],
        vulnerabilitiesFound=audit["vulnerabilitiesFound"],
        criticalCount=audit["criticalCount"],
        highCount=audit["highCount"],
        mediumCount=audit["mediumCount"],
        lowCount=audit["lowCount"],
        infoCount=audit["infoCount"],
        gasScore=audit["gasScore"],
        duration=audit["duration"],
        sourceHash=audit["sourceHash"],
        metadata=audit["metadata"],
        createdAt=audit["createdAt"],
        updatedAt=audit["updatedAt"],
        completedAt=audit["completedAt"],
    )


@router.get("/", response_model=list[AuditResponse])
async def list_audits(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100, alias="pageSize"),
    status: Optional[str] = None,
    current_user: User = Depends(require_auth),
):
    """List all audits for the current user."""
    return []


@router.get("/{audit_id}", response_model=AuditResponse)
async def get_audit(
    audit_id: str,
    current_user: User = Depends(require_auth),
):
    """Get a specific audit."""
    return AuditResponse(
        id=audit_id,
        userId=str(current_user.id),
        contractId="contract_001",
        type="file_upload",
        status="pending",
        createdAt=datetime.now(timezone.utc).isoformat(),
        updatedAt=datetime.now(timezone.utc).isoformat(),
    )


@router.post("/{audit_id}/run", response_model=AuditResultResponse)
async def run_audit(
    audit_id: str,
    current_user: User = Depends(require_auth),
):
    """Run an audit analysis."""
    sample_vulnerability = {
        "id": "vuln_001",
        "auditId": audit_id,
        "title": "Reentrancy Vulnerability",
        "description": "The withdraw function is vulnerable to reentrancy attacks because it sends XLM before updating the state.",
        "severity": "CRITICAL",
        "category": "reentrancy",
        "lineNumbers": [45, 46, 47],
        "fileName": "contract.rs",
        "functionName": "withdraw",
        "vulnerableCode": "pub fn withdraw(env: Env, amount: i128) -> Result<(), Error> {",
        "fixedCode": "pub fn withdraw(env: Env, amount: i128) -> Result<(), Error> {\n    let balance = env.storage().instance().get(&DataKey::Balance)?.unwrap_or(0);\n    env.storage().instance().set(&DataKey::Balance, &(balance - amount));\n    // Then transfer XLM\n}",
        "references": ["https://soroban.stellar.org/docs"],
        "cvssScore": 9.8,
        "exploitabilityScore": 9.0,
        "confidence": 0.95,
        "detectedBy": "reentrancy-plugin",
        "detectedAt": datetime.now(timezone.utc).isoformat(),
        "metadata": {},
    }

    return AuditResultResponse(
        auditId=audit_id,
        contractId="contract_001",
        securityScore=65,
        vulnerabilities=[sample_vulnerability],
        summary={
            "totalVulnerabilities": 1,
            "bySeverity": {"CRITICAL": 1},
            "securePatternsFound": ["Access control via Ownable"],
            "overallRisk": "HIGH",
            "estimatedExploitability": 0.9,
            "remediationComplexity": "MODERATE",
        },
        recommendations=[
            {
                "id": "rec_001",
                "title": "Soroban Authorization",
                "description": "Use Stellar authorization framework to prevent unauthorized access.",
                "severity": "CRITICAL",
                "category": "reentrancy",
                "codeSnippet": "use soroban_sdk::Address;",
                "fixedCodeSnippet": "function withdraw() external nonReentrant { ... }",
                "references": ["https://soroban.stellar.org/docs"],
            }
        ],
        gasAnalysis={
            "totalGasUsed": 45000,
            "functions": [],
            "optimizations": [],
            "overallGrade": "B",
        },
    )
