# 🔐 SentinelAI — AI-Powered Web3 Security Platform

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/license-Apache%202.0-green?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/python-3.12+-blue?style=for-the-badge&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/typescript-5.5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/stellar-soroban-blue?style=for-the-badge&logo=stellar" alt="Stellar Soroban" />
</p>

<p align="center">
  <strong>Open-source AI-powered security auditing, vulnerability detection, and blockchain monitoring platform.</strong>
</p>

<p align="center">
  <a href="https://discord.gg/sentinelai"><img src="https://img.shields.io/discord/1234567890?color=5865F2&logo=discord&logoColor=white" alt="Discord" /></a>
  <a href="https://twitter.com/sentinelai"><img src="https://img.shields.io/twitter/follow/sentinelai?style=social" alt="Twitter" /></a>
  <a href="https://github.com/sentinelai/sentinelai/stargazers"><img src="https://img.shields.io/github/stars/sentinelai/sentinelai?style=social" alt="Stars" /></a>
</p>

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Plugin System](#plugin-system)
- [API Reference](#api-reference)
- [Smart Contracts](#smart-contracts)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Security](#security)

## Overview

SentinelAI is a **production-ready, open-source platform** that helps developers secure their smart contracts throughout the entire lifecycle — from development to post-deployment monitoring.

> Designed similarly to projects like Trivy, OWASP ZAP, Slither, and Stellar — with a modular plugin architecture that encourages community contributions.

### Why SentinelAI?

- 🤖 **AI-Powered**: Get plain-English explanations of vulnerabilities and suggested fixes
- 🔌 **Plugin System**: Add new security scanners without touching core code
- 📊 **Professional Reports**: Generate audit reports in Markdown, JSON, and PDF
- 🔍 **Continuous Monitoring**: Track deployed contracts for suspicious activity
- ⛓️ **On-Chain Proof**: Store audit records immutably on the blockchain
- 🎨 **Modern Dashboard**: Dark-themed, responsive UI with real-time updates

## Features

### 🔍 Smart Contract Analysis

- Upload Rust/Soroban contracts or paste source directly
- Analyze GitHub repositories
- Scan deployed contracts by address
- Integration with Slither and Mythril (coming soon)

### 🛡️ Vulnerability Detection (15+ types)

| Category | Severity |
|----------|----------|
| Reentrancy | 🔴 Critical |
| Integer Overflow | 🔴 Critical |
| Access Control | 🟠 High |
| tx.origin Misuse | 🟠 High |
| Delegatecall Misuse | 🟠 High |
| Flash Loan Risks | 🟠 High |
| Oracle Manipulation | 🟠 High |
| DoS Attacks | 🟡 Medium |
| Timestamp Dependence | 🟡 Medium |
| Unsafe Randomness | 🟡 Medium |
| Selfdestruct | 🟡 Medium |
| Upgradeability Risks | 🔵 Low |
| Missing Events | 🔵 Low |
| Gas Optimization | 🟣 Gas |
| Unchecked Calls | 🟠 High |

### 🤖 AI Engine

- **Provider-agnostic**: OpenAI, Llama, Claude, Gemini (any OpenAI-compatible API)
- **Vulnerability Explanation**: Plain English descriptions with exploit scenarios
- **Fix Suggestions**: Secure code examples with best practices
- **Executive Summaries**: Professional audit summaries
- **Interactive Chat**: Ask security questions and get expert answers

### 📊 Monitoring & Alerts

- Ownership transfer detection
- Contract pause/unpause monitoring
- Proxy upgrade tracking
- Token minting alerts
- Large withdrawal detection
- Suspicious transaction spikes
- Multi-channel notifications (Discord, Telegram, Email, Slack, Webhook)

### 📝 Report Generation

- Markdown (human-readable)
- JSON (machine-readable)
- PDF (professional reports - coming soon)
- Store audit proofs on-chain via Audit Registry
- Decentralized storage on IPFS/Filecoin

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Animation**: Framer Motion
- **Blockchain**: Stellar SDK + Freighter Wallet
- **Charts**: Recharts

### Backend
- **Framework**: FastAPI (Python 3.12)
- **Database**: PostgreSQL + SQLAlchemy
- **Cache**: Redis
- **Async Tasks**: Celery
- **AI**: OpenAI-compatible API

### Blockchain
- **Contracts**: Rust (Soroban SDK)
- **Framework**: Soroban CLI + Cargo
- **Libraries**: soroban-sdk

### DevOps
- **Containers**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monorepo**: Turborepo + pnpm

## Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Python** >= 3.12
- **Docker** (optional, recommended)
- **Foundry** (for smart contract development)

### Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/sentinelai/sentinelai.git
cd sentinelai

# Start all services
pnpm docker:dev

# The API will be available at http://localhost:8000
# The web app will be available at http://localhost:3000
# API docs at http://localhost:8000/api/docs
```

### Local Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development servers
pnpm dev

# In a separate terminal, start the API
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Smart Contract Development

```bash
cd packages/contracts

# Install dependencies
forge install Stellar/stellar-contracts

# Build contracts
forge build

# Run tests
forge test -vvv

# Run coverage
forge coverage
```

## Project Structure

```
sentinelai/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   └── components/     # React components
│   │   ├── tailwind.config.js
│   │   └── next.config.js
│   ├── api/                    # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/v1/         # API endpoints
│   │   │   ├── core/           # Config, security, deps
│   │   │   ├── models/         # SQLAlchemy models
│   │   │   ├── repositories/   # Data access layer
│   │   │   ├── schemas/        # Pydantic schemas
│   │   │   └── services/       # Business logic
│   │   ├── main.py
│   │   └── requirements.txt
│   └── docs/                   # Documentation site (VitePress)
│
├── packages/
│   ├── shared/                 # Shared types and utilities
│   ├── ai-engine/              # AI analysis engine
│   ├── scanners/               # Plugin framework
│   ├── monitor/                # Contract monitoring
│   ├── report-generator/       # Report generation
│   ├── sdk/                    # JavaScript/TypeScript SDK
│   ├── ui/                     # Shared UI components
│   └── contracts/              # Soroban Rust smart contracts
│
├── plugins/                    # Security scanner plugins
│   ├── reentrancy/             # Reentrancy detection
│   ├── access-control/         # Access control detection
│   ├── oracle/                 # Oracle manipulation detection
│   └── custom/                 # User-created plugins
│
├── docker/                     # Docker configurations
├── .github/                    # CI/CD + Issue templates
├── docs/                       # Project documentation
├── turbo.json                  # Turborepo config
├── pnpm-workspace.yaml         # Monorepo workspace
└── README.md
```

## Plugin System

The plugin system is SentinelAI's most powerful feature. Every security analyzer is a standalone plugin.

### Create a Plugin

```python
from typing import Dict, Any, List

class MySecurityScanner:
    name = "My Scanner"
    severity = "HIGH"
    description = "Detects custom vulnerability patterns"

    def analyze(self, source_code: str) -> Dict[str, Any]:
        """Analyze source code and return findings."""
        vulnerabilities = []
        # Your detection logic
        return {
            "success": True,
            "vulnerabilities": vulnerabilities,
            "warnings": [],
            "metadata": {"version": "1.0.0"},
        }

    def recommendations(self) -> List[str]:
        """Return remediation recommendations."""
        return ["Fix all identified issues"]

def create_plugin():
    return MySecurityScanner()
```

### Manifest

```json
{
  "name": "my-scanner",
  "version": "1.0.0",
  "type": "scanner",
  "description": "My custom scanner",
  "author": "Your Name",
  "severity": "HIGH",
  "entryPoint": "scanner.py",
  "targets": ["Soroban"]
}
```

See [Plugin Development Guide](docs/plugin-development.md) for full documentation.

## API Reference

### Authentication

```bash
# Request challenge
curl -X POST http://localhost:8000/api/v1/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"address": "0x..."}'

# Verify signature
curl -X POST http://localhost:8000/api/v1/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"address": "0x...", "signature": "0x...", "nonce": "..."}'
```

### Create Audit

```bash
curl -X POST http://localhost:8000/api/v1/audits \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "contract_001",
    "type": "file_upload",
    "sourceCode": "pragma Soroban ^0.8.0; ..."
  }'
```

### Run Scan

```bash
curl -X POST http://localhost:8000/api/v1/audits/audit_001/run \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Full API documentation available at `http://localhost:8000/api/docs`

## Smart Contracts

### AuditRegistry

The AuditRegistry contract stores audit proofs on-chain for immutable verification.

```rust
function registerAudit(
    address contractAddress,
    bytes32 reportHash,
    uint8 securityScore
) external returns (bytes32 auditId)

function verifyAudit(bytes32 auditId) external view returns (bool)
function getAudit(bytes32 auditId) external view returns (...)
```

## Documentation

- [Architecture](ARCHITECTURE.md) — System design and technical details
- [Contributing](CONTRIBUTING.md) — How to contribute
- [Plugin Development](docs/plugin-development.md) — Build custom plugins
- [API Reference](http://localhost:8000/api/docs) — Interactive API docs
- [Roadmap](ROADMAP.md) — Future plans
- [Security](SECURITY.md) — Security policy and reporting

## Contributing

We welcome contributions of all kinds! Here's how to get started:

1. Read our [Contributing Guide](CONTRIBUTING.md)
2. Check out [Good First Issues](GOOD_FIRST_ISSUES.md)
3. Join our [Discord](https://discord.gg/sentinelai)
4. Fork and create a PR!

### Contributors ❤️

<a href="https://github.com/sentinelai/sentinelai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sentinelai/sentinelai" />
</a>

## Roadmap

See our [full roadmap](ROADMAP.md) for upcoming features:

- 🚀 **v1.1**: Slither & Mythril integration
- 🔔 **v1.2**: Alert monitoring system
- 🎨 **v2.0**: Plugin marketplace
- 🔗 **v2.1**: Multi-chain support

## License

SentinelAI is licensed under the [Apache License 2.0](LICENSE).

## Security

For security vulnerabilities, please see our [Security Policy](SECURITY.md). Do NOT open public issues for security bugs — contact security@sentinelai.dev directly.

---

<p align="center">
  <strong>Built with ❤️ by the SentinelAI community</strong>
</p>

<p align="center">
  <a href="https://github.com/sentinelai/sentinelai">GitHub</a> •
  <a href="https://discord.gg/sentinelai">Discord</a> •
  <a href="https://twitter.com/sentinelai">Twitter</a> •
  <a href="https://docs.sentinelai.dev">Docs</a>
</p>
