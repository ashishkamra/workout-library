import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pencil, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, Label, Screen } from "@/components/screen";
import { useAppStore } from "@/lib/store";
import {
  nextWorkoutType,
  phaseForWeek,
  stepTarget,
  TOTAL_WORKOUTS,
  weekFromCompleted,
} from "@/lib/program";
import { formatWaist, formatWeight, todayISO } from "@/lib/utils";
import type { ActiveWorkout } from "@/lib/types";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const history = useAppStore((s) => s.workoutHistory);
  const profile = useAppStore((s) => s.userProfile);
  const settings = useAppStore((s) => s.settings);
  const active = useAppStore((s) => s.activeWorkout);
  const setActive = useAppStore((s) => s.setActiveWorkout);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const measurements = useAppStore((s) => s.weeklyMeasurements);
  const stepLogs = useAppStore((s) => s.stepLogs);
  const logSteps = useAppStore((s) => s.logSteps);

  const completed = history.length;
  const week = weekFromCompleted(completed);
  const nextType = nextWorkoutType(completed);
  const phase = phaseForWeek(week);
  const done = completed >= TOTAL_WORKOUTS;
  const today = todayISO();
  const todaySteps = stepLogs.find((s) => s.date === today)?.steps ?? 0;
  const targetSteps = stepTarget(week);
  const saturday = new Date().getDay() === 6;
  const checkedInThisWeek = measurements.some((m) => m.week === week);
  const [editing, setEditing] = useState(false);
  const [w, setW] = useState(String(profile.weightKg));
  const [waist, setWaist] = useState(String(profile.waistIn));
  const [steps, setSteps] = useState(String(todaySteps || ""));

  function startOrResume() {
    if (active) {
      void navigate({ to: "/workout" });
      return;
    }
    const session: ActiveWorkout = {
      week,
      workoutType: nextType,
      startedAt: Date.now(),
      warmupComplete: false,
      warmupStep: 0,
      warmupStepStartedAt: Date.now(),
      exerciseIndex: 0,
      currentSet: 0,
      logs: [],
      restUntil: null,
      restExerciseIndex: null,
      swappedSidePlank: false,
      useBulgarian: settings.useBulgarian && week >= 3,
      dismissedShoulder: false,
    };
    setActive(session);
    void navigate({ to: "/workout" });
  }

  function saveBody() {
    const weightKg = Number(w);
    const waistIn = Number(waist);
    if (!Number.isFinite(weightKg) || !Number.isFinite(waistIn)) return;
    updateProfile({ weightKg, waistIn });
    setEditing(false);
  }

  return (
    <Screen>
      <header className="mb-6 flex items-start justify-between">
        <div className="min-w-0 pr-3">
          <p className="wordmark text-[11px] text-accent">Forge</p>
          <h1 className="display mt-2 text-[1.65rem] leading-tight text-fg">
            10-Week Athletic Recomposition
          </h1>
        </div>
        <Link
          to="/settings"
          className="grid size-12 place-items-center rounded-md text-muted"
          aria-label="Settings"
        >
          <Settings className="size-5" />
        </Link>
      </header>

      <Card className="mb-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <Label>Current week</Label>
            <p className="display mt-1 text-4xl tabular-nums">{week}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
              {phase.name}
            </p>
            <p className="mt-1 text-sm text-fg">RIR {phase.rir}</p>
          </div>
        </div>
        <WeekBar week={week} />
        <p className="mt-3 text-sm leading-relaxed text-muted">{phase.message}</p>
      </Card>

      <Card className="mb-4">
        <Label>Next workout</Label>
        <p className="display mt-1 text-2xl">
          {done ? "Program complete" : `Workout ${nextType}`}
        </p>
        <p className="mt-1 text-sm text-muted">
          {done
            ? "Compare weight, waist, and strength numbers."
            : "Train on non-consecutive days · Mon / Wed / Fri"}
        </p>
        <p className="mt-3 text-sm tabular-nums text-fg">
          Progress: {completed} of {TOTAL_WORKOUTS} workouts completed
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-raised">
          <div
            className="h-full bg-accent"
            style={{ width: `${(completed / TOTAL_WORKOUTS) * 100}%` }}
          />
        </div>
      </Card>

      {active ? (
        <Button size="xl" className="mb-3 w-full" onClick={startOrResume}>
          Resume workout {active.workoutType}
        </Button>
      ) : (
        <Button
          size="xl"
          className="mb-3 w-full"
          onClick={startOrResume}
          disabled={done}
        >
          Start today's workout
        </Button>
      )}

      <div className="mb-4 grid grid-cols-1 gap-2">
        <Link to="/plan" className="block">
          <span className="flex h-12 items-center justify-center rounded-md bg-raised text-sm text-fg shadow-[var(--shadow-border)]">
            10 week plan
          </span>
        </Link>
        <Link to="/library" className="block">
          <span className="flex h-12 items-center justify-center rounded-md bg-raised text-sm text-fg shadow-[var(--shadow-border)]">
            Exercise library
          </span>
        </Link>
        <Link to="/progress" className="block">
          <span className="flex h-12 items-center justify-center rounded-md bg-raised text-sm text-fg shadow-[var(--shadow-border)]">
            Progress
          </span>
        </Link>
      </div>

      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <Label>Body</Label>
          <button
            type="button"
            className="grid size-10 place-items-center text-muted"
            onClick={() => setEditing((v) => !v)}
            aria-label="Edit weight and waist"
          >
            <Pencil className="size-4" />
          </button>
        </div>
        {editing ? (
          <div className="mt-3 space-y-3">
            <Field
              label={settings.units === "imperial" ? "Weight (kg stored)" : "Weight (kg)"}
              value={w}
              onChange={setW}
            />
            <Field label="Waist (inches)" value={waist} onChange={setWaist} />
            <Button className="w-full" onClick={saveBody}>
              Save
            </Button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat
              label="Current weight"
              value={formatWeight(profile.weightKg, settings.units)}
              sub={`Initial ${formatWeight(profile.startWeightKg, settings.units)}`}
            />
            <Stat
              label="Current waist"
              value={formatWaist(profile.waistIn, settings.units)}
              sub={`Initial ${formatWaist(profile.startWaistIn, settings.units)}`}
            />
          </div>
        )}
      </Card>

      {saturday && !checkedInThisWeek ? (
        <Link to="/checkin" className="mb-4 block">
          <Card className="border border-accent/30">
            <Label>Weekly check-in</Label>
            <p className="mt-1 text-fg">Saturday measurement is ready.</p>
          </Card>
        </Link>
      ) : null}

      <Card>
        <Label>Daily walking</Label>
        <p className="mt-1 text-lg tabular-nums">
          Target {targetSteps.toLocaleString()} steps
        </p>
        <p className="mt-1 text-sm text-muted">
          10-minute walk after lunch · 10-minute walk after dinner. Supplemental — do not
          let this interfere with strength work.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            inputMode="numeric"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="Steps today"
            className="h-12 flex-1 rounded-md bg-raised px-3 text-fg shadow-[var(--shadow-border)] outline-none"
          />
          <Button
            variant="secondary"
            onClick={() => {
              const n = Number(steps);
              if (Number.isFinite(n) && n >= 0) logSteps(today, Math.round(n));
            }}
          >
            Log
          </Button>
        </div>
        {todaySteps > 0 ? (
          <p className="mt-2 text-sm tabular-nums text-muted">
            Logged today: {todaySteps.toLocaleString()}
          </p>
        ) : null}
      </Card>
    </Screen>
  );
}

function WeekBar({ week }: { week: number }) {
  return (
    <div className="mt-4 flex gap-1">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full ${
            i + 1 <= week ? "bg-accent" : "bg-raised"
          }`}
        />
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="display mt-1 text-2xl tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-subtle">{sub}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="mt-1 h-12 w-full rounded-md bg-raised px-3 text-fg shadow-[var(--shadow-border)] outline-none"
      />
    </label>
  );
}
