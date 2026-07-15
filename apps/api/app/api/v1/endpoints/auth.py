"""Auth endpoints."""
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    generate_nonce,
    create_sep10_challenge_message,
    create_auth_message,
    verify_signature,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.deps import get_current_user, require_auth
from app.db.session import get_db
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import (
    AuthChallengeRequest,
    AuthChallengeResponse,
    AuthVerifyRequest,
    AuthResponse,
    AuthRefreshRequest,
    UserResponse,
)

router = APIRouter()

# In-memory nonce store (use Redis in production)
_nonce_store: dict[str, dict] = {}


@router.post("/challenge", response_model=AuthChallengeResponse)
async def request_challenge(
    request: AuthChallengeRequest,
    db: AsyncSession = Depends(get_db),
):
    """Request a SEP-10 authentication challenge (nonce + message to sign)."""
    address = request.address
    nonce = generate_nonce()
    message = create_sep10_challenge_message(address, nonce)

    # Store nonce
    _nonce_store[address] = {
        "nonce": nonce,
        "expires_at": datetime.now(timezone.utc).timestamp() + 300,  # 5 min
    }

    # Auto-create user if not exists
    user_repo = UserRepository(db)
    user = await user_repo.get_by_address(address)
    if not user:
        user = await user_repo.create({
            "address": address,
            "role": "developer",
        })

    return AuthChallengeResponse(
        message=message,
        nonce=nonce,
        expiresAt=datetime.now(timezone.utc).isoformat(),
    )


@router.post("/verify", response_model=AuthResponse)
async def verify_authentication(
    request: AuthVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verify the signed message and return tokens."""
    address = request.address.lower()

    # Check nonce
    stored = _nonce_store.get(address)
    if not stored:
        raise HTTPException(status_code=400, detail="No challenge requested")

    if datetime.now(timezone.utc).timestamp() > stored["expires_at"]:
        del _nonce_store[address]
        raise HTTPException(status_code=400, detail="Challenge expired")

    if stored["nonce"] != request.nonce:
        raise HTTPException(status_code=400, detail="Invalid nonce")

    # Reconstruct the SEP-10 challenge message that was signed
    message = create_sep10_challenge_message(address, stored["nonce"])

    # Verify signature
    if not verify_signature(address, message, request.signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Clean up nonce
    del _nonce_store[address]

    # Get or create user
    user_repo = UserRepository(db)
    user = await user_repo.get_by_address(address)
    if not user:
        user = await user_repo.create({"address": address, "role": "developer"})

    # Update last login
    await user_repo.update(user, {"last_login_at": datetime.now(timezone.utc)})

    # Generate tokens
    token_data = {"sub": str(user.id), "address": user.address, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return AuthResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        expiresAt=(
            datetime.now(timezone.utc).timestamp() + (settings.JWT_EXPIRY_MINUTES * 60)
        ),
        user=UserResponse(
            id=str(user.id),
            address=user.address,
            role=user.role,
            username=user.username,
            avatarUrl=user.avatar_url,
            totalAudits=user.total_audits,
            reputation=user.reputation,
        ),
    )


@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(
    request: AuthRefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh an expired access token."""
    payload = decode_token(request.refreshToken)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    token_data = {"sub": str(user.id), "address": user.address, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return AuthResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        expiresAt=(
            datetime.now(timezone.utc).timestamp() + (settings.JWT_EXPIRY_MINUTES * 60)
        ),
        user=UserResponse(
            id=str(user.id),
            address=user.address,
            role=user.role,
            username=user.username,
            avatarUrl=user.avatar_url,
            totalAudits=user.total_audits,
            reputation=user.reputation,
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(require_auth),
):
    """Get the current authenticated user."""
    return UserResponse(
        id=str(current_user.id),
        address=current_user.address,
        role=current_user.role,
        username=current_user.username,
        avatarUrl=current_user.avatar_url,
        totalAudits=current_user.total_audits,
        reputation=current_user.reputation,
    )


@router.post("/logout")
async def logout(
    current_user: User = Depends(require_auth),
):
    """Logout the current user."""
    return {"success": True, "message": "Logged out successfully"}
