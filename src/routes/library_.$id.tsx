import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { ExerciseVisual } from "@/components/exercise-visual";
import { FormDetails } from "@/components/form-details";
import { Screen } from "@/components/screen";
import { getExercise } from "@/lib/exercises";
import { lastExerciseLog, useAppStore } from "@/lib/store";
import { formatWeight } from "@/lib/utils";

export const Route = createFileRoute("/library_/$id")({
  component: ExerciseDetail,
});

function ExerciseDetail() {
  const { id } = Route.useParams();
  const ex = getExercise(id);
  const history = useAppStore((s) => s.workoutHistory);
  const units = useAppStore((s) => s.settings.units);
  const [paused, setPaused] = useState(false);
  const prev = lastExerciseLog(history, id);

  if (!ex) {
    return (
      <Screen>
        <p>Exercise not found.</p>
        <Link to="/library" className="mt-3 inline-block text-accent">
          Back to library
        </Link>
      </Screen>
    );
  }

  return (
    <Screen>
      <Link
        to="/library"
        className="mb-3 inline-flex h-11 items-center gap-1 text-sm text-muted"
      >
        <ChevronLeft className="size-4" /> Library
      </Link>
      <h1 className="display text-3xl">
        {ex.name}
        {ex.shoulderInvolved ? (
          <ShieldAlert className="ml-2 inline size-5 text-danger" />
        ) : null}
      </h1>
      <div className="mt-4">
        <ExerciseVisual
          id={ex.id}
          paused={paused}
          onTogglePause={() => setPaused((v) => !v)}
        />
      </div>
      <p className="mt-3 text-sm text-muted">
        {ex.timed
          ? `${ex.durationMin}–${ex.durationMax} seconds`
          : `${ex.repMin}–${ex.repMax} reps`}
        {ex.perSide ? " per side" : ""} · {ex.rest === "major" ? "90s rest" : "45–60s rest"}
      </p>
      {prev ? (
        <p className="mt-2 rounded-md bg-raised px-3 py-2 text-sm">
          Last: {formatWeight(prev.sets[0]?.weightKg ?? 0, units)} ·{" "}
          {prev.sets
            .map((s) => (ex.timed ? `${s.durationSec ?? 0}s` : String(s.reps)))
            .join(" / ")}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">No previous performance yet.</p>
      )}
      <div className="mt-5">
        <FormDetails exercise={ex} />
      </div>
    </Screen>
  );
}
