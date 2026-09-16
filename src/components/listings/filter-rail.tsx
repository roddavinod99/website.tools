import { categories } from '@/lib/data';

export function FilterRail() {
  return (
    <aside aria-label="Filters" role="region" className="space-y-6 text-sm">
      <div>
        <label htmlFor="filter-q" className="block text-xs text-[var(--color-text-muted)] mb-1">Search</label>
        <input id="filter-q" placeholder="Search..." className="w-full h-9 px-2 border border-[var(--color-border)] rounded-sm bg-[var(--color-bg)]" />
      </div>
      <div>
        <p className="text-xs text-[var(--color-text-muted)] mb-1">Category</p>
        <ul className="space-y-1">
          <li><button type="button" className="text-left w-full font-semibold">All</button></li>
          {categories.slice(0, 12).map((c) => (
            <li key={c.slug}><button type="button" className="text-left w-full text-[var(--color-text-muted)]">{c.name}</button></li>
          ))}
        </ul>
      </div>
      <div>
        <label htmlFor="filter-sort" className="block text-xs text-[var(--color-text-muted)] mb-1">Sort</label>
        <select id="filter-sort" defaultValue="popularity" className="w-full h-9 px-2 border border-[var(--color-border)] rounded-sm bg-[var(--color-bg)]">
          <option value="popularity">Popular</option>
          <option value="newest">Newest</option>
          <option value="alpha">A–Z</option>
        </select>
      </div>
    </aside>
  );
}
