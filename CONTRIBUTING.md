# Contributing

Thanks for your interest in contributing to dev-mcp.

## Project Setup

```bash
# Clone and install
git clone <repo-url>
cd dev-mcp
bun install

# Set up environment
cp .env.example .env
# Edit .env with your GITHUB_TOKEN

# Verify setup
bun run typecheck
bun start
```

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run `bun run typecheck` — all diagnostics must pass
4. Commit — a pre-commit hook runs typecheck automatically
5. Push and open a pull request

## Code Standards

- **TypeScript**: strict mode, no `any`, no `@ts-ignore`/`@ts-expect-error`
- **Validation**: all tool inputs must have a Zod schema in `src/schemas/`
- **Error handling**: use the typed error hierarchy in `src/utils/errors.ts`
- **Module size**: files should stay under 250 lines; split into submodules if larger
- **Formatting**: managed by the project linter

## Pull Request Guidelines

- Keep PRs focused on a single concern
- Include a clear description of what and why
- Reference any related issues
- Ensure CI (typecheck) passes

## Adding a New Tool

1. Create a Zod schema in `src/schemas/`
2. Implement the tool logic in `src/tools/<category>/`
3. Export from the category index
4. Register in `src/index.ts`
5. Add to the tool list in `README.md`

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- For security vulnerabilities, see [SECURITY.md](SECURITY.md)
