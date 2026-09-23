import { DSACategory, DSA_CATEGORIES } from "@/schemas/dsa";

interface DSACategoryBarProps {
  selectedCategory: string;
  categoryStats: { name: DSACategory; solved: number; total: number; pct: number }[];
  onSelectCategory: (cat: string) => void;
}

export function DSACategoryBar({
  selectedCategory,
  categoryStats,
  onSelectCategory,
}: DSACategoryBarProps) {
  const statsMap = new Map(categoryStats.map((c) => [c.name, c]));

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
      {/* "All Topics" Pill */}
      <button
        type="button"
        onClick={() => onSelectCategory("ALL")}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
          selectedCategory === "ALL"
            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
            : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
        }`}
      >
        <span>All Topics</span>
      </button>

      {/* Individual Categories */}
      {DSA_CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat;
        const stat = statsMap.get(cat);
        const solved = stat?.solved || 0;
        const total = stat?.total || 0;
        const pct = stat?.pct || 0;

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
              isSelected
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <span>{cat}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                isSelected
                  ? "bg-indigo-700/60 text-white"
                  : pct === 100
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
              }`}
            >
              {solved}/{total}
            </span>
          </button>
        );
      })}
    </div>
  );
}
