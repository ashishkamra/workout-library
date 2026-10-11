import { EXERCISES, getExercise } from "./exercises";
import type { ExerciseDef, LoadType } from "./types";

export type Pattern =
  | "squat"
  | "hinge"
  | "lunge"
  | "push"
  | "pull"
  | "core"
  | "carry"
  | "arms";

export const PATTERNS: { id: Pattern; label: string }[] = [
  { id: "squat", label: "Squat" },
  { id: "hinge", label: "Hinge" },
  { id: "lunge", label: "Lunge" },
  { id: "push", label: "Push" },
  { id: "pull", label: "Pull" },
  { id: "core", label: "Core" },
  { id: "carry", label: "Carry" },
  { id: "arms", label: "Arms" },
];

const PATTERN_BY_ID: Record<string, Pattern> = {
  "goblet-squat": "squat",
  "floor-press": "push",
  "one-arm-row": "pull",
  "bent-over-row": "pull",
  rdl: "hinge",
  "reverse-lunge": "lunge",
  "split-squat": "lunge",
  "bulgarian-split-squat": "lunge",
  "glute-bridge": "hinge",
  "db-curl": "arms",
  "dead-bug": "core",
  "side-plank": "core",
  "farmer-carry": "carry",
};

export function patternOf(id: string): Pattern {
  return PATTERN_BY_ID[id] ?? "core";
}

export function patternLabel(id: string): string {
  const pattern = patternOf(id);
  return PATTERNS.find((p) => p.id === pattern)?.label ?? pattern;
}

export function doseLabel(ex: ExerciseDef): string {
  const amount = ex.timed
    ? `${ex.durationMin}–${ex.durationMax} sec`
    : `${ex.repMin}–${ex.repMax} reps`;
  return ex.perSide ? `${amount} / side` : amount;
}

export function equipmentLabel(load: LoadType): string {
  return load === "dumbbell" ? "Dumbbell" : "Bodyweight";
}

export interface SessionDef {
  id: string;
  name: string;
  summary: string;
  note?: string;
  exerciseIds: string[];
}

export const SESSIONS: SessionDef[] = [
  {
    id: "a",
    name: "Session A",
    summary: "Squat, press, single-arm row, hinge, lunge, then core and a carry.",
    exerciseIds: [
      "goblet-squat",
      "floor-press",
      "one-arm-row",
      "rdl",
      "reverse-lunge",
      "dead-bug",
      "farmer-carry",
    ],
  },
  {
    id: "b",
    name: "Session B",
    summary: "Split squat, press, bent-over row, bridge, curl, side plank, carry.",
    note: "Once split squats feel stable, the Bulgarian split squat can replace the first movement.",
    exerciseIds: [
      "split-squat",
      "floor-press",
      "bent-over-row",
      "glute-bridge",
      "db-curl",
      "side-plank",
      "farmer-carry",
    ],
  },
];

export function sessionExercises(session: SessionDef): ExerciseDef[] {
  return session.exerciseIds
    .map((id) => getExercise(id))
    .filter((ex): ex is ExerciseDef => Boolean(ex));
}

export function filterExercises(opts: {
  query: string;
  pattern: Pattern | "all";
  load: LoadType | "all";
  hideShoulder: boolean;
}): ExerciseDef[] {
  const q = opts.query.trim().toLowerCase();
  return EXERCISES.filter((ex) => {
    if (opts.pattern !== "all" && patternOf(ex.id) !== opts.pattern) return false;
    if (opts.load !== "all" && ex.loadType !== opts.load) return false;
    if (opts.hideShoulder && ex.shoulderInvolved) return false;
    if (!q) return true;
    const hay = [ex.name, ex.shortName, ...ex.muscles, patternLabel(ex.id)]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
