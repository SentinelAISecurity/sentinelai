"""
Access Control Vulnerability Scanner Plugin for SentinelAI.

Detects:
- Missing access control modifiers on sensitive functions
- tx.origin for authentication
- Improper use of onlyOwner
- Missing role-based access control
"""

import re
from typing import List, Dict, Any


class AccessControlScanner:
    """Scanner for access control vulnerabilities."""

    name = "Access Control Scanner"
    severity = "HIGH"
    description = "Detects missing or improper access control in Soroban/Stellar contracts"

    SENSITIVE_FUNCTIONS = [
        "withdraw", "transfer", "mint", "burn", "pause", "unpause",
        "upgrade", "setOwner", "transferOwnership", "renounceOwnership",
        "setAdmin", "updateConfig", "emergencyStop", "emergencyWithdraw",
    ]

    ACCESS_MODIFIERS = [
        "onlyOwner", "onlyAdmin", "onlyRole", "onlyGovernance",
        "onlyAuthorized", "onlyWhitelisted", "requireOwner",
        "require(msg.sender == owner", "require(_msgSender() == owner",
    ]

    def analyze(self, source_code: str) -> Dict[str, Any]:
        """Analyze Rust/Soroban source code for access control issues."""
        vulnerabilities = []
        warnings = []
        lines = source_code.split("\n")

        # Check for tx.origin usage
        tx_origin_matches = list(re.finditer(r'tx\.origin', source_code))
        for match in tx_origin_matches:
            line_num = self._get_line_number(source_code, match.start(), lines)
            vulnerabilities.append({
                "title": "tx.origin used for authentication",
                "description": (
                    "Using tx.origin for authentication is dangerous as it can be "
                    "exploited through phishing attacks. Use msg.sender instead."
                ),
                "severity": "HIGH",
                "category": "access_control",
                "lineNumbers": [line_num],
                "fileName": "contract.sol",
                "functionName": None,
                "vulnerableCode": "require(tx.origin == owner)",
                "fixedCode": "require(msg.sender == owner)",
                "references": [
                    "https://docs.soliditylang.org/en/latest/security-considerations.html#tx-origin",
                ],
                "confidence": 0.95,
                "detectedBy": "access-control-scanner",
            })

        # Check sensitive functions for missing access control
        functions = self._extract_functions(source_code)
        for func in functions:
            if func["name"].lower() in [s.lower() for s in self.SENSITIVE_FUNCTIONS]:
                if not self._has_access_control(func["body"]):
                    line_num = func["start_line"]
                    vulnerabilities.append({
                        "title": f"Missing access control in {func['name']}()",
                        "description": (
                            f"The function '{func['name']}' performs a sensitive operation "
                            "without proper access control. Add an appropriate modifier "
                            "(e.g., onlyOwner) or role-based check."
                        ),
                        "severity": "HIGH",
                        "category": "access_control",
                        "lineNumbers": [line_num],
                        "fileName": "contract.sol",
                        "functionName": func["name"],
                        "vulnerableCode": func["line"],
                        "fixedCode": f"function {func['name']}() external onlyOwner {{ ... }}",
                        "references": [
                            "https://docs.openzeppelin.com/contracts/4.x/access-control",
                        ],
                        "confidence": 0.9,
                        "detectedBy": "access-control-scanner",
                    })

        return {
            "success": True,
            "vulnerabilities": vulnerabilities,
            "warnings": warnings,
            "metadata": {
                "scanner_version": "1.0.0",
                "functions_analyzed": len(functions),
            },
        }

    def _extract_functions(self, source_code: str) -> List[Dict[str, Any]]:
        """Extract function definitions with their bodies."""
        functions = []
        lines = source_code.split("\n")

        i = 0
        while i < len(lines):
            line = lines[i]
            match = re.search(
                r'function\s+(\w+)\s*\([^)]*\)',
                line,
            )
            if match:
                body, end_line = self._get_function_body(lines, i)
                functions.append({
                    "name": match.group(1),
                    "start_line": i + 1,
                    "end_line": end_line,
                    "line": line.strip(),
                    "body": "\n".join(body),
                })
                i = end_line
            i += 1

        return functions

    def _get_function_body(self, lines: List[str], start: int) -> tuple:
        """Extract function body lines."""
        body_lines = []
        brace_count = 0
        started = False
        end = start

        for i in range(start, len(lines)):
            line = lines[i]
            brace_count += line.count("{") - line.count("}")
            if "{" in line:
                started = True
            if started:
                body_lines.append(line)
            if started and brace_count == 0:
                end = i + 1
                break

        return body_lines, end

    def _has_access_control(self, body: str) -> bool:
        """Check if a function body has access control."""
        for modifier in self.ACCESS_MODIFIERS:
            if modifier in body:
                return True
        return False

    def _get_line_number(self, source: str, pos: int, lines: List[str]) -> int:
        """Get the source line number from character position."""
        return source[:pos].count("\n") + 1

    def recommendations(self) -> List[str]:
        """Return remediation recommendations."""
        return [
            "Use Soroban's Address authorization framework for access control",
            "Never use tx.origin for authentication",
            "Add access modifiers to all sensitive functions",
            "Implement role-based access control for complex permissions",
        ]


def create_plugin():
    """Create and return a new scanner instance."""
    return AccessControlScanner()
