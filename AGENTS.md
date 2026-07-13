# AGENTS.md

# Website.Tools – AI Agent Instructions

This document defines the architecture, standards, constraints, and rules that all AI coding agents (Claude Code, Cursor, Copilot, Gemini CLI, OpenAI Codex, etc.) must follow when modifying this repository.

---

# Project Mission

Website.Tools is a privacy-first developer tools platform providing free browser-based tools, learning resources, APIs, and developer utilities.

Primary goals:

1. Privacy First
2. Security by Default
3. Browser-First Processing
4. Excellent User Experience
5. High Performance
6. SEO-Friendly Architecture
7. Accessibility
8. Production Stability
9. Long-Term Maintainability

---

# Core Principles

## 1. User Data Never Leaves the Browser Unless Explicitly Required

Prefer:

* Client-side processing
* Web Workers
* Browser APIs
* Streaming APIs
* Local computation

Avoid:

* Uploading user files
* Persisting user data
* Server-side processing of user content

---

## 2. Security Takes Priority Over Convenience

Priority order:

1. Security
2. Privacy
3. Correctness
4. Reliability
5. Performance
6. Accessibility
7. SEO
8. Developer Convenience

Never sacrifice security for convenience.

---

## 3. Prefer Native Browser APIs

Before adding a dependency, ask:

* Can the browser do this natively?
* Can this be implemented with existing code?
* Does this increase bundle size?
* Does this create a security risk?

Avoid unnecessary dependencies.

---

# Technology Stack

* Next.js (App Router)
* TypeScript
* TailwindCSS
* Node.js
* Docker
* PM2
* Playwright
* Linux (Oracle Cloud ARM64)

---

# Repository Architecture

This repository contains:

* Developer tools
* Static pages
* Educational content
* Documentation
* APIs
* Search functionality
* Metadata generation
* Sitemap generation
* Analytics
* Feedback systems

---

# Architecture Rules

## Browser-First Architecture

Use:

* Web Workers
* Streams API
* File API
* Blob API
* Compression Streams
* Clipboard API
* IndexedDB (only if necessary)

Avoid:

* Large server computations
* Long-running backend tasks
* User file persistence
* Stateful services

---

## Stateless Infrastructure

Assume:

* Containers can restart at any time.
* Filesystem may be ephemeral.
* Multiple instances may exist.

Do not depend on:

* Local state
* Session memory
* Shared storage
* In-memory persistence

---

# File Upload Rules

Maximum upload size:

```text
10 MB
```

Never increase this without explicit approval.

Required protections:

* MIME validation
* Extension validation
* Magic number validation
* Compression ratio checks
* Zip bomb detection
* Memory limits
* Timeouts
* Nested archive limits

Never trust:

* File names
* File extensions
* MIME headers
* User-provided metadata

---

# Privacy Rules

The platform is privacy-first.

Never:

* Store uploaded files.
* Persist user data unnecessarily.
* Log file contents.
* Send user files to third-party APIs.

Prefer:

* In-memory processing
* Browser processing
* Temporary object URLs
* Immediate cleanup

Files should be deleted immediately after processing or when the user leaves the page.

---

# Security Requirements

Follow OWASP guidance.

---

## Input Validation

Every input must be:

* validated
* sanitized
* size-limited
* type-checked

---

## XSS Protection

Never:

* Trust HTML input
* Render user HTML directly
* Use dangerouslySetInnerHTML unless absolutely necessary

Sanitize:

* HTML
* SVG
* Markdown
* Rich text

---

## SSRF Protection

Never allow:

* localhost access
* private IP ranges
* metadata endpoints
* arbitrary redirects

Validate:

* URLs
* hostnames
* redirects
* resolved IP addresses

---

## API Security

Every endpoint should implement:

* rate limiting
* request size limits
* input validation
* timeout handling
* error sanitization
* structured logging

---

## Logging Rules

Never log:

* secrets
* API keys
* tokens
* uploaded file contents
* full IP addresses
* personal information

Prefer:

* redaction
* hashing
* aggregation

---

## Security Headers

Maintain:

* CSP
* HSTS
* X-Frame-Options
* Referrer-Policy
* Permissions-Policy
* X-Content-Type-Options

Never weaken security headers without justification.

---

# Performance Requirements

The site should remain lightweight and fast.

Targets:

* Lighthouse score > 90
* Fast First Contentful Paint
* Good Core Web Vitals
* Minimal JavaScript

