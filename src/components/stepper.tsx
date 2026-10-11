import { Minus, Plus } from "lucide-react";
import { trimNum } from "@/lib/utils";

export function Stepper({
  label,
  value,
  display,
  onDec,
  onInc,
}: {
  label: string;
  value: number;
  display?: string;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <div className="flex items-center gap-3">
        <button type="button" className="stepper-btn" onClick={onDec} aria-label={`Decrease ${label}`}>
          <Minus className="size-5" />
        </button>
        <p className="display min-w-0 flex-1 text-center text-3xl tabular-nums">
          {display ?? trimNum(value)}
        </p>
        <button type="button" className="stepper-btn" onClick={onInc} aria-label={`Increase ${label}`}>
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  );
}
