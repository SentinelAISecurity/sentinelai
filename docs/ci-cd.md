# SentinelAI CI/CD Pipeline

This document describes the continuous integration and delivery pipeline for SentinelAI. The pipeline runs on every push to `main` and every pull request targeting `main`.

## Quick Reference

| Job | Trigger | Runtime | What it checks |
|-----|---------|---------|----------------|
| **Lint & Typecheck** | push, PR | ~30s | ESLint + TypeScript compilation across all packages |
| **Test (matrix)** | push, PR | ~20s each | Unit tests for each JS/TS package |
| **Test API** | push, PR | ~30s | Python FastAPI tests with PostgreSQL + Redis |
| **Test Contracts** | push, PR | ~1m | Soroban Rust contract tests via `cargo test` |
| **Security** | push, PR | ~15s | CodeQL analysis for JS/TS + Python |

## Job Details

### 1. Lint & Typecheck

**File**: `.github/workflows/ci.yml` → `lint` job

Runs ESLint and TypeScript typechecking across all packages in the monorepo. This job must pass before considering the codebase healthy.

**Steps**:
1. Checkout the repository
2. Set up pnpm v9 and Node.js 20
3. Install the Rust toolchain (`wasm32-unknown-unknown` target for contracts)
4. Install dependencies (`pnpm install --frozen-lockfile`)
5. Build all packages except contracts (`pnpm build --filter=./packages/* --filter=!@sentinelai/contracts`)
6. Run ESLint (`pnpm lint`)
7. Run TypeScript typechecking (`pnpm typecheck`)

**Why contracts are excluded from build**: Contracts use `soroban contract build` which requires the Soroban CLI. Building contracts in CI would require installing the Soroban CLI, which is slow (~15 minutes to compile from source). Contract compilation is covered by the Test Contracts job instead.

### 2. Test (Matrix)

**File**: `.github/workflows/ci.yml` → `test` job

Runs unit tests for each JavaScript/TypeScript package in parallel using a GitHub Actions matrix strategy.

**Current packages in the matrix**:
- `@sentinelai/shared` — Shared types, utilities, validators, constants
- `@sentinelai/scanners` — Vulnerability scanner framework with plugin support
- `@sentinelai/report-generator` — Audit report generation (Markdown, JSON, HTML)
- `@sentinelai/ai-engine` — AI vulnerability explanation, fix suggestions, summaries
- `@sentinelai/monitor` — Stellar Horizon contract monitoring and alerting

**Steps per package**:
1. Checkout + pnpm setup + install (`--frozen-lockfile`)
2. Run tests: `pnpm test --filter=<package>`

**Key configuration**: `fail-fast: false` ensures one failing package doesn't cancel the rest.

**How tests are discovered**: Each package has a `vitest.config.ts` that points to `src/**/*.test.ts`. Vitest discovers test files automatically.

### 3. Test API

**File**: `.github/workflows/ci.yml` → `test-api` job

Runs Python FastAPI tests with PostgreSQL and Redis service containers.

**Services**:
- **PostgreSQL 16** — Database for API integration tests
- **Redis 7** — Cache for rate limiting and session management

**Steps**:
1. Checkout + Python 3.12 setup
2. Install dependencies from `apps/api/requirements.txt` + install `pytest`, `pytest-asyncio`, `pytest-cov`
3. Run `python -m pytest --cov=app --cov-report=xml`

**Graceful no-tests handling**: If no test files are collected (exit code 5), the job emits a warning instead of failing. This allows the CI to pass while the test suite is being built out.

**Where to add tests**: Create test files in `apps/api/tests/` using the naming convention `test_*.py`.

### 4. Test Contracts

**File**: `.github/workflows/ci.yml` → `test-contracts` job

Runs Soroban Rust smart contract tests.

**Steps**:
1. Checkout + Rust toolchain with `wasm32-unknown-unknown` target
2. Run `cargo test` in `packages/contracts/`

**Contract test location**: `packages/contracts/src/test.rs` — Rust unit tests for the AuditRegistry contract.

### 5. Security

**File**: `.github/workflows/ci.yml` → `security` job

Runs security analysis on the codebase.

**Security scanning layers**:

| Layer | Tool | What it covers |
|-------|------|---------------|
| Code analysis | CodeQL | JS/TS + Python source code vulnerabilities |
| Dependency updates | Dependabot | Automated PRs for vulnerable npm/pip/action dependencies |

