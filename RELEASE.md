# Release Management System

## Overview

This document describes the Enterprise Release & Version Management System built into this project.

## Architecture

```
scripts/release.mjs          ← CLI entry point (manual/interactive)
scripts/auto-release.mjs     ← Auto-release CLI (CI-driven, conventional commits)
scripts/lib/auto-version.mjs ← Pure functions for commit parsing/version computation
src/lib/version/
├── types.ts                 ← All type definitions
├── validation.ts            ← SemVer parsing, validation, comparison
├── git.ts                   ← Git information reader
├── version.ts               ← Version CRUD (read/increment/bump package.json)
├── build.ts                 ← Build metadata generator
├── release.ts               ← Release manifest CRUD
├── changelog.ts             ← CHANGELOG.md parser and appender
└── __generated__/
    └── release-data.ts      ← Auto-generated build-time constants

src/app/
├── api/version/route.ts     ← /api/version REST endpoint
└── admin/releases/page.tsx  ← Release history admin page

src/components/version/
├── version-badge.tsx        ← Reusable version badge component
└── version-history.tsx      ← Release history list component

data/
├── release.json             ← Current release manifest (generated)
├── releases/                ← Archived release manifests (generated)
└── build-number.json        ← Auto-incrementing build counter (generated)

tests/version/
├── validation.test.ts       ← SemVer/release/duplicate validation tests
├── changelog.test.ts        ← Release notes generation tests
└── auto-release.test.ts     ← Auto-version commit parsing tests
```

## CLI Usage

### Interactive Mode

```bash
npm run version
```

Prompts for:
1. Release type: `major`, `minor`, `patch`, or `custom`
2. Changelog entries in `[Category] description` format
3. Confirmation before applying

### Non-Interactive Mode

```bash
npm run version -- patch --entry "[Fixed] Login timeout"
npm run version -- minor --file changes.txt
```

### Local Version Bump (before commit)

Version bumping is done **locally on your laptop** before committing, not during deployment. Run the auto-release at the end of each working session so the version + changelog are updated and committed **before** you push:

```bash
# Dry run (shows what would happen; requires git history)
npm run version:auto -- --dry-run --verbose

# Actual auto-release (bumps version, changelog, data/, and prebuild data)
npm run version:auto

# Commit the release artifacts locally, then push
git add -A
git commit -m "release: vX.Y.Z"
git push origin main
```

The deploy workflow (`.github/workflows/deploy.yml`) **does not** bump or commit versions. It only pulls `main` and builds/deploys whichever version is already committed — so there is never a second writer to the version files and no version merge conflicts.

**Conventional commit mapping:**

| Commit Prefix | Release Type | Changelog Category |
|---------------|--------------|-------------------|
| `feat:` / `feat(scope):` | minor | Added |
| `feat!:` / `BREAKING CHANGE` | major | Changed |
| `fix:` / `chore:` / `docs:` / `perf:` / `refactor:` / `build:` / `ci:` / `test:` / `style:` / `security:` | patch | Fixed / Infrastructure / Documentation / Performance / Refactored / Security / Changed |
| Non-conventional (e.g. "New updates") | patch | Changed |

Run locally for testing:

```bash
# Dry run (shows what would happen)
npm run version:auto -- --dry-run --verbose

# Actual auto-release (requires git history)
npm run version:auto
```

## Release Workflow

```bash
# 1. Create a release locally (before commit)
npm run version minor

# 2. Commit the release artifacts, then push
git add -A
git commit -m "release: v1.1.0"
git push

# 3. CI/CD automatically deploys the committed version (via GitHub Actions)
```

**Local workflow (recommended):**

```bash
# Do work, then at end of session bump + commit before pushing
git add -A
npm run version:auto        # bumps version, changelog, data/, prebuild data
git add -A
git commit -m "release: vX.Y.Z"
git push origin main        # CI builds/deploys this exact version — no version conflict
```

