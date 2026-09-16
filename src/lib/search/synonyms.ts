/**
 * Client-side synonym expansion for site search. Query terms are expanded
 * before hitting MiniSearch so jargon variants ("guid", "js", "photo")
 * find the canonical tools. No privacy impact: expansion is local.
 */
export const SYNONYMS: Record<string, string[]> = {
  js: ['javascript'],
  javascript: ['js'],
  img: ['image', 'picture', 'photo'],
  image: ['img', 'picture', 'photo'],
  picture: ['img', 'image', 'photo'],
  photo: ['img', 'image', 'picture'],
  uuid: ['guid'],
  guid: ['uuid'],
  hash: ['checksum', 'digest'],
  checksum: ['hash', 'digest'],
  digest: ['hash', 'checksum'],
  diff: ['compare'],
  compare: ['diff'],
  min: ['minify', 'compress'],
  minify: ['min', 'compress'],
  compress: ['min', 'minify'],
  pretty: ['beautify', 'format', 'prettify'],
  beautify: ['pretty', 'format', 'prettify'],
  prettify: ['pretty', 'beautify', 'format'],
  format: ['pretty', 'beautify', 'prettify'],
};

/**
 * Lowercase, tokenize, and expand a raw query into unique search terms.
 * Original tokens keep their order and come first.
 */
export function expandQuery(query: string, synonyms: Record<string, string[]> = SYNONYMS): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const token of query.toLowerCase().split(/\s+/).filter(Boolean)) {
    if (!seen.has(token)) {
      seen.add(token);
      out.push(token);
    }
    for (const syn of synonyms[token] ?? []) {
      if (!seen.has(syn)) {
        seen.add(syn);
        out.push(syn);
      }
    }
  }
  return out;
}
