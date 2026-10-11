import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, Label, Screen } from "@/components/screen";
import { weekFromCompleted } from "@/lib/program";
import { useAppStore } from "@/lib/store";
import { todayISO } from "@/lib/utils";

export const Route = createFileRoute("/checkin")({
  component: CheckinPage,
});

function CheckinPage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.userProfile);
  const history = useAppStore((s) => s.workoutHistory);
  const addMeasurement = useAppStore((s) => s.addMeasurement);
  const week = weekFromCompleted(history.length);
  const [weight, setWeight] = useState(String(profile.weightKg));
  const [waist, setWaist] = useState(String(profile.waistIn));
  const [saved, setSaved] = useState(false);

  function save() {
    const weightKg = Number(weight);
    const waistIn = Number(waist);
    if (!Number.isFinite(weightKg) || !Number.isFinite(waistIn)) return;
    addMeasurement({ date: todayISO(), week, weightKg, waistIn });
    setSaved(true);
  }

  return (
    <Screen>
      <h1 className="display text-3xl">Weekly check-in</h1>
      <p className="mt-2 text-sm text-muted">
        Saturday measurement. Track waist, weight, strength, and consistency — not photo
        body-fat estimates.
      </p>

      <Card className="mt-5 space-y-4">
        <Label>Week {week}</Label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Weight (kg)
          </span>
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            inputMode="decimal"
            className="mt-1 h-12 w-full rounded-md bg-raised px-3 text-fg shadow-[var(--shadow-border)] outline-none"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Waist (inches at navel)
          </span>
          <input
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            inputMode="decimal"
            className="mt-1 h-12 w-full rounded-md bg-raised px-3 text-fg shadow-[var(--shadow-border)] outline-none"
          />
        </label>
        <Button size="lg" className="w-full" onClick={save}>
          Save check-in
        </Button>
      </Card>

      <Card className="mt-4">
        <Label>Progress photo reminder</Label>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Optional: take a front photo in similar lighting. Do not use apps that estimate
          body fat from a picture. Compare waist, scale weight, and strength instead.
        </p>
      </Card>

      {saved ? (
        <Button
          variant="secondary"
          className="mt-6 w-full"
          onClick={() => void navigate({ to: "/progress" })}
        >
          See progress
        </Button>
      ) : null}
    </Screen>
  );
}
