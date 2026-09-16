import { readFileSync, existsSync } from 'node:fs';
export default function AuditPage() {
  if (!existsSync('public/admin/audit.html')) {
    return <main style={{ padding: 24 }}><h1>Tool audit</h1><p>No audit data yet. Run <code>npm run audit:tools &amp;&amp; node scripts/build-audit-dashboard.mjs</code>.</p></main>;
  }
  const html = readFileSync('public/admin/audit.html', 'utf8');
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? '';
  return <main dangerouslySetInnerHTML={{ __html: body }} />;
}