---

## Bundle Size Rules

Avoid:

* large libraries
* duplicate packages
* unnecessary polyfills

Prefer:

* dynamic imports
* tree-shakeable packages
* browser-native APIs

---

## Tool Performance

Large file processing must:

* avoid UI freezing
* support cancellation
* use Web Workers where appropriate
* stream data whenever possible

---

# Accessibility Requirements

All features must support:

* keyboard navigation
* screen readers
* visible focus states
* semantic HTML
* proper labels
* sufficient color contrast

Follow WCAG 2.2 AA requirements.

---

# SEO Requirements

Do not remove:

* metadata generation
* structured data
* canonical URLs
* robots.txt
* sitemap.xml
* llms.txt
* OpenGraph metadata

Every page should include:

* title
* description
* canonical
* social metadata

---

# Developer Tool Requirements

Every new tool must include:

## 1. Real-World Use Case

Document:

* who uses it
* why it exists
* expected inputs
* expected outputs

---

## 2. Edge Cases

Consider:

* empty input
* malformed input
* large input
* Unicode
* invalid files
* browser limitations

---

## 3. Error Handling

Provide:

* useful messages
* graceful degradation
* recovery options

---

## 4. Accessibility

Every tool must work without a mouse.

---

## 5. Mobile Compatibility

All tools must be usable on:

* desktop
* tablet
* mobile

---

## 6. Metadata

Every tool page should include:

* metadata
* description
* structured data
* FAQ where appropriate

---

# Dependency Rules

Before installing a package:

1. Check maintenance status.
2. Check bundle size.
3. Check license.
4. Check security advisories.
5. Check browser compatibility.

Avoid dependencies for trivial functionality.

---

# Docker Rules

Containers should be:

* stateless
* non-root
* resource-limited
* restartable
* minimally privileged

Never:

* run privileged containers
* use host networking unnecessarily
* expose internal services publicly

---

# Infrastructure Rules

Deployment target:

* Oracle Cloud ARM64

All code should be:

* ARM compatible
* memory efficient
* CPU efficient

Avoid:

* x86-only binaries
* excessive memory usage
* unnecessary background workers

---

# Testing Requirements

Before submitting changes run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If available:

```bash
npm run test:e2e
```

Changes are not complete until all commands pass.

---

# AI Agent Workflow

Before making changes:

1. Understand existing architecture.
2. Search for similar implementations.
3. Reuse existing utilities.
4. Avoid duplication.

After changes:

1. Run tests.
2. Verify accessibility.
3. Verify security implications.
4. Verify performance implications.
5. Verify SEO impact.

---

# AI Agent Prohibitions

Never:

* remove security checks
* increase upload limits
* persist user files
* bypass validation
* disable rate limiting
* disable sanitization
* expose secrets
* weaken CSP
* weaken Docker security
* introduce breaking changes without justification

---

# Functional Completeness & Real-World Usability Rules

## Core Principle

**A feature is not complete because the UI exists, the build succeeds, or TypeScript passes.**

A feature is complete only when:

* All advertised functionality works.
* Real users can use it successfully.
* Edge cases are handled.
* Automated tests pass.
* Manual verification confirms expected behavior.

---

# No Demo-Only Implementations

Never implement:

* Placeholder functionality
* Mock data pretending to be real functionality
* Empty handlers
* Incomplete feature branches
* UI elements that do nothing

Forbidden patterns:

```ts
return [];
return {};
return null;
return mockData;
return exampleData;
return "Coming Soon";
```

Unless the feature is explicitly marked as:

* Experimental
* Beta
* Not Yet Implemented
* Planned

---

# Production Usability Requirement

Every tool added to this repository must be production usable.

A production-usable tool:

1. Solves a real-world problem.
2. Produces correct output.
3. Handles invalid input.
4. Handles empty input.
5. Handles large input.
6. Handles edge cases.
7. Works in major browsers.
8. Does not depend on demo data.
9. Does not expose partially implemented functionality.

---

# Functional Completeness Rules

A feature is considered broken if:

* A button does nothing.
* A dropdown option does nothing.
* A menu item produces empty output.
* A generator only works for some categories.
* Export functionality is incomplete.
* The UI claims a feature exists but it is not implemented.
* A tool returns placeholder data instead of real data.

---

# Feature Advertisement Rule

If the UI advertises a feature, that feature MUST work.

