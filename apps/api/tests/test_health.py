"""Tests for root and health endpoints."""


class TestRootEndpoint:
    """Tests for the root GET / endpoint."""

    def test_root_returns_200(self, client):
        """Root endpoint should return 200 with API info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "SentinelAI API"
        assert data["version"] == "1.0.0"
        assert data["status"] == "operational"

    def test_root_returns_json_content_type(self, client):
        """Root endpoint should return JSON."""
        response = client.get("/")
        assert response.headers["content-type"].startswith("application/json")


class TestHealthEndpoint:
    """Tests for the /health endpoint."""

    def test_health_returns_200(self, client):
        """Health check should return 200."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == "1.0.0"

    def test_health_is_accessible_without_auth(self, client):
        """Health check should not require authentication."""
        response = client.get("/health")
        assert response.status_code == 200


class TestOpenAPIDocs:
    """Tests for API documentation endpoints."""

    def test_openapi_json_returns_200(self, client):
        """OpenAPI JSON should be accessible."""
        response = client.get("/api/v1/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert data["info"]["title"] == "SentinelAI API"

    def test_swagger_docs_returns_200(self, client):
        """Swagger UI should be accessible."""
        response = client.get("/api/docs")
        assert response.status_code == 200

    def test_redoc_returns_200(self, client):
        """ReDoc should be accessible."""
        response = client.get("/api/redoc")
        assert response.status_code == 200
