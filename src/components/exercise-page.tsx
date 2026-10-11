import { useState } from "react";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import { ExerciseVisual } from "@/components/exercise-visual";
import { FormDetails } from "@/components/form-details";
import { doseLabel, equipmentLabel, patternLabel } from "@/lib/catalog";
import { getExercise } from "@/lib/exercises";

export function ExercisePage({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const ex = getExercise(id);
  const [paused, setPaused] = useState(false);

  if (!ex) {
    return (
      <main className="library-main">
        <button type="button" className="back-link" onClick={onBack}>
          <ChevronLeft className="size-4" />
          Movements
        </button>
        <p className="mt-6 text-sm text-muted">That movement is not in the library.</p>
      </main>
    );
  }

  return (
    <main className="library-main">
      <button type="button" className="back-link" onClick={onBack}>
        <ChevronLeft className="size-4" />
        Movements
      </button>
      <h1 className="display mt-3 text-3xl">
        {ex.name}
        {ex.shoulderInvolved ? (
          <ShieldAlert className="ml-2 inline size-5 text-danger" aria-label="Shoulder-sensitive" />
        ) : null}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {patternLabel(ex.id)} · {equipmentLabel(ex.loadType)} · {doseLabel(ex)}
      </p>
      <div className="mt-4 max-w-xl">
        <ExerciseVisual
          id={ex.id}
          paused={paused}
          onTogglePause={() => setPaused((v) => !v)}
        />
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {ex.muscles.map((muscle) => (
          <li key={muscle} className="rounded-full bg-raised px-3 py-1 text-xs text-muted">
            {muscle}
          </li>
        ))}
      </ul>
      <div className="mt-6 max-w-xl">
        <FormDetails exercise={ex} />
      </div>
    </main>
  );
}
