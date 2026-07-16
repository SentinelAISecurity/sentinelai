# Contributing to SentinelAI

First of all, thank you for considering contributing to SentinelAI! 🎉

SentinelAI is an open-source AI-powered Web3 security platform designed to be contributor-friendly. Whether you're fixing bugs, adding features, improving docs, or building new security scanner plugins — every contribution matters.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Code Contributions](#code-contributions)
  - [Building Plugins](#building-plugins)
  - [Writing Documentation](#writing-documentation)
- [Style Guidelines](#style-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Python** >= 3.12
- **Docker** (optional but recommended)
- **Rust/Cargo** (for Soroban smart contract development)

### Setup

```bash
# Clone the repository
git clone https://github.com/sentinelai/sentinelai.git
cd sentinelai

# Install dependencies
pnpm install

# Start development environment
pnpm dev

# Or use Docker
pnpm docker:dev
```

## Development Workflow

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/my-feature`
3. **Make changes**: Write clean, well-documented code
4. **Write tests**: Add unit tests for new features
5. **Run tests**: Ensure all tests pass before committing
6. **Commit**: Use meaningful commit messages (see below)
7. **Push**: `git push origin feature/my-feature`
8. **Open a PR**: Create a detailed pull request

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add reentrancy scanner plugin
fix: resolve race condition in monitor worker
docs: update API documentation
test: add integration tests for audit flow
refactor: extract plugin loader to shared module
chore: update dependencies
style: format code with prettier
```

## Project Structure

```
sentinelai/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   ├── api/          # FastAPI backend
│   └── docs/         # Documentation site
│
├── packages/
│   ├── shared/        # Shared types, utilities
│   ├── ui/            # UI components (TailwindCSS)
│   ├── ai-engine/     # AI analysis engine
│   ├── scanners/      # Scanner framework
│   ├── monitor/       # Contract monitoring
│   ├── report-generator/ # Report generation
│   ├── sdk/           # JavaScript SDK
│   └── contracts/     # Soroban smart contracts
│
├── plugins/           # Security scanner plugins
│   ├── reentrancy/
│   ├── access-control/
│   ├── oracle/
│   └── custom/
│
├── docker/            # Docker configurations
├── .github/           # CI/CD workflows
└── docs/              # Project documentation
```

## How to Contribute

### Reporting Bugs

- Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml)
- Include steps to reproduce, expected vs actual behavior
- Attach relevant logs or screenshots
- Specify your environment (OS, Node version, etc.)

### Suggesting Features

- Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml)
- Describe the use case and potential implementation
- Indicate if you're willing to contribute

### Code Contributions

1. Pick an issue labeled [`good first issue`](https://github.com/sentinelai/sentinelai/labels/good%20first%20issue)
2. Comment on the issue to let others know you're working on it
3. Fork and create a branch
4. Make your changes
5. Submit a PR with a clear description

### Building Plugins

SentinelAI's most powerful feature is its extensible plugin system. Here's how to build one:

1. **Create a new directory** under `plugins/your-plugin-name/`
2. **Add a `manifest.json`:**

```json
{
  "name": "my-scanner",
  "version": "1.0.0",
  "type": "scanner",
  "description": "My custom vulnerability scanner",
  "author": "Your Name",
  "license": "Apache-2.0",
  "severity": "HIGH",
  "entryPoint": "scanner.py",
  "dependencies": [],
  "targets": ["soroban", "rust"],
  "config": {
    "enabled": true,
    "timeout": 30000,
    "maxMemory": 256,
    "customSettings": {}
  }
}
```

3. **Implement your scanner** (Python example):

```python
class MyScanner:
    name = "My Security Scanner"
    severity = "HIGH"
    description = "Scans for custom vulnerability patterns"

    def analyze(self, source_code: str) -> dict:
        vulnerabilities = []
        # Your analysis logic here
        return {
            "success": True,
            "vulnerabilities": vulnerabilities,
            "warnings": [],
            "metadata": {},
        }

    def recommendations(self) -> list:
        return ["Fix all issues before deploying"]

def create_plugin():
    return MyScanner()
```

4. **Submit a PR** with your plugin!

### Writing Documentation

- Use clear, concise language
- Include code examples
- Keep the documentation up to date with code changes
- PRs that update docs are always welcome!

## Style Guidelines

### TypeScript
- Use strict TypeScript
- Follow the project's ESLint and Prettier config
- Use functional components with hooks for React
- Keep files under 300 lines when possible

### Python
- Follow PEP 8
- Use type hints
- Write docstrings for public functions and classes
- Use async/await for I/O operations

### Rust/Soroban
- Follow Rust best practices and clippy linting
- Use Soroban SDK v21+ with proper authorization
- Document all public functions with doc comments
- Include comprehensive tests with `cargo test`

## Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm test --filter=@sentinelai/scanners

# Run Python tests
cd apps/api && pytest

# Run contract tests
cd packages/contracts && cargo test

# Run with coverage
pnpm test:cov
```

## Pull Request Process

1. Ensure all tests pass and the build succeeds
2. Update the CHANGELOG.md if applicable
3. Ensure documentation is updated
4. Request review from a maintainer
5. Address review feedback
6. Once approved, a maintainer will merge your PR

## Community

- **Discord**: [Join our Discord server](https://discord.gg/sentinelai)
- **Twitter**: [@sentinelai](https://twitter.com/sentinelai)
- **GitHub Discussions**: [Start a discussion](https://github.com/sentinelai/sentinelai/discussions)

---

Thank you for contributing to a safer Web3 ecosystem! 🔐
