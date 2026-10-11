import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Movements", match: (path: string) => path === "/" || path.startsWith("/library") },
  { to: "/sessions", label: "Sessions", match: (path: string) => path.startsWith("/sessions") },
] as const;

export function SiteHeader({ path }: { path: string }) {
  return (
    <header className="site-bar">
      <div className="site-bar-inner">
        <p className="wordmark text-xs text-muted">Forge</p>
        <nav aria-label="Library">
          <ul className="flex gap-1">
            {ITEMS.map((item) => {
              const active = item.match(path);
              const className = cn("nav-link", active && "is-active");
              if (import.meta.env.VITE_PAGES === "1") {
                return (
                  <li key={item.to}>
                    <a href={`#${item.to}`} className={className} aria-current={active ? "page" : undefined}>
                      {item.label}
                    </a>
                  </li>
                );
              }
              return (
                <li key={item.to}>
                  <Link to={item.to} className={className} aria-current={active ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
