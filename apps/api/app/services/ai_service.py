"""AI Service for interacting with AI providers."""
import os
from typing import Optional

from app.core.config import settings


class AIService:
    """Service for AI-powered security analysis."""

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
        self.model = settings.AI_DEFAULT_MODEL
        self.base_url = "https://api.openai.com/v1"

    async def chat(self, message: str, context: str = "") -> str:
        """Chat with the AI security assistant."""
        if not self.api_key:
            return self._mock_response(message)

        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "system",
                                "content": (
                                    "You are a senior smart contract security auditor named SentinelAI. "
                                    "You specialize in Soroban (Rust) smart contract security analysis on Stellar, "
                                    "vulnerability detection, and secure code remediation. Be concise, technical, and helpful."
                                ),
                            },
                            {
                                "role": "user",
                                "content": f"Context: {context}\n\nQuestion: {message}",
                            },
                        ],
                        "max_tokens": settings.AI_MAX_TOKENS,
                        "temperature": settings.AI_TEMPERATURE,
                    },
                    timeout=30.0,
                )
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                return self._mock_response(message)
        except Exception:
            return self._mock_response(message)

    def _mock_response(self, message: str) -> str:
        """Provide a mock response when AI is unavailable."""
        if "reentrancy" in message.lower():
            return (
                "Reentrancy is a critical vulnerability where an external contract "
                "can make recursive calls back to the vulnerable contract before the "
                "state is updated. This can drain funds from the contract. Fix it by:\n\n"
                "1. Following the Checks-Effects-Interactions pattern\n"
                "2. Adding authorization checks on every cross-contract call\n"
                "3. Using pull payments instead of push payments"
            )
        if "access control" in message.lower():
            return (
                "Access control vulnerabilities occur when functions lack proper "
                "authorization checks. On Stellar/Soroban, common patterns include:\n\n"
                "- Missing `require_auth()` calls on sensitive functions\n"
                "- Public functions that should be restricted to specific roles\n"
                "- Incorrect authorization logic\n\n"
                "Use Soroban's Address authorization framework for production-grade access control."
            )
        return (
            "I'm SentinelAI, your smart contract security assistant. I can help you with:\n\n"
            "- Vulnerability analysis and explanation\n"
            "- Code review and security best practices\n"
            "- Gas optimization suggestions\n"
            "- Security pattern recommendations\n\n"
            "What specific security question do you have?"
        )
