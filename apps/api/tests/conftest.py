"""Test fixtures and configuration for SentinelAI API tests."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock

from main import app
from app.core.deps import require_auth
from app.db.session import get_db

# Disable startup/shutdown events that require a database connection
app.router.lifespan_context = None


class MockUser:
    """Mock authenticated user for testing."""

    def __init__(self, role: str = "developer"):
        self.id = "user_test_001"
        self.address = "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H"
        self.role = role
        self.username = "test_user"
        self.avatar_url = None
        self.total_audits = 5
        self.reputation = 100


class MockSession:
    """Mock async database session."""

    async def commit(self):
        pass

    async def rollback(self):
        pass

    async def close(self):
        pass

    async def execute(self, *args, **kwargs):
        return AsyncMock()

    async def refresh(self, *args, **kwargs):
        pass

    async def flush(self, *args, **kwargs):
        pass


@pytest.fixture(autouse=True)
def override_db():
    """Override get_db for all tests to avoid database connection."""
    async def mock_get_db():
        yield MockSession()

    app.dependency_overrides[get_db] = mock_get_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def mock_user():
    """Return a mock user instance."""
    return MockUser()


@pytest.fixture
def client():
    """Return a TestClient without auth (public endpoints only)."""
    return TestClient(app)


@pytest.fixture
def auth_client(mock_user):
    """Return a TestClient with mocked developer authentication."""
    async def override_auth():
        return mock_user

    app.dependency_overrides[require_auth] = override_auth
    return TestClient(app)
