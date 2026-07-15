"""Tests for SEP-10 authentication endpoints."""


class TestAuthChallenge:
    """Tests for POST /api/v1/auth/challenge."""

    VALID_ADDRESS = "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H"

    def test_challenge_with_valid_address_returns_200(self, client):
        """Valid Stellar address should get a challenge message."""
        response = client.post(
            "/api/v1/auth/challenge",
            json={"address": self.VALID_ADDRESS},
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "nonce" in data
        assert "expiresAt" in data
        assert len(data["nonce"]) > 0
        assert "SentinelAI" in data["message"]

    def test_challenge_returns_valid_nonce(self, client):
        """Challenge should include a 64-char hex nonce."""
        response = client.post(
            "/api/v1/auth/challenge",
            json={"address": self.VALID_ADDRESS},
        )
        data = response.json()
        assert len(data["nonce"]) == 64

    def test_challenge_with_invalid_address_returns_422(self, client):
        """Invalid address (not 56 chars starting with G) should fail validation."""
        response = client.post(
            "/api/v1/auth/challenge",
            json={"address": "invalid"},
        )
        assert response.status_code == 422

    def test_challenge_with_missing_address_returns_422(self, client):
        """Missing address field should fail validation."""
        response = client.post(
            "/api/v1/auth/challenge",
            json={},
        )
        assert response.status_code == 422

    def test_challenge_with_ethereum_address_returns_422(self, client):
        """Ethereum-style 0x address should fail G... validation."""
        response = client.post(
            "/api/v1/auth/challenge",
            json={"address": "0x1234567890123456789012345678901234567890"},
        )
        assert response.status_code == 422


class TestAuthVerify:
    """Tests for POST /api/v1/auth/verify."""

    VALID_ADDRESS = "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H"

    def test_verify_with_invalid_signature_is_rejected(self, client):
        """Invalid signature should be rejected (400 for bad nonce, 401 for bad sig)."""
        # Generate a valid nonce directly (don't depend on challenge endpoint)
        nonce = "a" * 64

        response = client.post(
            "/api/v1/auth/verify",
            json={
                "address": self.VALID_ADDRESS,
                "signature": "00" * 64,
                "nonce": nonce,
            },
        )
        assert response.status_code in (400, 401)

    def test_verify_with_empty_signature_returns_422(self, client):
        """Empty signature should fail validation."""
        response = client.post(
            "/api/v1/auth/verify",
            json={
                "address": self.VALID_ADDRESS,
                "signature": "",
                "nonce": "test_nonce",
            },
        )
        assert response.status_code == 422