**Steps**:
1. Checkout + pnpm + Node.js setup + install
2. Dependency audit notice (CLI audit is skipped — npm registry endpoint retired)
3. Initialize and run CodeQL analysis for JavaScript/TypeScript and Python

**Note about dependency auditing**: The `pnpm audit` CLI command returns HTTP 410 (Gone) because the npm registry retired the v1 audit endpoint. Dependency vulnerability monitoring is handled by [Dependabot](https://github.com/features/security) instead, which automatically opens PRs for vulnerable packages.

## Trigger Rules

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

The pipeline runs on:
- Every push to the `main` branch
- Every pull request targeting `main`

**Concurrency**: If a new push occurs while a previous run is still in progress, the previous run is automatically cancelled (`cancel-in-progress: true`).

## How To

### Add a new JS/TS package to the test matrix

1. **Ensure the package has test scripts and vitest** in its `package.json`:
   ```json
   {
     "scripts": {
       "test": "vitest run"
     },
     "devDependencies": {
       "vitest": "^2.0.4"
     }
   }
   ```

2. **Add a vitest config** if it doesn't exist (`packages/<name>/vitest.config.ts`):
   ```typescript
   import { defineConfig } from "vitest/config";
   export default defineConfig({
     test: {
       globals: true,
       environment: "node",
       include: ["src/**/*.test.ts"],
     },
   });
   ```

3. **Add the package to the test matrix** in `.github/workflows/ci.yml`:
   ```yaml
   test:
     strategy:
       matrix:
         package:
           # ... existing packages ...
           - "@sentinelai/my-new-package"  # Add here
   ```

4. **Verify the package builds**: Ensure `tsconfig.json` is properly configured and the package has `@types/node` in `devDependencies` if it uses Node.js APIs.

### Add a new Python test file

1. Create the test file at `apps/api/tests/test_<name>.py`
2. Follow pytest conventions — test functions must start with `test_`
3. Run locally to verify: `cd apps/api && python -m pytest`

### Debug a failing CI job

1. **Read the error log** in the GitHub Actions UI — the specific step that failed will be highlighted
2. **Check the lockfile**: If `pnpm install --frozen-lockfile` fails, run `pnpm install --no-frozen-lockfile` locally and commit the updated `pnpm-lock.yaml`
3. **Reproduce locally**: Run the same command the CI runs (see each job's `run:` field)
4. **Check type errors**: Run `npx turbo run typecheck --force` to see all type errors across packages
5. **Run a single package's tests**: `pnpm test --filter=@sentinelai/<package>`

### Regenerate the lockfile

If you add, remove, or update a dependency:

```bash
pnpm install --no-frozen-lockfile
git add pnpm-lock.yaml
git commit -m "chore: update pnpm-lock.yaml"
```

**Always commit the lockfile.** CI uses `--frozen-lockfile` which fails on any mismatch.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      CI Pipeline                         │
├─────────────┬──────────┬──────────┬──────────┬──────────┤
│  Lint &     │  Test    │  Test    │  Test    │ Security │
│  Typecheck  │ (matrix) │  API     │Contracts │          │
├─────────────┼──────────┼──────────┼──────────┼──────────┤
│ ESLint      │ shared   │ FastAPI  │ cargo    │ CodeQL   │
│ TypeScript  │ scanners │ pytest   │ test     │ JS/TS    │
│ Rust setup  │ ai-eng   │ Postgres │ Rust SDK │ Python   │
│ Build pkgs  │ report   │ Redis    │          │          │
│             │ monitor  │          │          │ Dependa- │
│             │          │          │          │ bot (ext)│
└─────────────┴──────────┴──────────┴──────────┴──────────┘
```

## Environment Variables

The following variables are hardcoded in the workflow for testing purposes. No GitHub Secrets are required for CI.

| Variable | Used by | Hardcoded value |
|----------|---------|-----------------|
| `DATABASE_URL` | Test API | `postgresql+asyncpg://sentinelai:sentinelai@localhost:5432/sentinelai_test` |
| `REDIS_URL` | Test API | `redis://localhost:6379/0` |
| `JWT_SECRET` | Test API | `test-secret` |

## Related Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Main CI pipeline definition |
| `.github/workflows/release.yml` | Release workflow |
| `.github/workflows/docs.yml` | Documentation build and deploy |
| `.github/dependabot.yml` | Automated dependency updates |
| `turbo.json` | Turborepo task orchestration |
