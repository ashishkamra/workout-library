import { useNow } from "@/hooks/use-now";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function RestTimer({
  until,
  onSkip,
  onAdd,
}: {
  until: number;
  onSkip: () => void;
  onAdd: () => void;
}) {
  const now = useNow(true);
  const remaining = Math.max(0, Math.ceil((until - now) / 1000));
  const done = remaining <= 0;

  return (
    <div className="rounded-xl bg-surface p-5 text-center shadow-[var(--shadow-border)]">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Rest</p>
      <p className="display mt-2 text-6xl tabular-nums text-fg">
        {done ? "0:00" : formatDuration(remaining)}
      </p>
      <p className="mt-2 text-sm text-muted">
        {done ? "Ready when you are." : "Breathe. Next set is coming."}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary" size="lg" onClick={onAdd}>
          +30 sec
        </Button>
        <Button size="lg" onClick={onSkip}>
          {done ? "Continue" : "Skip rest"}
        </Button>
      </div>
    </div>
  );
}
