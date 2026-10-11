import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, ShieldAlert } from "lucide-react";
import { Screen } from "@/components/screen";
import { ExerciseVisual } from "@/components/exercise-visual";
import { EXERCISES } from "@/lib/exercises";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
});

function LibraryPage() {
  return (
    <Screen>
      <h1 className="display text-3xl">Exercise library</h1>
      <p className="mt-2 text-sm text-muted">
        Every lift in this 10-week program. No dips, upright rows, deep push-ups, or
        heavy overhead pressing.
      </p>
      <ul className="mt-5 space-y-3">
        {EXERCISES.map((ex) => (
          <li key={ex.id}>
            <Link
              to="/library/$id"
              params={{ id: ex.id }}
              className="block overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]"
            >
              <div className="h-44 overflow-hidden bg-bg">
                <ExerciseVisual id={ex.id} className="h-44 rounded-none" />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium">
                    {ex.name}
                    {ex.shoulderInvolved ? (
                      <ShieldAlert className="ml-2 inline size-3.5 text-danger" />
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {ex.muscles.slice(0, 3).join(" · ")}
                  </p>
                </div>
                <ChevronRight className="size-4 text-subtle" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
