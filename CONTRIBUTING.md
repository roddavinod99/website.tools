# Contributing

Thank you for considering contributing to DevStackIO! We welcome contributions of all kinds — bug fixes, new tools, documentation improvements, and feature requests.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Adding a New Tool](#adding-a-new-tool)
5. [Pull Request Guidelines](#pull-request-guidelines)
6. [Style Guide](#style-guide)
7. [Testing](#testing)

## Code of Conduct

This project adheres to the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct. By participating, you agree to maintain a respectful and inclusive environment.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/tools.git`
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Open http://localhost:3000

## Development Workflow

```
1. Create a branch: git checkout -b feature/my-feature
2. Make changes
3. Run lint: npm run lint
4. Run typecheck: npx tsc --noEmit
5. Run build: npm run build
6. Run tests: npm test
7. Commit: git commit -m "feat: description"
8. Push: git push origin feature/my-feature
9. Open a pull request
```

### Branch Naming

- `feat/` — New features or tools
- `fix/` — Bug fixes
- `docs/` — Documentation changes
- `perf/` — Performance improvements
- `security/` — Security fixes
- `chore/` — Maintenance tasks

## Adding a New Tool

1. **Add tool definition** in `src/lib/constants.ts` (add to `allTools` array)
2. **Create tool component** in `src/components/tools/` (name matches slug)
3. **Register in tool-interface.tsx** — add `React.lazy` import
4. **Add tool content** in `src/lib/tool-content.ts` (descriptions, use cases, FAQ)
5. **Add test data** in `tests/fixtures/` (if applicable)
6. **Verify** — page auto-generates via `generateStaticParams`

### Tool Component Requirements

- Must be a client component (`"use client"`)
- Must export a named function matching the tool name
- Must handle empty state, error state, and edge cases
- Must be keyboard accessible
- Must work on mobile (responsive design)
- Must not send data to any server (privacy-first)

## Pull Request Guidelines

- Keep PRs focused — one feature/fix per PR
- Update documentation if needed
- Add or update tests
- Ensure all checks pass (lint, typecheck, build, tests)
- Follow the PR template

## Style Guide

- **TypeScript** — Strict mode, no `any` where avoidable
- **Components** — Functional with hooks, no class components
- **CSS** — Tailwind utility classes, no custom CSS files
- **Imports** — Group by: React/Next → libraries → local
- **Naming** — PascalCase for components, camelCase for functions/variables

## Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:security
npm run test:a11y
npm run test:api
npm run test:tools

# Run Playwright in UI mode
npx playwright test --ui
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
