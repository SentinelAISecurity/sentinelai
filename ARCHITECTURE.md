# SentinelAI Architecture

## Overview

SentinelAI is an **AI-powered Web3 security platform** designed with a modular, plugin-based architecture that makes it easy to extend and customize. The platform analyzes Soroban (Rust) smart contracts on Stellar, detects vulnerabilities, explains security issues using AI, generates professional audit reports, and monitors deployed contracts.

This document describes the system architecture, design decisions, and technical details.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SentinelAI Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Web App   │  │    Docs     │  │    API Clients      │ │
│  │  (Next.js)  │  │  (VitePress)│  │   (SDK, CLI, VS)   │ │
│  └──────┬──────┘  └─────────────┘  └──────────┬──────────┘ │
│         │                                     │             │
│         └──────────────┬──────────────────────┘             │
│                        │                                    │
│                ┌───────▼────────┐                           │
│                │   API Gateway  │                           │
│                │   (FastAPI)    │                           │
│                └───────┬────────┘                           │
│                        │                                    │
│     ┌──────────────────┼──────────────────┐                │
│     │                  │                  │                │
│  ┌──▼──────┐    ┌──────▼──────┐   ┌──────▼──────┐         │
│  │ Scanner │    │  AI Engine  │   │  Monitor    │         │
│  │ Manager │    │             │   │  Service    │         │
│  └──┬──────┘    └──────┬──────┘   └──────┬──────┘         │
│     │                  │                  │                │
│  ┌──▼──────┐           │                  │                │
│  │ Plugins │    ┌──────▼──────┐   ┌──────▼──────┐         │
│  │ Registry│    │  LLM Client │   │   Alerts    │         │
│  └─────────┘    └─────────────┘   └─────────────┘         │
│                                                              │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL  │  │    Redis    │  │  Smart Contracts │  │
│  │   (Primary)  │  │   (Cache)   │  │    (Stellar)     │  │
│  └──────────────┘  └─────────────┘  └──────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  IPFS / Filecoin                      │  │
│  │              (Decentralized Storage)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Design Principles

### 1. **Modularity**
Every component is designed as a standalone module with clear interfaces. The plugin system allows anyone to add new scanners without modifying core code.

### 2. **Separation of Concerns**
- **Scanners** detect vulnerabilities
- **AI Engine** explains and suggests fixes
- **Report Generator** produces formatted reports
- **Monitor Service** watches deployed contracts

### 3. **Provider Agnosticism**
The AI layer supports multiple providers (OpenAI, Llama, Claude, Gemini) through a unified interface.

### 4. **Clean Architecture**
Following SOLID principles with Repository Pattern, Dependency Injection, and feature-based organization.

## Component Details

### Plugin System

The plugin system is the heart of SentinelAI's extensibility.

**Interface:**
```python
class SecurityPlugin:
    name: str
    severity: str
    description: str

    def analyze(contract: str) -> PluginResult: ...
    def recommendations() -> List[str]: ...
```

**Plugin Discovery:**
- Plugins are automatically discovered from the `plugins/` directory
- Each plugin has a `manifest.json` defining its metadata
- Plugins can be enabled/disabled at runtime

**Plugin Types:**
- **Scanner**: Detects vulnerabilities (e.g., reentrancy, access control)
- **Analyzer**: Performs deep analysis (e.g., data flow, symbolic execution)
- **Monitor**: Watches on-chain activity
- **Reporter**: Generates custom report formats

### Scanner Framework

The scanner framework orchestrates plugin execution:

1. **Source Code Ingestion**: Rust/Soroban source files are parsed and normalized
2. **Plugin Execution**: Enabled plugins run in parallel
3. **Result Aggregation**: Results are merged and deduplicated
4. **Confidence Scoring**: AI validates findings and adjusts confidence

### AI Engine

The AI engine provides context-aware security analysis:

```
Source Code + Scanner Results → Prompt Template → LLM → AI Insights
```

