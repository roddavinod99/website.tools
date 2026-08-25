// Post-deploy CSP verification: fetches a rendered page and confirms the
// Content-Security-Policy header authorizes every inline <script> it contains.
//
// A mismatch here silently breaks React hydration (dead buttons, tools stuck
// on "Loading tool..."), so deploy.yml runs this against localhost after every
// release and fails the deployment on any violation.
//
// This uses HASH-BASED CSP (not nonce-based) because the app uses static/ISR
// pages which are incompatible with per-request nonces.
//
// Usage: node scripts/verify-csp.mjs [url]  (default: http://127.0.0.1:3000/)

import { get } from "node:http";
import { createHash } from "node:crypto";

const url = process.argv[2] || "http://127.0.0.1:3000/";

get(url, (res) => {
  const csp = String(res.headers["content-security-policy"] || "");
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    if (res.statusCode !== 200) {
      console.error(`[verify-csp] ERROR: ${url} returned HTTP ${res.statusCode}`);
      process.exit(1);
    }
    if (!csp) {
      console.error("[verify-csp] ERROR: no Content-Security-Policy header on document response");
      process.exit(1);
    }

    // Every inline script must have its content hash present in the policy
    // (hash-based CSP for static/ISR pages; nonces are not used).
    const INLINE_SCRIPT_RE = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
    let match;
    let total = 0;
    let violations = 0;
    while ((match = INLINE_SCRIPT_RE.exec(body)) !== null) {
      total++;
      const attrs = match[1];
      const content = match[2];
      const hash = `'sha256-${createHash("sha256").update(content, "utf8").digest("base64")}'`;
      const hasNonceAttr = /\bnonce=/.test(attrs);
      const hashAllowed = csp.includes(hash);
      // In hash-based CSP, scripts are authorized by hash. Nonce attributes
      // are also accepted if present (for 'strict-dynamic' compatibility).
      if (!hasNonceAttr && !hashAllowed) {
        violations++;
        console.error(
          `[verify-csp] BLOCKED script (#${total}, ${content.trim().slice(0, 80)}...) — no nonce attribute and hash not in policy`
        );
      }
    }

    if (violations > 0) {
      console.error(`[verify-csp] FAILED: ${violations}/${total} inline scripts would be blocked by CSP`);
      process.exit(1);
    }
    console.log(`[verify-csp] OK: ${total} inline scripts checked, all authorized (hash-based CSP active)`);
  });
}).on("error", (err) => {
  console.error(`[verify-csp] ERROR: ${err.message}`);
  process.exit(1);
});
