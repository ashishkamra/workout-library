import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, Label, Screen } from "@/components/screen";
import { getExercise } from "@/lib/exercises";
import { STRENGTH_TRACK, TOTAL_WORKOUTS } from "@/lib/program";
import { lastExerciseLog, useAppStore } from "@/lib/store";
import { formatWaist, formatWeight, trimNum } from "@/lib/utils";

export const Route = createFileRoute("/progress")({
  component: ProgressPage,
});

const STROKE = "#c5d0bc";
const DANGER = "#c45c4a";
const MUTED = "#8d9388";

function ProgressPage() {
  const history = useAppStore((s) => s.workoutHistory);
  const profile = useAppStore((s) => s.userProfile);
  const units = useAppStore((s) => s.settings.units);
  const measurements = useAppStore((s) => s.weeklyMeasurements);

  const difficulty = history.map((w, i) => ({
    i: i + 1,
    v: w.difficulty,
  }));
  const shoulder = history.map((w, i) => ({
    i: i + 1,
    v: w.shoulderPain,
  }));

  return (
    <Screen>
      <h1 className="display text-3xl">Progress</h1>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Card>
          <Label>Weight</Label>
          <p className="display mt-1 text-2xl tabular-nums">
            {formatWeight(profile.weightKg, units)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Initial {trimNum(profile.startWeightKg)} kg
          </p>
        </Card>
        <Card>
          <Label>Waist</Label>
          <p className="display mt-1 text-2xl tabular-nums">
            {formatWaist(profile.waistIn, units)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Initial {trimNum(profile.startWaistIn)} in
          </p>
        </Card>
      </div>

      <Card className="mt-3">
        <Label>Workouts</Label>
        <p className="display mt-1 text-2xl tabular-nums">
          {history.length} / {TOTAL_WORKOUTS}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-raised">
          <div
            className="h-full bg-accent"
            style={{ width: `${(history.length / TOTAL_WORKOUTS) * 100}%` }}
          />
        </div>
      </Card>

      <h2 className="display mt-8 text-xl">Strength</h2>
      <ul className="mt-3 space-y-2">
        {STRENGTH_TRACK.map((id) => {
          const ex = getExercise(id);
          const last = lastExerciseLog(history, id);
          const series = history
            .map((w, i) => {
              const found = w.exercises.find((e) => e.exerciseId === id);
              if (!found || !found.sets.length) return null;
              const best = Math.max(...found.sets.map((s) => s.weightKg));
              const reps = found.sets.map((s) => s.reps).join("/");
              return { i: i + 1, w: best, reps };
            })
            .filter((x): x is { i: number; w: number; reps: string } => x !== null);
          return (
            <li key={id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
              <div className="flex items-baseline justify-between">
                <p className="font-medium">{ex?.shortName ?? id}</p>
                <p className="text-sm tabular-nums text-muted">
                  {last
                    ? `${formatWeight(last.sets[0]?.weightKg ?? 0, units)} · ${last.sets.map((s) => s.reps).join(" / ")}`
                    : "—"}
                </p>
              </div>
              {series.length >= 2 ? (
                <div className="mt-2 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series}>
                      <CartesianGrid stroke={MUTED} strokeOpacity={0.15} />
                      <XAxis dataKey="i" hide />
                      <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
                      <Tooltip
                        contentStyle={{
                          background: "#161816",
                          border: "1px solid #2a2e2a",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(v) => [`${v} kg`, "Weight"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="w"
                        stroke={STROKE}
                        strokeWidth={2}
                        dot={{ r: 3, fill: STROKE }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mt-2 text-xs text-subtle">More sessions will draw a trend.</p>
              )}
            </li>
          );
        })}
      </ul>

      <h2 className="display mt-8 text-xl">Difficulty</h2>
      <Trend data={difficulty} color={STROKE} empty="Log workouts to see difficulty." />

      <h2 className="display mt-8 text-xl">Shoulder discomfort</h2>
      <Trend data={shoulder} color={DANGER} empty="Shoulder scores appear after workouts." />

      {measurements.length > 0 ? (
        <>
          <h2 className="display mt-8 text-xl">Check-ins</h2>
          <ul className="mt-3 space-y-2">
            {measurements
              .slice()
              .reverse()
              .map((m) => (
                <li
                  key={`${m.date}-${m.week}`}
                  className="flex justify-between rounded-lg bg-surface px-4 py-3 text-sm shadow-[var(--shadow-border)]"
                >
                  <span>Week {m.week}</span>
                  <span className="tabular-nums text-muted">
                    {trimNum(m.weightKg)} kg · {trimNum(m.waistIn)} in
                  </span>
                </li>
              ))}
          </ul>
        </>
      ) : null}

      <Link to="/checkin" className="mt-6 block text-center text-sm text-accent">
        Weekly check-in
      </Link>
    </Screen>
  );
}

function Trend({
  data,
  color,
  empty,
}: {
  data: { i: number; v: number }[];
  color: string;
  empty: string;
}) {
  if (data.length < 1) {
    return <p className="mt-2 text-sm text-muted">{empty}</p>;
  }
  return (
    <div className="mt-2 h-32 rounded-xl bg-surface p-2 shadow-[var(--shadow-border)]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke={MUTED} strokeOpacity={0.15} />
          <XAxis dataKey="i" hide />
          <YAxis domain={[0, 5]} hide />
          <Tooltip
            contentStyle={{
              background: "#161816",
              border: "1px solid #2a2e2a",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
