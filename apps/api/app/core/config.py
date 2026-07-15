"""Application configuration."""
from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Application
    APP_NAME: str = "SentinelAI API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4

    # Security
    JWT_SECRET: str = "change-me-in-production-use-a-strong-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 1440  # 24 hours
    REFRESH_TOKEN_EXPIRY_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://sentinelai:sentinelai@localhost:5432/sentinelai"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI Configuration
    OPENAI_API_KEY: Optional[str] = None
    AI_DEFAULT_MODEL: str = "gpt-4-turbo-preview"
    AI_MAX_TOKENS: int = 4096
    AI_TEMPERATURE: float = 0.3

    # Blockchain - Stellar Network
    STELLAR_HORIZON_URL: str = "https://horizon.stellar.org"
    STELLAR_TESTNET_HORIZON_URL: str = "https://horizon-testnet.stellar.org"
    STELLAR_NETWORK_PASSPHRASE: str = "Public Global Stellar Network ; September 2015"
    STELLAR_TESTNET_PASSPHRASE: str = "Test SDF Network ; September 2015"

    # IPFS
    IPFS_API_URL: str = "http://localhost:5001"
    IPFS_GATEWAY_URL: str = "https://ipfs.io/ipfs"

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = [".rs", ".wasm", ".json", ".abi"]

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True

    # Monitoring
    SENTRY_DSN: Optional[str] = None

    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
