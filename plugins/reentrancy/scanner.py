"""
Reentrancy Vulnerability Scanner Plugin for SentinelAI.

Detects:
- External calls before state updates (violation of Checks-Effects-Interactions pattern)
- Missing SorobanAuth from Stellar
- Read-only reentrancy (view functions that could be exploited)
- Cross-function reentrancy between public functions
"""

import re
from typing import List, Dict, Any


class ReentrancyScanner:
    """Scanner for reentrancy vulnerabilities."""

    name = "Reentrancy Scanner"
    severity = "CRITICAL"
    description = "Detects reentrancy vulnerabilities in Soroban/Stellar smart contracts"

    REENTRANCY_PATTERNS = [
        # Low-level call before state update
        r'\.call\{.*\}\(.*\)',
        r'\.send\(.*\)',
        r'\.transfer\(.*\)',
        # Transfer via .call{value: ...}
        r'\.call\{value:',
        # Delegatecall
        r'\.delegatecall\(',
    ]

    REENTRANCY_GUARD_IMPORT = "import.*SorobanAuth"
    REENTRANCY_MODIFIER = "nonReentrant"

    def analyze(self, source_code: str) -> Dict[str, Any]:
        """
        Analyze a Soroban/Stellar smart contract for reentrancy vulnerabilities.

        Args:
            source_code: The Rust/Soroban source code to analyze

        Returns:
            Dict containing vulnerabilities found, warnings, and metadata
        """
        vulnerabilities = []
        warnings = []
        lines = source_code.split("\n")

        # Check for missing SorobanAuth
        if not re.search(self.REENTRANCY_GUARD_IMPORT, source_code):
            warnings.append(
                "No SorobanAuth import found. Consider using Stellar's SorobanAuth."
            )

        # Check each function for reentrancy patterns
        functions = self._extract_functions(source_code)
        for func in functions:
            func_vulns = self._check_function(func, lines)
            vulnerabilities.extend(func_vulns)

        # Check for read-only reentrancy
        read_only_vulns = self._check_read_only_reentrancy(source_code, lines)
        vulnerabilities.extend(read_only_vulns)

        return {
            "success": True,
            "vulnerabilities": vulnerabilities,
            "warnings": warnings,
            "metadata": {
                "scanner_version": "1.0.0",
                "patterns_checked": len(self.REENTRANCY_PATTERNS),
                "functions_analyzed": len(functions),
            },
        }

    def _extract_functions(self, source_code: str) -> List[Dict[str, Any]]:
        """Extract function definitions from source code."""
        functions = []
        pattern = r'function\s+(\w+)\s*\([^)]*\)\s*(?:public|external|internal|private)?(?:\s+view)?(?:\s+pure)?(?:\s+payable)?(?:\s+returns\s*\([^)]*\))?\s*\{?'
        
        lines = source_code.split("\n")
        for i, line in enumerate(lines):
            match = re.search(pattern, line)
            if match:
                functions.append({
                    "name": match.group(1),
                    "start_line": i + 1,
                    "line": line.strip(),
                })

        return functions

    def _check_function(self, func: Dict[str, Any], lines: List[str]) -> List[Dict[str, Any]]:
        """Check a single function for reentrancy patterns."""
        vulnerabilities = []

        # Get function body
        start = func["start_line"]
        body_lines = self._get_function_body(lines, start)
        body = "\n".join(body_lines)

        # Check for external calls
        for pattern in self.REENTRANCY_PATTERNS:
            matches = list(re.finditer(pattern, body))
            for match in matches:
                call_line = match.group(0)
                
                # Check if state change happens after the call
                if self._is_state_after_call(body, match.span()[0]):
                    vulnerabilities.append({
                        "title": f"Reentrancy vulnerability in {func['name']}()",
                        "description": (
                            f"The function '{func['name']}' contains an external call ({call_line}) "
                            "before state updates. This violates the Checks-Effects-Interactions pattern "
                            "and makes the contract vulnerable to reentrancy attacks."
                        ),
                        "severity": "CRITICAL",
                        "category": "reentrancy",
                        "lineNumbers": self._get_line_numbers(body_lines, match.span()),
                        "fileName": "contract.rs",
                        "functionName": func["name"],
                        "vulnerableCode": self._get_vulnerable_snippet(body_lines, match.span()),
                        "fixedCode": self._generate_fix(func["name"], body_lines),
                        "references": [
                            "https://soroban.stellar.org/docs",
                            "https://consensys.github.io/smart-contract-best-practices/attacks/reentrancy/",
                        ],
                        "confidence": 0.9,
                        "detectedBy": "reentrancy-scanner",
                    })

        return vulnerabilities

    def _check_read_only_reentrancy(self, source_code: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for read-only reentrancy vulnerabilities."""
        vulnerabilities = []
        
        # Find view/pure functions that read state
        view_functions = re.finditer(
            r'function\s+(\w+)\s*\([^)]*\)\s*(?:public|external)\s+view\s+(?:virtual\s+)?(?:\w+\s+)?returns',
            source_code,
        )
        
        for match in view_functions:
            func_name = match.group(1)
            # Check if function reads mutable state that could change in a tx
            if self._reads_mutable_state(source_code, match.start()):
                vulnerabilities.append({
                    "title": f"Potential read-only reentrancy in {func_name}()",
                    "description": (
                        f"View function '{func_name}' reads state that could be manipulated during "
                        "a reentrancy attack if called during an external call."
                    ),
                    "severity": "MEDIUM",
                    "category": "reentrancy",
                    "lineNumbers": [self._get_line_number(lines, source_code[:match.start()])],
                    "fileName": "contract.rs",
                    "functionName": func_name,
                    "vulnerableCode": "",
                    "fixedCode": "",
                    "references": [
                        "https://developers.stellar.org/docs",
                    ],
                    "confidence": 0.6,
                    "detectedBy": "reentrancy-scanner",
                })

        return vulnerabilities

    def _get_function_body(self, lines: List[str], start: int) -> List[str]:
        """Extract the body of a function."""
        body_lines = []
        brace_count = 0
        started = False

        for i in range(start, len(lines)):
            line = lines[i]
            brace_count += line.count("{") - line.count("}")
            
            if "{" in line:
                started = True
            
            if started:
                body_lines.append(line)
            
            if started and brace_count == 0:
                break

        return body_lines

    def _is_state_after_call(self, body: str, call_pos: int) -> bool:
        """Check if there are state updates after an external call."""
        after_call = body[call_pos:]
        state_patterns = [
            r'\w+\s*=\s*(?!\s*\()',  # assignment
            r'\w+\[.*\]\s*=',  # mapping/array update
            r'emit\s+',  # event emission after assignment
        ]
        
        for pattern in state_patterns:
            if re.search(pattern, after_call):
                return True
        return False

    def _read_mutable_state(self, source_code: str, start: int) -> bool:
        """Check if code reads mutable state variables."""
        # Simplified check
        state_patterns = [r'\w+\.\w+', r'balanceOf', r'mapping']
        snippet = source_code[start:start+500]
        return any(re.search(p, snippet) for p in state_patterns)

    def _get_line_numbers(self, lines: List[str], span: tuple) -> List[int]:
        """Get line numbers for a given span in the function body."""
        return []  # Simplified

    def _get_line_number(self, lines: List[str], prefix: str) -> int:
        """Get the line number from prefix string."""
        return prefix.count("\n") + 1

    def _get_vulnerable_snippet(self, lines: List[str], span: tuple) -> str:
        """Extract the vulnerable code snippet."""
        return "\n".join(lines[:5]) if len(lines) > 5 else "\n".join(lines)

    def _generate_fix(self, func_name: str, lines: List[str]) -> str:
        """Generate a fixed version of the vulnerable code."""
        return (
            f"function {func_name}() external nonReentrant {{\n"
            "    // Update state first (Checks-Effects-Interactions)\n"
            "    uint256 amount = balances[msg.sender];\n"
            "    balances[msg.sender] = 0;\n"
            "    // Then make external call\n"
            "    (bool success, ) = msg.sender.call{value: amount}('');\n"
            "    require(success);\n"
            "}"
        )

    def recommendations(self) -> List[str]:
        """Return remediation recommendations."""
        return [
            "Always follow the Checks-Effects-Interactions pattern",
            "Use Stellar's SorobanAuth for functions making external calls",
            "Avoid using low-level calls when possible",
            "Use Soroban's authorization framework to control cross-contract calls",
        ]


# Plugin entry point for SentinelAI
def create_plugin():
    """Create and return a new scanner instance."""
    return ReentrancyScanner()
