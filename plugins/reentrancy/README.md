# Reentrancy Scanner Plugin

A SentinelAI security scanner plugin that detects reentrancy vulnerabilities in Soroban/Stellar smart contracts.

## Features

- Detects CEI (Checks-Effects-Interactions) pattern violations
- Identifies missing OpenZeppelin ReentrancyGuard usage
- Detects read-only reentrancy vulnerabilities
- Cross-function reentrancy analysis
- Provides secure fix suggestions

## Detection Capabilities

| Pattern | Detected | Confidence |
|---------|----------|------------|
| External call before state update | ✅ | High |
| Missing ReentrancyGuard | ✅ | High |
| Low-level .call usage | ✅ | Medium |
| Read-only reentrancy | ✅ | Medium |
| Cross-function reentrancy | ✅ | Low |

## Installation

This plugin is built-in to SentinelAI. No additional installation required.

## Configuration

```json
{
  "detectCEI": true,
  "detectReadOnly": true,
  "detectCrossFunction": true
}
```

## License

Apache 2.0
