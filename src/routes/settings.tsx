import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, Label, Screen } from "@/components/screen";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const exportData = useAppStore((s) => s.exportData);
  const importData = useAppStore((s) => s.importData);
  const resetProgram = useAppStore((s) => s.resetProgram);
  const profile = useAppStore((s) => s.userProfile);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function doExport() {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Backup downloaded.");
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const res = importData(parsed);
        setMsg(res.ok ? "Progress restored." : res.error);
      } catch {
        setMsg("Could not read that file.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <Screen>
      <h1 className="display text-3xl">Settings</h1>

      <Card className="mt-5 space-y-4">
        <Label>Profile</Label>
        <p className="text-sm text-muted">
          Age {profile.age} · {profile.heightCm} cm · starting {profile.startWeightKg} kg /{" "}
          {profile.startWaistIn} in
        </p>
        <Toggle
          label="Dark mode"
          on={settings.darkMode}
          onChange={(v) => updateSettings({ darkMode: v })}
        />
        <Toggle
          label="Imperial display (lb / in)"
          on={settings.units === "imperial"}
          onChange={(v) => updateSettings({ units: v ? "imperial" : "metric" })}
        />
        <Toggle
          label="Bulgarian split squat (from week 3)"
          on={settings.useBulgarian}
          onChange={(v) => updateSettings({ useBulgarian: v })}
        />
      </Card>

      <Card className="mt-4 space-y-3">
        <Label>Rest timers</Label>
        <Row
          label="Major lifts"
          value={`${settings.restMajorSec}s`}
          onDec={() =>
            updateSettings({ restMajorSec: Math.max(45, settings.restMajorSec - 15) })
          }
          onInc={() =>
            updateSettings({ restMajorSec: Math.min(180, settings.restMajorSec + 15) })
          }
        />
        <Row
          label="Accessories / core"
          value={`${settings.restMinorSec}s`}
          onDec={() =>
            updateSettings({ restMinorSec: Math.max(30, settings.restMinorSec - 15) })
          }
          onInc={() =>
            updateSettings({ restMinorSec: Math.min(120, settings.restMinorSec + 15) })
          }
        />
      </Card>

      <Card className="mt-4 space-y-3">
        <Label>Data</Label>
        <p className="text-sm text-muted">
          Everything lives on this phone in local storage. Export a JSON backup before
          clearing the browser.
        </p>
        <Button className="w-full" onClick={doExport}>
          Export data
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => fileRef.current?.click()}>
          Import data
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        {msg ? <p className="text-sm text-accent">{msg}</p> : null}
      </Card>

      <Card className="mt-4">
        <Label>This is not rehab</Label>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Sharp, increasing, or persistent shoulder pain should not be trained through.
          See a qualified clinician if pain stays at 3 or higher or is getting worse.
        </p>
      </Card>

      <Link to="/help" className="mt-6 block text-center text-sm text-accent">
        Install on Android
      </Link>

      <button
        type="button"
        className="mt-8 w-full py-3 text-sm text-danger"
        onClick={() => {
          if (window.confirm("Reset all workouts and measurements on this device?")) {
            resetProgram();
            setMsg("Program reset.");
          }
        }}
      >
        Reset program
      </button>
    </Screen>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between py-1 text-left"
      onClick={() => onChange(!on)}
    >
      <span className="text-sm">{label}</span>
      <span
        className={`relative h-7 w-12 rounded-full ${on ? "bg-accent" : "bg-raised"}`}
      >
        <span
          className={`absolute top-0.5 size-6 rounded-full bg-fg transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function Row({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: string;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" className="stepper-btn !size-10 !text-lg" onClick={onDec}>
          −
        </button>
        <span className="w-12 text-center tabular-nums">{value}</span>
        <button type="button" className="stepper-btn !size-10 !text-lg" onClick={onInc}>
          +
        </button>
      </div>
    </div>
  );
}
