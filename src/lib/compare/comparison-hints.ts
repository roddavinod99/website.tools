export const COMPARISON_HINTS: Record<string, { a: string; b: string; verdict: string }> = {
  'json-formatter|xml-formatter': {
    a: 'APIs, JS/TS apps, config files, anything that talks to a web service.',
    b: 'Documents, RSS/Atom feeds, SOAP, Microsoft Office formats, older enterprise stacks.',
    verdict: 'JSON wins for new web work; XML still required for many enterprise integrations.',
  },
  'json-formatter|yaml-formatter': {
    a: 'Strict structure, programmatic generation, every JSON library in every language.',
    b: 'Human-authored config (Kubernetes, GitHub Actions, Docker Compose), comments allowed.',
    verdict: 'JSON for data interchange; YAML for config that humans edit.',
  },
};
