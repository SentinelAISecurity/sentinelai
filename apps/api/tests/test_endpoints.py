"""Tests for protected API endpoints (require authentication)."""


class TestAuditsEndpoints:
    """Tests for /api/v1/audits endpoints."""

    def test_create_audit_returns_200(self, auth_client):
        """Creating an audit should return 200 with audit data."""
        response = auth_client.post(
            "/api/v1/audits/",
            json={
                "contractId": "contract_001",
                "type": "file_upload",
                "options": {"deepScan": True, "aiAnalysis": True},
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["type"] == "file_upload"

    def test_list_audits_returns_200(self, auth_client):
        """Listing audits should return 200."""
        response = auth_client.get("/api/v1/audits/")
        assert response.status_code == 200

    def test_get_audit_returns_200(self, auth_client):
        """Getting a specific audit should return 200."""
        response = auth_client.get("/api/v1/audits/audit_001")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "audit_001"

    def test_run_audit_returns_200(self, auth_client):
        """Running an audit should return 200 with results."""
        response = auth_client.post("/api/v1/audits/audit_001/run")
        assert response.status_code == 200
        data = response.json()
        assert "vulnerabilities" in data
        assert "securityScore" in data

    def test_create_audit_without_auth_returns_401(self, client):
        """Unauthenticated requests should be rejected."""
        response = client.post(
            "/api/v1/audits/",
            json={"contractId": "contract_001", "type": "file_upload"},
        )
        assert response.status_code == 401


class TestContractsEndpoints:
    """Tests for /api/v1/contracts endpoints."""

    def test_create_contract_returns_200(self, auth_client):
        """Creating a contract should return 200."""
        response = auth_client.post(
            "/api/v1/contracts/",
            json={
                "name": "Test Contract",
                "description": "A test Soroban contract",
                "address": "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
                "chainId": "stellar-testnet",
                "compiler": "soroban",
                "compilerVersion": "21.0.0",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Contract"
        assert data["status"] == "active"

    def test_list_contracts_returns_200(self, auth_client):
        """Listing contracts should return 200."""
        response = auth_client.get("/api/v1/contracts/")
        assert response.status_code == 200

    def test_get_contract_returns_200(self, auth_client):
        """Getting a specific contract should return 200."""
        response = auth_client.get("/api/v1/contracts/contract_001")
        assert response.status_code == 200


class TestMonitorsEndpoints:
    """Tests for /api/v1/monitors endpoints."""

    def test_create_monitor_returns_200(self, auth_client):
        """Creating a monitor should return 200."""
        response = auth_client.post(
            "/api/v1/monitors/",
            json={
                "name": "Test Monitor",
                "contractId": "contract_001",
                "contractAddress": "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
                "chainId": "stellar-testnet",
                "checkInterval": 300,
                "isActive": False,
                "rules": [],
            },
        )
        assert response.status_code == 200

    def test_list_monitors_returns_200(self, auth_client):
        """Listing monitors should return 200."""
        response = auth_client.get("/api/v1/monitors/")
        assert response.status_code == 200

    def test_toggle_monitor_returns_200(self, auth_client):
        """Toggling a monitor should return 200."""
        response = auth_client.post("/api/v1/monitors/monitor_001/toggle")
        assert response.status_code == 200


class TestAlertsEndpoints:
    """Tests for /api/v1/alerts endpoints."""

    def test_list_alerts_returns_200(self, auth_client):
        """Listing alerts should return 200."""
        response = auth_client.get("/api/v1/alerts/")
        assert response.status_code == 200


class TestPluginsEndpoints:
    """Tests for /api/v1/plugins endpoints."""

    def test_list_plugins_returns_200_with_auth(self, auth_client):
        """Plugin listing should return plugins data."""
        response = auth_client.get("/api/v1/plugins/")
        assert response.status_code == 200
        data = response.json()
        assert "plugins" in data
        assert len(data["plugins"]) >= 1
        assert data["plugins"][0]["name"] == "Reentrancy Scanner"

    def test_toggle_plugin_requires_auth(self, client):
        """Toggling a plugin without auth should fail."""
        response = client.post("/api/v1/plugins/reentrancy_v1.0.0/toggle")
        assert response.status_code == 401


class TestAIEndpoints:
    """Tests for /api/v1/ai endpoints."""

    def test_ai_chat_returns_200(self, auth_client):
        """AI chat should return 200."""
        response = auth_client.post(
            "/api/v1/ai/chat",
            json={"message": "What is a reentrancy vulnerability?"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data or "message" in data


class TestReportsEndpoints:
    """Tests for /api/v1/reports endpoints."""

    def test_generate_report_returns_200(self, auth_client):
        """Generating a report should return 200."""
        response = auth_client.post(
            "/api/v1/reports/generate",
            json={"auditId": "audit_001", "format": "markdown"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["format"] == "markdown"
        assert "hash" in data

    def test_list_reports_returns_200(self, auth_client):
        """Listing reports should return 200."""
        response = auth_client.get("/api/v1/reports/")
        assert response.status_code == 200

    def test_get_report_returns_200(self, auth_client):
        """Getting a specific report should return 200."""
        response = auth_client.get("/api/v1/reports/report_001")
        assert response.status_code == 200


class TestDashboardEndpoints:
    """Tests for /api/v1/dashboard endpoints."""

    def test_dashboard_stats_returns_200(self, auth_client):
        """Dashboard stats should return 200."""
        response = auth_client.get("/api/v1/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert "totalAudits" in data
        assert "securityScore" in data

    def test_dashboard_data_returns_200(self, auth_client):
        """Dashboard data should return 200."""
        response = auth_client.get("/api/v1/dashboard/data")
        assert response.status_code == 200
