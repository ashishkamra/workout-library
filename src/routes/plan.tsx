import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Card, Label, Screen } from "@/components/screen";
import {
  PHASES,
  SUGGESTED_DAYS,
  TOTAL_WEEKS,
  TOTAL_WORKOUTS,
  WORKOUTS_PER_WEEK,
  phaseForWeek,
  workoutTypeAt,
} from "@/lib/program";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plan")({
  component: PlanPage,
});

function PlanPage() {
  const history = useAppStore((s) => s.workoutHistory);

  return (
    <Screen>
      <h1 className="display text-3xl">10-week plan</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Three sessions a week on non-consecutive days. Suggested: Monday, Wednesday,
        Friday. Alternate Workout A and Workout B.
      </p>

      <div className="mt-5 flex gap-1 overflow-x-auto pb-1">
        {PHASES.map((p) => (
          <div
            key={p.id}
            className="min-w-[7.5rem] rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]"
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
              Wk {p.weeks}
            </p>
            <p className="mt-1 text-sm font-medium">{p.name}</p>
          </div>
        ))}
      </div>

      <ol className="mt-6 space-y-3">
        {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
          const week = i + 1;
          const phase = phaseForWeek(week);
          const slots = [0, 1, 2].map((d) => {
            const idx = i * WORKOUTS_PER_WEEK + d;
            const type = workoutTypeAt(idx);
            const log = history[idx];
            return { idx, type, log, day: SUGGESTED_DAYS[d] };
          });
          return (
            <li key={week}>
              <Card>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="display text-xl">Week {week}</h2>
                  <Label>
                    {phase.name} · RIR {phase.rir}
                  </Label>
                </div>
                <p className="mt-2 text-sm text-muted">{phase.goal}</p>
                <p className="mt-1 text-sm text-fg">{phase.message}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {slots.map((s) => (
                    <div
                      key={s.idx}
                      className={cn(
                        "rounded-md px-2 py-3 text-center",
                        s.log ? "bg-accent/15" : "bg-raised",
                      )}
                    >
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted">
                        {s.day}
                      </p>
                      <p className="mt-1 font-medium">
                        {s.log ? (
                          <span className="inline-flex items-center gap-1">
                            {s.type}
                            <Check className="size-3.5 text-success" />
                          </span>
                        ) : (
                          s.type
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </li>
          );
        })}
      </ol>

      {history.length >= TOTAL_WORKOUTS ? (
        <p className="mt-6 text-sm text-muted">
          Program complete. Compare weight, waist, front photo, and strength numbers.
        </p>
      ) : null}

      <Link to="/checkin" className="mt-6 block text-center text-sm text-accent">
        Weekly check-in
      </Link>
    </Screen>
  );
}
