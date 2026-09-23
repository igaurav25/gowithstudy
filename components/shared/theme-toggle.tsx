"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse", className)} />
    );
  }

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label="Toggle display theme"
      title={`Current theme: ${theme} (Click to switch)`}
      className={cn(
        "relative p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all duration-200 border border-zinc-200/80 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
        className
      )}
    >
      {theme === "light" && <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 rotate-0 scale-100" />}
      {theme === "dark" && <Moon className="w-4 h-4 text-indigo-400 transition-transform duration-200 rotate-0 scale-100" />}
      {theme === "system" && <Laptop className="w-4 h-4 text-zinc-500 transition-transform duration-200 rotate-0 scale-100" />}
    </button>
  );
}