**Capabilities:**
- Vulnerability explanation in plain English
- Exploit scenario simulation
- Fix generation with code examples
- Executive summary generation
- Interactive Q&A chat

**Prompt Templates:**
```typescript
const templates = {
  explain_vulnerability: "Given a vulnerability...",
  suggest_fix: "Suggest a secure fix for...",
  generate_summary: "Generate an executive summary...",
};
```

### Monitoring Service

Continuously monitors deployed smart contracts:

**Tracked Events:**
- Ownership transfers
- Contract pauses/unpauses
- Proxy upgrades
- Token minting/burning
- Large value transfers
- Suspicious transaction patterns

**Alert Channels:**
- In-app notifications
- Email
- Webhook
- Discord
- Telegram
- Slack

### Report Generator

Produces audit reports in multiple formats:

- **Markdown**: Human-readable with rich formatting
- **JSON**: Machine-readable for programmatic consumption
- **PDF**: Professional formal reports (via headless rendering)
- **HTML**: Interactive web-based reports

## Data Flow

### Audit Flow

```
1. User uploads Rust/Soroban source
2. Contract Parser normalizes code
3. Plugins run analysis (parallel)
4. Results aggregated
5. AI Engine processes findings
6. Report generated
7. Results stored in PostgreSQL
8. Report hash stored on-chain (optional)
9. Report uploaded to IPFS (optional)
```

### Monitoring Flow

```
1. User registers contract for monitoring
2. Monitor service starts periodic checks
3. Event detection rules evaluate on-chain data
4. Alerts generated for matching events
5. Notifications sent via configured channels
6. Alert history stored in database
```

## Database Schema

```
users
├── id (UUID)
├── address (Stellar address)
├── role (developer | researcher | admin)
├── reputation (int)
└── ...

contracts
├── id (UUID)
├── user_id → users.id
├── name
├── source_code
├── address
├── chain_id
└── ...

audits
├── id (UUID)
├── user_id → users.id
├── contract_id → contracts.id
├── status (pending | scanning | completed | failed)
├── security_score
└── ...

vulnerabilities
├── id (UUID)
├── audit_id → audits.id
├── title
├── severity (CRITICAL | HIGH | MEDIUM | LOW | INFO)
├── category
└── ...

monitors
├── id (UUID)
├── user_id → users.id
├── contract_id → contracts.id
├── chain_id
├── contract_address
└── ...

alerts
├── id (UUID)
├── monitor_id → monitors.id
├── severity
├── status (active | acknowledged | resolved)
└── ...
```

## Security Considerations

### Authentication
- Wallet-based authentication (Freighter, Stellar wallets)
- JWT access tokens (24h expiry)
- Refresh token rotation
- Nonce-based challenge-response

### API Security
- Rate limiting (per IP and per user)
- CORS configured for allowed origins
- Input validation via Pydantic schemas
- SQL injection prevention via SQLAlchemy ORM
- XSS prevention via output encoding

### Smart Contract Security
- Follow Stellar standards
- Comprehensive test suite with `cargo test`
- Formal verification (planned)
- Upgradable patterns where appropriate

## Performance

### Optimization Strategies
- **Caching**: Redis for frequent reads (plugin results, dashboard stats)
- **Parallel Processing**: Plugins run concurrently
- **Lazy Loading**: Frontend code splitting and dynamic imports
- **Database Indexing**: Optimized queries on frequently accessed columns
- **Connection Pooling**: PostgreSQL connection pool management

### Scalability
- Horizontal scaling via stateless API design
- Plugin execution can be distributed across workers
- Celery task queue for async processing
- Read replicas for heavy dashboard queries

## Future Architecture

- **Multi-chain Support**: Abstract blockchain interactions
- **AI Model Fine-tuning**: Train on security audit datasets
- **Distributed Plugin Network**: Plugins as microservices
- **Threat Intelligence Feed**: Community-driven vulnerability database
- **Zero-Knowledge Proofs**: Private audit verification
- **Cross-chain Monitoring**: Unified monitoring across L1s and L2s
