"""Auth schemas."""
from typing import Optional
from pydantic import BaseModel, Field


class AuthChallengeRequest(BaseModel):
    address: str = Field(..., min_length=56, max_length=56, pattern=r"^G[A-Z2-7]{55}$")


class AuthChallengeResponse(BaseModel):
    message: str
    nonce: str
    expiresAt: str


class AuthVerifyRequest(BaseModel):
    address: str = Field(..., min_length=56, max_length=56)
    signature: str = Field(..., min_length=1)
    nonce: str = Field(..., min_length=1)


class AuthRefreshRequest(BaseModel):
    refreshToken: str


class UserResponse(BaseModel):
    id: str
    address: str
    role: str
    username: Optional[str] = None
    avatarUrl: Optional[str] = None
    totalAudits: int = 0
    reputation: int = 0


class AuthResponse(BaseModel):
    accessToken: str
    refreshToken: str
    expiresAt: float
    user: UserResponse
