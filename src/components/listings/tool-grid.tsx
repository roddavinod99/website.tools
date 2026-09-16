import { ToolCard } from '@/components/ui/tool-card';

export function ToolGrid({ tools }: { tools: Parameters<typeof ToolCard>[0]['tool'][] }) {
  return (
    <div data-testid="tool-grid" className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
      {tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
    </div>
  );
}
