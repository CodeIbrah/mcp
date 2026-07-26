# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x     | ✅ Yes             |

## Reporting a Vulnerability

This project handles GitHub API tokens and other credentials. If you discover a security vulnerability, please report it privately.

**Do not open a public GitHub issue.**

Send a description of the issue to the project maintainers via a [private security advisory][gh-advisory] or direct message.

You should receive a response within 48 hours. If the issue is confirmed, a fix will be released as soon as possible.

## Scope

The following are in scope:

- Exposure of authentication tokens or API keys
- Injection vulnerabilities in tool inputs
- Unintended data exposure through MCP responses
- Dependency vulnerabilities with known CVEs

## Best Practices for Users

1. Use a **GitHub Personal Access Token with minimal required scopes** (`repo` read-only, `public_repo`)
2. Never commit your `.env` file — it is already in `.gitignore`
3. Use `.env.example` as a template and keep real credentials out of version control
4. Keep dependencies updated: `bun update`

[gh-advisory]: https://docs.github.com/en/code-security/security-advisories
