"""Security utilities for authentication and authorization."""
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from nacl.signing import VerifyKey

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_signature(address: str, message: str, signature: str) -> bool:
    """Verify a Stellar (Ed25519) signature using the Stellar SDK.

    The frontend sends a hex-encoded signature (converted from Freighter's base64 signBlob output).
    The message was base64-encoded before signing by Freighter, so we encode it the same way.
    """
    import base64
    try:
        from stellar_sdk import Keypair
        keypair = Keypair.from_public_key(address)

        # Decode signature (hex from frontend, or base64 from Freighter directly)
        try:
            sig_bytes = bytes.fromhex(signature)
        except ValueError:
            sig_bytes = base64.b64decode(signature)

        # Message was base64-encoded before signing (Freighter signBlob convention)
        encoded_message = base64.b64encode(message.encode()).decode()
        keypair.verify(encoded_message.encode(), sig_bytes)
        return True
    except Exception:
        return False


def stellar_address_to_public_key(address: str) -> bytes:
    """Decode a Stellar G... address to raw Ed25519 public key bytes."""
    from stellar_sdk import Keypair
    return Keypair.from_public_key(address).raw_public_key


def generate_nonce() -> str:
    """Generate a random nonce for authentication."""
    return secrets.token_hex(32)


def create_sep10_challenge_message(address: str, nonce: str) -> str:
    """Create a SEP-10 style challenge message for the user to sign.

    The message follows the SEP-10 format: a Stellar Web Authentication challenge.
    Since Freighter's signBlob signs arbitrary strings, we use a simple text challenge
    that includes the address, nonce, and timestamp.
    """
    return (
        f"SentinelAI authentication challenge\n\n"
        f"Network: Stellar\n"
        f"Address: {address}\n"
        f"Nonce: {nonce}\n"
        f"Issued At: {datetime.now(timezone.utc).isoformat()}\n\n"
        f"Sign this message to verify your Stellar account ownership."
    )


def create_auth_message(address: str, nonce: str) -> str:
    """Create a message for the user to sign."""
    return (
        f"Welcome to SentinelAI!\n\n"
        f"Please sign this message to verify your identity.\n\n"
        f"Address: {address}\n"
        f"Nonce: {nonce}\n"
        f"Timestamp: {datetime.now(timezone.utc).isoformat()}"
    )


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.JWT_EXPIRY_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRY_DAYS
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        return None


def hash_content(content: str) -> str:
    """Create a simple hash of content."""
    import hashlib
    return hashlib.sha256(content.encode()).hexdigest()
