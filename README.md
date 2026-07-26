# dev-mcp

A local MCP (Model Context Protocol) server that gives AI agents access to developer tooling — GitHub (read-only), documentation search, and web research — via stdio transport.

Built with [Bun][bun], [TypeScript][ts], the [MCP SDK][mcp-sdk], and [Zod][zod].

## Features

### GitHub (read-only)
| Tool | Description |
|---|---|
| `github.repo_search` | Search repositories by query |
| `github.repo_read` | Get repository details |
| `github.file_read` | Read a file from a repository |
| `github.issues_list` | List issues with state/label filters |
| `github.issue_get` | Get a single issue |
| `github.prs_list` | List pull requests |
| `github.pr_diff` | Get the diff of a pull request |
| `github.commit_search` | Search commits by message or author |

### Context7 Documentation Search
| Tool | Description |
|---|---|
| `context7.docs_search` | Search library documentation |
| `context7.docs_get` | Get specific documentation page |
| `context7.examples_get` | Get code examples |
| `context7.api_lookup` | Look up API symbol documentation |

### Exa Web Research
| Tool | Description |
|---|---|
| `exa.web_search` | Search the web |
| `exa.web_fetch` | Fetch and convert a URL to markdown/text |
| `exa.code_search` | Search code across GitHub |
| `exa.research_brief` | Generate a research brief by synthesizing top results |

Total: **16 tools**

## Prerequisites

- [Bun] 1.3+ (runtime)
- A [GitHub Personal Access Token][gh-token] with `repo` (read-only) and `public_repo` scopes

## Quick Start

```bash
# Install dependencies
bun install

# Create your environment file
cp .env.example .env
# Edit .env and set GITHUB_TOKEN

# Run typecheck
bun run typecheck

# Start the server
bun start
```

The server listens on stdio, ready to receive MCP JSON-RPC messages.

## Configuration

All configuration is via environment variables:

| Variable | Required | Default | Description |
|---|---|---|---|
| `GITHUB_TOKEN` | Yes | — | GitHub PAT (read-only access) |
| `CONTEXT7_API_KEY` | No | — | Context7 API key |
| `EXA_API_KEY` | No | — | Exa API key |
| `SENTRY_DSN` | No | — | Sentry DSN for error reporting |
| `SENTRY_ENVIRONMENT` | No | `development` | Sentry environment tag |
| `LOG_LEVEL` | No | `info` | Log level (`debug`, `info`, `warn`, `error`) |
| `NODE_ENV` | No | `development` | Runtime environment |

## Architecture

```
src/
├── config/        # Environment validation (Zod schema)
├── core/          # MCP server, tool registry, transport
├── observability/ # Logger, Sentry integration
├── schemas/       # Zod schemas for all tool inputs
├── security/      # Input validation wrapper
├── tools/
│   ├── context7/  # Documentation search tools
│   ├── exa/       # Web search & research tools
│   └── github/    # GitHub API tools
└── utils/         # Error hierarchy (McpError)
```

## Development

```bash
bun run typecheck    # Type-check all files
bun start            # Start the server (stdio)
```

The project uses [Husky][husky] for pre-commit hooks and [Turbo][turbo] for task orchestration. A `typecheck` hook runs automatically before each commit.

## License

MIT — see [LICENSE](LICENSE).

[bun]: https://bun.sh
[ts]: https://typescriptlang.org
[mcp-sdk]: https://github.com/modelcontextprotocol/typescript-sdk
[zod]: https://zod.dev
[gh-token]: https://github.com/settings/tokens
[husky]: https://typicode.github.io/husky
[turbo]: https://turbo.build
