import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Screen({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <main
      className={cn(
        "min-h-[calc(100dvh-4.25rem)]",
        padded && "px-4 pt-6 pb-8",
        className,
      )}
      style={{ paddingTop: padded ? "max(1.5rem, env(safe-area-inset-top))" : undefined }}
    >
      {children}
    </main>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
      {children}
    </p>
  );
}
