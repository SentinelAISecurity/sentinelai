# Security Policy

## Reporting a Vulnerability

The SentinelAI team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Do NOT open a public GitHub issue** for security vulnerabilities.

Instead, please send a detailed report to:

📧 **security@sentinelai.dev**

Encrypt your message using our PGP key:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
[Key will be published when domain is set up]
-----END PGP PUBLIC KEY BLOCK-----
```

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information (optional)

### Response Timeline

- **24 hours**: Acknowledgment of receipt
- **72 hours**: Initial assessment and confirmation
- **7 days**: Patch development
- **14 days**: Coordinated disclosure
- **30 days**: Public disclosure (if not resolved)

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x.x   | ✅        |

## Security Model

### Authentication
- Wallet-based authentication (SEP-10: Stellar Web Authentication)
- JWT tokens with short expiry (24 hours)
- Refresh token rotation
- Nonce-based replay protection

### API Security
- Rate limiting on all endpoints
- CORS whitelist
- Input validation and sanitization
- SQL injection prevention (ORM)
- XSS prevention (output encoding)

### Smart Contract Security
- OpenZeppelin contracts audited
- Comprehensive unit tests
- Invariant testing
- Gas optimization

### Infrastructure Security
- HTTPS everywhere
- Secrets management via environment variables
- Regular dependency audits
- Docker image scanning
- Least privilege principle

## Security Features

- **Audit Registry**: On-chain verification of audit reports
- **Plugin Sandboxing**: Security scanners run in isolated environments
- **Input Validation**: All user inputs are validated and sanitized
- **Content Security Policy**: CSP headers configured
- **CORS**: Strict origin checking

## Bug Bounty Program

We plan to launch a bug bounty program in the future. Subscribe to our newsletter for updates.

## Acknowledgments

We thank the following researchers and contributors for responsibly disclosing vulnerabilities:

*This list will be updated as reports are received.*

---

**Remember**: Security is everyone's responsibility. If you notice something suspicious, report it immediately.
