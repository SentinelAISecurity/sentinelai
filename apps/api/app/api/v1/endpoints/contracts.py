"""Contract endpoints."""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_auth
from app.db.session import get_db
from app.models.user import User
from app.schemas.contract import ContractCreateRequest, ContractResponse

router = APIRouter()


@router.post("/", response_model=ContractResponse)
async def create_contract(
    request: ContractCreateRequest,
    current_user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Create a new contract for analysis."""
    now = datetime.now(timezone.utc).isoformat()
    return ContractResponse(
        id=f"contract_{int(datetime.now(timezone.utc).timestamp())}",
        userId=str(current_user.id),
        name=request.name,
        description=request.description,
        address=request.address,
        chainId=request.chainId,
        compiler=request.compiler,
        compilerVersion=request.compilerVersion,
        status="active",
        createdAt=now,
        updatedAt=now,
    )


@router.post("/upload")
async def upload_contract_file(
    file: UploadFile = File(...),
    name: str = Form(...),
    current_user: User = Depends(require_auth),
):
    """Upload a Soroban/Wasm file for contract analysis."""
    if not file.filename or not (file.filename.endswith(".sol") or file.filename.endswith(".rs") or file.filename.endswith(".wasm")):
        raise HTTPException(status_code=400, detail="Only .sol, .rs, or .wasm files are allowed")

    content = await file.read()
    source_code = content.decode("utf-8")

    now = datetime.now(timezone.utc).isoformat()
    return ContractResponse(
        id=f"contract_{int(datetime.now(timezone.utc).timestamp())}",
        userId=str(current_user.id),
        name=name,
        status="active",
        createdAt=now,
        updatedAt=now,
    )


@router.get("/", response_model=list[ContractResponse])
async def list_contracts(
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100, alias="pageSize"),
    current_user: User = Depends(require_auth),
):
    """List all contracts for the current user."""
    return []


@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: str,
    current_user: User = Depends(require_auth),
):
    """Get a specific contract."""
    now = datetime.now(timezone.utc).isoformat()
    return ContractResponse(
        id=contract_id,
        userId=str(current_user.id),
        name="Example Contract",
        status="active",
        createdAt=now,
        updatedAt=now,
    )