## Version Schema

Strict SemVer: `major.minor.patch[-prerelease][+build]`

- **Major**: Breaking changes (`1.0.0` → `2.0.0`)
- **Minor**: New features, backward compatible (`1.0.0` → `1.1.0`)
- **Patch**: Bug fixes, backward compatible (`1.0.0` → `1.0.1`)

## Changelog Categories

| Category | CLI Prefix | Description |
|----------|-----------|-------------|
| Added | `[Added]` | New features |
| Fixed | `[Fixed]` | Bug fixes |
| Changed | `[Changed]` | Changes in existing functionality |
| Removed | `[Removed]` | Removed features |
| Security | `[Security]` | Security fixes |
| Performance | `[Performance]` | Performance improvements |
| Refactored | `[Refactored]` | Code refactoring |
| Infrastructure | `[Infrastructure]` | CI/CD, tooling |
| SEO | `[SEO]` | Search engine optimization |
| Accessibility | `[Accessibility]` | A11y improvements |
| DX | `[DX]` | Developer experience |
| Documentation | `[Documentation]` | Documentation changes |

## API

### `GET /api/version`

Returns build metadata:

```json
{
  "version": "1.0.0",
  "build": 42,
  "commit": "a1b2c3d",
  "branch": "main",
  "buildDate": "2026-07-20T00:00:00.000Z",
  "environment": "production"
}
```

### `GET /api/health` (extended)

Now includes `version`, `build`, `commit`, and `environment` fields.

## Build Integration

The `prebuild` script (`scripts/prebuild.mjs`) runs automatically before `next build`. It:

1. Reads current version from `package.json`
2. Reads build number from `data/build-number.json`
3. Reads git info (commit hash, branch, dirty state)
4. Generates `src/lib/version/__generated__/release-data.ts` with all metadata
5. Generates `public/analytics-init.js` from `NEXT_PUBLIC_GA_ID` (baking GA ID at build time)
6. This file is compiled into the JS bundle and available to all components

The `postbuild-csp` script (`scripts/postbuild-csp.mjs`) runs automatically after `next build` (see package.json build script). It:

- Computes SHA-256 hashes of every inline `<script>` and `<style>` in statically rendered HTML
- Emits per-route CSP map to `data/csp-hashes.json` and Nginx map to `nginx/csp.generated.conf`
- Each route gets only its needed hashes, keeping headers under browser/Nginx limits
- `/tools/*` routes additionally allow `'wasm-unsafe-eval'` and `'unsafe-eval'` (for BenchmarkBuilder)

## UI Components

### VersionBadge

```tsx
import { VersionBadge } from "@/components/version/version-badge";

// Full badge (version, build, commit, environment)
<VersionBadge />

// Compact badge (version + build only)
<VersionBadge compact showEnv={false} showCommit={false} />
```

### VersionHistory

```tsx
import { VersionHistory } from "@/components/version/version-history";

<VersionHistory releases={archives} currentVersion="1.0.0" />
```

## Changelog Categories & Mappings

| Changelog Category | Release Manifest Field | Change Level |
|---|---|---|
| added | features | Minor |
| fixed | fixes | Patch |
| changed | breakingChanges | Major |
| removed | breakingChanges | Major |
| security | security | Patch/Minor |
| performance | performance | Patch |
| infrastructure | infrastructure | Patch/Minor |
| other types | — | — |

## Deployment

The `data/` directory is copied into the standalone build output during CI/CD
to preserve release history at runtime. The following files are tracked in git:
- `data/release.json` — current release manifest
- `data/build-number.json` — auto-incrementing build counter
- `data/releases/*.json` — archived release manifests

### Rollback

To roll back to a previous release:

```bash
# Find the target version
cat data/releases/1.0.0.json

# Checkout the corresponding git tag or commit
git checkout <commit-hash>

# Rebuild and redeploy
npm ci
npm run build
pm2 restart tools
```
