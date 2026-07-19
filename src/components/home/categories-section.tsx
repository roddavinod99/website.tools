import { categories } from "@/lib/constants";
import { CategoryCard } from "@/components/ui/category-card";

export function CategoriesSection() {
  return (
    <section className="container py-16 md:py-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text sm:text-3xl">
            Browse by Category
          </h2>
          <p className="mt-1 text-surface-500 dark:text-dark-muted">
            Find the right tool for any task
          </p>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.slice(0, 15).map((cat) => (
          <CategoryCard
            key={cat.id}
            name={cat.name}
            description={cat.description}
            slug={cat.slug}
            toolCount={cat.toolCount}
            icon={cat.icon}
            color={cat.icon} // color is determined by name in component
            variant="home"
          />
        ))}
      </div>
    </section>
  );
}