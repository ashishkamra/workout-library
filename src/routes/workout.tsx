import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronLeft, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseVisual } from "@/components/exercise-visual";
import { FormDetails } from "@/components/form-details";
import { RestTimer } from "@/components/rest-timer";
import { Stepper } from "@/components/stepper";
import { useNow } from "@/hooks/use-now";
import { getExercise, TEMPO_LINES } from "@/lib/exercises";
import {
  isFlexibleWeek10,
  isReadyToIncrease,
  phaseForWeek,
  setsForExercise,
  SHOULDER_STOP_RULES,
  WARMUP_STEPS,
  workoutExercises,
} from "@/lib/program";
import { lastExerciseLog, useAppStore } from "@/lib/store";
import type { ActiveWorkout, ExerciseDef, ExerciseLog, SetLog } from "@/lib/types";
import { formatDuration, formatWeight, todayISO, trimNum } from "@/lib/utils";

export const Route = createFileRoute("/workout")({
  component: WorkoutPage,
});

function WorkoutPage() {
  const navigate = useNavigate();
  const active = useAppStore((s) => s.activeWorkout);
  const setActive = useAppStore((s) => s.setActiveWorkout);
  const history = useAppStore((s) => s.workoutHistory);
  const settings = useAppStore((s) => s.settings);
  const completeWorkout = useAppStore((s) => s.completeWorkout);

  if (!active) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-muted">No workout in progress.</p>
        <Button className="mt-4" onClick={() => void navigate({ to: "/" })}>
          Back home
        </Button>
      </div>
    );
  }

  const exercises = workoutExercises(
    active.workoutType,
    active.useBulgarian,
    active.week,
  ).map((ex) =>
    active.swappedSidePlank && ex.id === "side-plank"
      ? (getExercise("dead-bug") as ExerciseDef)
      : ex,
  );

  const phase = phaseForWeek(active.week);

  function patch(p: Partial<ActiveWorkout>) {
    setActive((prev) => (prev ? { ...prev, ...p } : prev));
  }

  if (!active.warmupComplete) {
    return (
      <Warmup
        active={active}
        onDone={() => patch({ warmupComplete: true })}
        onPatch={patch}
        onQuit={() => {
          setActive(null);
          void navigate({ to: "/" });
        }}
      />
    );
  }

  if (active.exerciseIndex >= exercises.length) {
    return (
      <Complete
        active={active}
        exercises={exercises}
        onSave={(difficulty, shoulderPain) => {
          completeWorkout({
            date: todayISO(),
            week: active.week,
            workoutType: active.workoutType,
            durationSec: Math.round((Date.now() - active.startedAt) / 1000),
            difficulty,
            shoulderPain,
            exercises: active.logs,
            swappedSidePlank: active.swappedSidePlank,
          });
          void navigate({ to: "/" });
        }}
      />
    );
  }

  const ex = exercises[active.exerciseIndex];
  const targetSets = setsForExercise(ex.id, active.week);
  const log =
    active.logs.find((l) => l.exerciseId === ex.id) ??
    ({ exerciseId: ex.id, sets: [] } satisfies ExerciseLog);
  const prev = lastExerciseLog(history, ex.id);
  const resting =
    active.restUntil !== null && active.restExerciseIndex === active.exerciseIndex;

  return (
    <LiveExercise
      key={ex.id}
      active={active}
      ex={ex}
      index={active.exerciseIndex}
      total={exercises.length}
      targetSets={targetSets}
      log={log}
      prev={prev}
      resting={resting}
      phaseNote={phase.message}
      units={settings.units}
      restSec={ex.rest === "major" ? settings.restMajorSec : settings.restMinorSec}
      onPatch={patch}
      onSwapDeadBug={() =>
        patch({ swappedSidePlank: true, logs: active.logs.filter((l) => l.exerciseId !== "side-plank") })
      }
      onQuit={() => {
        setActive(null);
        void navigate({ to: "/" });
      }}
    />
  );
}