Example:

If a tool advertises:

* Random Names
* Emails
* Company Names
* Addresses
* UUIDs

Then every category must:

* Generate valid data.
* Generate multiple records.
* Produce non-empty output.
* Support all advertised options.
* Be tested.

Partially implemented categories are considered defects.

---

# Definition of Done

A feature is complete only when all of the following are true:

* [ ] UI implemented
* [ ] Business logic implemented
* [ ] All advertised features work
* [ ] All buttons work
* [ ] All dropdown options work
* [ ] Copy functionality works
* [ ] Export functionality works
* [ ] Mobile experience works
* [ ] Accessibility verified
* [ ] Edge cases handled
* [ ] Error states handled
* [ ] Tests added
* [ ] Manual verification completed

---

# Real-World Validation Requirements

Every tool must be validated against:

## Happy Path

Expected user workflow succeeds.

## Invalid Input

Malformed input is handled gracefully.

## Empty Input

The tool provides useful feedback.

## Large Input

The tool remains stable.

## Edge Cases

Boundary conditions are handled correctly.

## Browser Compatibility

The tool works in supported browsers.

---

# Tool Contract Requirement

Before implementing a tool, define:

```yaml
Tool:
Features:
Inputs:
Outputs:
Edge Cases:
Acceptance Criteria:
```

AI agents must not begin implementation until these requirements are clear.

---

# Acceptance Criteria Requirement

Every feature must have explicit acceptance criteria.

Example:

```yaml
Tool: Random Data Generator

Features:
  - Names
  - Emails
  - Companies
  - Phone Numbers
  - UUIDs

Acceptance Criteria:
  - Every category generates data
  - No category returns empty output
  - Generate 1-1000 rows
  - CSV export works
  - JSON export works
  - Copy works
  - No runtime errors
```

---

# Testing Requirement

Every tool should include automated tests for all advertised functionality.

Example:

* Select each category.
* Generate data.
* Verify output is non-empty.
* Verify output is valid.
* Verify export works.
* Verify copy works.
* Verify error handling.

---

# AI Agent Verification Rules

Never consider a task complete solely because:

* The page renders.
* The build succeeds.
* TypeScript passes.
* Lint passes.
* The UI looks correct.

A task is complete only when functionality has been verified.

---

# AI Agent Self-Review Checklist

Before submitting changes, ask:

1. Does every advertised feature actually work?
2. Can a real user successfully use this tool?
3. Did I implement business logic or only UI?
4. Did I test every option and category?
5. Does any button do nothing?
6. Does any feature return empty output?
7. Did I accidentally leave placeholder functionality?
8. Would I personally ship this feature to production?

If any answer is "No", the implementation is incomplete and must not be considered finished.

# Authoritative References

## Web Standards

* <https://developer.mozilla.org/>
* <https://html.spec.whatwg.org/>
* <https://tc39.es/ecma262/>

---

## Accessibility

* <https://www.w3.org/TR/WCAG22/>
* <https://www.w3.org/WAI/ARIA/apg/>
* <https://webaim.org/>

---

## Security

* <https://owasp.org/www-project-top-ten/>
* <https://cheatsheetseries.owasp.org/>
* <https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html>
* <https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html>
* <https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html>
* <https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html>

---

## SEO

* <https://developers.google.com/search/docs>
* <https://web.dev/vitals/>
* <https://schema.org/>

---

## Performance

* <https://web.dev/performance/>
* <https://developer.chrome.com/docs/lighthouse>

---

## Privacy

* <https://gdpr.eu/>
* <https://eur-lex.europa.eu/eli/reg/2016/679/oj>
* <https://oag.ca.gov/privacy/ccpa>

---

## Next.js

* <https://nextjs.org/docs>
* <https://nextjs.org/docs/app>
* <https://nextjs.org/docs/app/building-your-application/optimizing/metadata>
* <https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration>

---

## TypeScript

* <https://www.typescriptlang.org/docs/>
* <https://www.typescriptlang.org/tsconfig>

---

## Container Security

* <https://docs.docker.com/engine/security/>
* <https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html>
* <https://www.cisecurity.org/benchmark/docker>

---

## Final Rule

When uncertain:

1. Prefer security.
2. Prefer privacy.
3. Prefer simplicity.
4. Prefer native browser APIs.
5. Prefer maintainability.
6. Prefer documented standards over assumptions.
