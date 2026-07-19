# Release Management System

## Overview

This document describes the Enterprise Release & Version Management System built into this project.

## Architecture

```
scripts/release.mjs          ← CLI entry point
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
└── changelog.test.ts        ← Release notes generation tests
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

## Release Workflow

```bash
# 1. Create a release
npm run version minor

# 2. Commit the release artifacts
git add -A
git commit -m "release: v1.1.0"
git push

# 3. CI/CD automatically deploys (via GitHub Actions)
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
5. This file is compiled into the JS bundle and available to all components

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
to preserve release history at runtime.

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