function Warmup({
  active,
  onDone,
  onPatch,
  onQuit,
}: {
  active: ActiveWorkout;
  onDone: () => void;
  onPatch: (p: Partial<ActiveWorkout>) => void;
  onQuit: () => void;
}) {
  const step = WARMUP_STEPS[active.warmupStep] ?? WARMUP_STEPS[0];
  const now = useNow(!!step.seconds);
  const elapsed = Math.floor((now - active.warmupStepStartedAt) / 1000);
  const remain = step.seconds ? Math.max(0, step.seconds - elapsed) : null;
  const [paused, setPaused] = useState(false);

  function next() {
    if (active.warmupStep >= WARMUP_STEPS.length - 1) {
      onDone();
      return;
    }
    onPatch({
      warmupStep: active.warmupStep + 1,
      warmupStepStartedAt: Date.now(),
    });
  }

  return (
    <main
      className="px-4 pb-10"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
    >
      <TopBar title="Warm-up · 7 minutes" onQuit={onQuit} />
      <p className="mb-3 text-sm text-muted">
        Step {active.warmupStep + 1} of {WARMUP_STEPS.length}
      </p>
      <ExerciseVisual
        id={step.visualId}
        paused={paused}
        onTogglePause={() => setPaused((v) => !v)}
      />
      <h2 className="display mt-4 text-2xl">{step.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{step.detail}</p>
      {remain !== null ? (
        <p className="display mt-4 text-5xl tabular-nums">{formatDuration(remain)}</p>
      ) : (
        <p className="mt-4 text-lg text-accent">{step.reps}</p>
      )}
      <Button size="xl" className="mt-6 w-full" onClick={next}>
        {active.warmupStep >= WARMUP_STEPS.length - 1 ? "Warm-up complete" : "Next"}
      </Button>
      <button
        type="button"
        className="mt-3 w-full py-3 text-sm text-muted"
        onClick={onDone}
      >
        Skip remaining warm-up
      </button>
    </main>
  );
}

function LiveExercise({
  active,
  ex,
  index,
  total,
  targetSets,
  log,
  prev,
  resting,
  phaseNote,
  units,
  restSec,
  onPatch,
  onSwapDeadBug,
  onQuit,
}: {
  active: ActiveWorkout;
  ex: ExerciseDef;
  index: number;
  total: number;
  targetSets: number;
  log: ExerciseLog;
  prev: ReturnType<typeof lastExerciseLog>;
  resting: boolean;
  phaseNote: string;
  units: "metric" | "imperial";
  restSec: number;
  onPatch: (p: Partial<ActiveWorkout>) => void;
  onSwapDeadBug: () => void;
  onQuit: () => void;
}) {
  const lastSet = log.sets[log.sets.length - 1];
  const lastHist = prev?.sets[prev.sets.length - 1];
  const [weight, setWeight] = useState(
    lastSet?.weightKg ?? lastHist?.weightKg ?? ex.defaultWeightKg,
  );
  const [reps, setReps] = useState(
    lastSet?.reps ?? lastHist?.reps ?? ex.repMin,
  );
  const [duration, setDuration] = useState(
    lastSet?.durationSec ?? lastHist?.durationSec ?? ex.durationMin ?? 30,
  );
  const [showForm, setShowForm] = useState(false);
  const [paused, setPaused] = useState(false);
  const cue = ex.cues[log.sets.length % ex.cues.length];
  const flexible = isFlexibleWeek10(ex.id, active.week);
  const setsDone = log.sets.length;
  const canFinishEarly = flexible && setsDone >= 2;
  const ready = isReadyToIncrease(
    log.sets.map((s) => (ex.timed ? s.durationSec ?? 0 : s.reps)),
    ex.repMax,
  );

  function completeSet() {
    const set: SetLog = ex.timed
      ? { weightKg: ex.loadType === "bodyweight" ? 0 : weight, reps: 0, durationSec: duration }
      : { weightKg: ex.loadType === "bodyweight" ? 0 : weight, reps };
    const nextLog = { ...log, sets: [...log.sets, set] };
    const finished = nextLog.sets.length >= targetSets;
    useAppStore.getState().setActiveWorkout((prevW) => {
      if (!prevW) return prevW;
      const others = prevW.logs.filter((l) => l.exerciseId !== nextLog.exerciseId);
      return {
        ...prevW,
        logs: [...others, nextLog],
        restUntil: finished ? null : Date.now() + restSec * 1000,
        restExerciseIndex: finished ? null : index,
        currentSet: finished ? 0 : nextLog.sets.length,
      };
    });
  }

  function nextExercise() {
    onPatch({
      exerciseIndex: index + 1,
      currentSet: 0,
      restUntil: null,
      restExerciseIndex: null,
    });
  }

  if (resting && active.restUntil) {
    return (
      <main
        className="px-4 pb-10"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <TopBar
          title={`Workout ${active.workoutType} · Week ${active.week}`}
          onQuit={onQuit}
        />
        <p className="mb-4 text-sm text-muted">
          {ex.name} · set {setsDone} done
        </p>
        <RestTimer
          until={active.restUntil}
          onSkip={() => onPatch({ restUntil: null, restExerciseIndex: null })}
          onAdd={() =>
            onPatch({
              restUntil: (active.restUntil ?? Date.now()) + 30_000,
            })
          }
        />
        <p className="mt-6 text-center text-sm text-accent">{cue}</p>
        <p className="mt-2 text-center text-[11px] uppercase tracking-[0.16em] text-muted">
          {TEMPO_LINES[0]} {TEMPO_LINES[1]}
        </p>
      </main>
    );
  }

  const finishedExercise = setsDone >= targetSets;

  return (
    <main
      className="px-4 pb-12"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
    >
      <TopBar
        title={`Workout ${active.workoutType} · Week ${active.week}`}
        onQuit={onQuit}
      />

      {!active.dismissedShoulder ? (
        <div className="mb-4 rounded-lg bg-raised p-3 text-sm leading-relaxed text-muted">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-fg">Stop an exercise if:</p>
            <button
              type="button"
              className="grid size-8 place-items-center"
              onClick={() => onPatch({ dismissedShoulder: true })}
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
          <ul className="mt-1 space-y-0.5">
            {SHOULDER_STOP_RULES.map((r) => (
              <li key={r}>— {r}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="display text-2xl leading-tight">
          {ex.name}
          {ex.shoulderInvolved ? (
            <ShieldAlert className="ml-2 inline size-4 text-danger" aria-label="Shoulder involved" />
          ) : null}
        </h2>
        <p className="text-sm tabular-nums text-muted">
          {index + 1} of {total}
        </p>
      </div>

      <ExerciseVisual
        id={ex.id}
        paused={paused}
        onTogglePause={() => setPaused((v) => !v)}
      />

      <p className="mt-3 text-center text-sm text-accent">{cue}</p>
      <p className="mt-1 text-center text-[11px] uppercase tracking-[0.16em] text-muted">
        {TEMPO_LINES[0]} {TEMPO_LINES[1]}
      </p>

      <div className="mt-4 rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]">
        <p className="text-sm">
          Target:{" "}
          <span className="tabular-nums">
            {flexible ? "2–3" : targetSets} sets ×{" "}
            {ex.timed
              ? `${ex.durationMin}–${ex.durationMax} sec`
              : `${ex.repMin}–${ex.repMax}`}
            {ex.perSide ? " per side" : ""}
          </span>
        </p>
        <p className="mt-1 text-sm text-muted">
          Previous:{" "}
          {prev
            ? `${formatWeight(prev.sets[0]?.weightKg ?? 0, units)} · ${prev.sets
                .map((s) => (ex.timed ? `${s.durationSec ?? 0}s` : String(s.reps)))
                .join(" / ")}`
            : "— first time"}
        </p>
        {setsDone > 0 ? (
          <p className="mt-1 text-sm">
            This session:{" "}
            {log.sets
              .map((s) => (ex.timed ? `${s.durationSec ?? 0}s` : String(s.reps)))
              .join(" / ")}
          </p>
        ) : null}
      </div>

      {ex.shoulderInvolved && ex.id === "floor-press" ? (
        <p className="mt-3 text-sm text-muted">
          Keep elbows approximately 30–45° from your torso. Use a neutral or semi-neutral grip.
        </p>
      ) : null}

      {ex.id === "side-plank" ? (
        <Button variant="outline" className="mt-3 w-full" onClick={onSwapDeadBug}>
          Swap for dead bug
        </Button>
      ) : null}

      {ex.id === "split-squat" && active.week >= 3 ? (
        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={() => onPatch({ useBulgarian: true })}
        >
          Progress to Bulgarian split squat
        </Button>
      ) : null}

      {finishedExercise ? (
        <div className="mt-5">
          {ready && !ex.timed ? (
            <p className="mb-3 rounded-md bg-accent px-3 py-2 text-center text-sm font-medium text-accent-fg">
              Ready to increase weight next time. If heavier dumbbells are unavailable, use a
              3-second lowering phase or add a safe extra rep.
            </p>
          ) : null}
          <Button size="xl" className="w-full" onClick={nextExercise}>
            Next exercise
          </Button>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Set {setsDone + 1}
            {flexible ? " of 2–3" : ` of ${targetSets}`}
          </p>
          {ex.loadType === "dumbbell" ? (
            <Stepper
              label="Weight"
              value={weight}
              display={formatWeight(weight, units)}
              onDec={() => setWeight((v) => Math.max(0, roundStep(v - 2.5)))}
              onInc={() => setWeight((v) => roundStep(v + 2.5))}
            />
          ) : null}
          {ex.timed ? (
            <Stepper
              label="Duration (sec)"
              value={duration}
              display={`${duration} s`}
              onDec={() => setDuration((v) => Math.max(10, v - 5))}
              onInc={() => setDuration((v) => Math.min(90, v + 5))}
            />
          ) : (
            <Stepper
              label={ex.perSide ? "Reps per side" : "Reps"}
              value={reps}
              onDec={() => setReps((v) => Math.max(1, v - 1))}
              onInc={() => setReps((v) => Math.min(30, v + 1))}
            />
          )}
          <Button size="xl" className="w-full" onClick={completeSet}>
            Complete set
          </Button>
          {canFinishEarly && setsDone >= 2 ? (
            <button type="button" className="w-full py-2 text-sm text-muted" onClick={nextExercise}>
              Finish exercise (week 10)
            </button>
          ) : null}
        </div>
      )}

      <button
        type="button"
        className="mt-5 flex w-full items-center justify-between py-3 text-sm text-muted"
        onClick={() => setShowForm((v) => !v)}
      >
        Show form details
        <ChevronDown className={`size-4 transition-transform ${showForm ? "rotate-180" : ""}`} />
      </button>
      {showForm ? (
        <div className="rounded-lg bg-surface p-4 shadow-[var(--shadow-border)]">
          <FormDetails exercise={ex} />
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-relaxed text-subtle">{phaseNote}</p>
    </main>
  );
}

function Complete({
  active,
  exercises,
  onSave,
}: {
  active: ActiveWorkout;
  exercises: ExerciseDef[];
  onSave: (difficulty: number, shoulderPain: number) => void;
}) {
  const [difficulty, setDifficulty] = useState(3);
  const [pain, setPain] = useState(0);
  const now = useNow(true);
  const duration = Math.round((now - active.startedAt) / 1000);
  const sets = active.logs.reduce((n, e) => n + e.sets.length, 0);
  const volume = active.logs.reduce(
    (n, e) => n + e.sets.reduce((m, s) => m + s.weightKg * (s.reps || 0), 0),
    0,
  );

  return (
    <main
      className="px-4 pb-12"
      style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}
    >
      <p className="wordmark text-[11px] text-accent">Forge</p>
      <h1 className="display mt-3 text-3xl">Workout complete</h1>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Duration" value={formatDuration(duration)} />
        <Stat label="Exercises" value={String(exercises.length)} />
        <Stat label="Sets completed" value={String(sets)} />
        <Stat label="Dumbbell volume" value={`${trimNum(Math.round(volume))} kg`} />
      </div>

      <p className="mt-8 text-sm font-medium">How difficult was today's workout?</p>
      <Scale
        value={difficulty}
        onChange={setDifficulty}
        labels={["Very easy", "Easy", "Moderate", "Hard", "Very hard"]}
        from={1}
      />

      <p className="mt-6 text-sm font-medium">How does your shoulder feel?</p>
      <Scale
        value={pain}
        onChange={setPain}
        labels={["No pain", "Barely", "Mild", "Moderate", "Significant", "Severe"]}
        from={0}
      />

      {pain >= 3 ? (
        <p className="mt-4 rounded-md bg-raised p-3 text-sm leading-relaxed text-danger">
          Consider modifying shoulder-loading exercises at the next workout. Persistent or
          worsening shoulder pain should be evaluated by a qualified clinician or physical
          therapist.
        </p>
      ) : null}

      {active.week === 10 && active.workoutType ? (
        <p className="mt-4 text-sm text-muted">
          End of program: compare body weight, waist, and strength numbers on the Progress
          screen.
        </p>
      ) : null}

      <Button size="xl" className="mt-8 w-full" onClick={() => onSave(difficulty, pain)}>
        Save workout
      </Button>
    </main>
  );
}

function Scale({
  value,
  onChange,
  labels,
  from,
}: {
  value: number;
  onChange: (n: number) => void;
  labels: string[];
  from: number;
}) {
  return (
    <div className="mt-3 grid grid-cols-5 gap-1.5" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0,1fr))` }}>
      {labels.map((label, i) => {
        const n = from + i;
        const on = value === n;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(n)}
            className={`rounded-md px-1 py-3 text-center ${
              on ? "bg-accent text-accent-fg" : "bg-raised text-muted"
            }`}
          >
            <span className="block text-base font-medium tabular-nums">{n}</span>
            <span className="mt-1 block text-[10px] leading-tight">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface p-3 shadow-[var(--shadow-border)]">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="display mt-1 text-xl tabular-nums">{value}</p>
    </div>
  );
}

function TopBar({ title, onQuit }: { title: string; onQuit: () => void }) {
  const active = useAppStore((s) => s.activeWorkout);
  const now = useNow(true);
  const elapsed = active ? Math.floor((now - active.startedAt) / 1000) : 0;
  return (
    <div className="mb-4 flex items-center gap-2">
      <button
        type="button"
        onClick={onQuit}
        className="grid size-11 place-items-center rounded-md text-muted"
        aria-label="End workout"
      >
        <ChevronLeft className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-fg">{title}</p>
      </div>
      <p className="text-sm tabular-nums text-muted">{formatDuration(elapsed)}</p>
    </div>
  );
}

function roundStep(n: number): number {
  return Math.round(n * 2) / 2;
}
