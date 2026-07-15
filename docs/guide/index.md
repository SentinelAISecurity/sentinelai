# Introduction

Welcome to SentinelAI, the open-source AI-powered Web3 security platform.

## What is SentinelAI?

SentinelAI helps developers secure their smart contracts throughout the entire lifecycle — from development to post-deployment monitoring.

### Key Capabilities

- **Vulnerability Detection**: Automatically identify 15+ types of security vulnerabilities
- **AI-Powered Analysis**: Get explanations, exploit scenarios, and fix suggestions
- **Continuous Monitoring**: Track deployed contracts for suspicious activity
- **Report Generation**: Professional audit reports in multiple formats
- **Plugin System**: Extend with custom security scanners

## Architecture

SentinelAI follows a modular, plugin-based architecture:

```
User → Web Dashboard → API Gateway → Scanner Manager → Plugins
                                    → AI Engine → LLM Provider
                                    → Monitor Service → Blockchain
                                    → Report Generator
```

## Quick Links

- [Installation Guide](./installation)
- [Plugin Development](../plugins/)
- [API Reference](../api/)
- [GitHub Repository](https://github.com/sentinelai/sentinelai)
