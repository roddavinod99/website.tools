# GO-PUBLIC Checklist

Website.Tools is normally a **private, solo-maintained** repository. When you
occasionally make it public, use this checklist to avoid leaks, broken
features, or unwanted contribution expectations.

> Reverse it when switching back to private.

## Before going public

### Secrets & leaks
- [ ] Confirm no `.env.*` (other than `.env.example`) is tracked:
  `git ls-files | grep -E '\.env($|\.)'`
- [ ] Run a local secret scan: `npx gitleaks detect`
- [ ] Confirm `IP_HASH_SALT` is only a GitHub secret / server `.env`, never a
      committed value.
- [ ] Review `next.config.ts` and `src/lib/data/` for any hardcoded API keys,
      publisher IDs, or tokens.

### CI / security scanning
- [ ] CodeQL job (`security.yml`) only runs when public
      (`github.repository_visibility == 'public'`) — already configured. It
      will start running automatically on the first public push.
- [ ] Advisory audit job (`test.yml`) runs only when public — already
      configured.
- [ ] Confirm Actions minutes budget still allows a full validate + build +
      Playwright run (public repos get unlimited minutes).

### Ads
- [ ] `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` set (GitHub secret / server `.env`).
- [ ] `public/ads.txt` matches your verified AdSense publisher ID.
- [ ] AdSense site verification for `tools.devstackio.com` is approved.

### SEO & indexing
- [ ] `NEXT_PUBLIC_SITE_URL=https://tools.devstackio.com` set at build.
- [ ] After deploy, confirm `https://tools.devstackio.com/sitemap.xml` and
      `robots.txt` are reachable.
- [ ] `INDEXNOW_KEY` set on the server and `/<key>.txt` is published so
      `sitemap-submitter.mjs` can submit on each deploy.

### Contribution & licensing posture
- [ ] `README.md`, `CONTRIBUTING.md`, `AUTHORS`, `MAINTAINERS` all reflect the
      solo / ad-funded / revenue-not-shared position.
- [ ] `LICENSE` (MIT) present and matching the copyright holder.
- [ ] `SECURITY.md` reporting instructions are correct.

## While public
- [ ] Watch for unexpected PRs — by policy, external contributions are
      generally not accepted (see `CONTRIBUTING.md`).
- [ ] Monitor new Issues; respond per `CONTRIBUTING.md` (no committed SLA).
- [ ] Keep an eye on Actions usage now that CodeQL/audit/advisory are active.

## When going back to private
- [ ] CodeQL / advisory jobs auto-skip (they are visibility-gated).
- [ ] Optionally remove the public repo URL from `README.md` links if
      uncertain about external visibility.

## Notes
- This file is part of the repo and travels public/private automatically.
- For anything not covered here, the Owner & Sole Maintainer ([@roddavinod99](https://github.com/roddavinod99)) has final authority.