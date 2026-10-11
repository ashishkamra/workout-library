import type { ExerciseDef, PhaseInfo, WorkoutType } from "./types";
import { EXERCISES, getExercise } from "./exercises";

export const TOTAL_WEEKS = 10;
export const WORKOUTS_PER_WEEK = 3;
export const TOTAL_WORKOUTS = TOTAL_WEEKS * WORKOUTS_PER_WEEK;

export const WORKOUT_A_IDS = [
  "goblet-squat",
  "floor-press",
  "one-arm-row",
  "rdl",
  "reverse-lunge",
  "dead-bug",
  "farmer-carry",
] as const;

export const WORKOUT_B_IDS = [
  "split-squat",
  "floor-press",
  "bent-over-row",
  "glute-bridge",
  "db-curl",
  "side-plank",
  "farmer-carry",
] as const;

export const PHASES: PhaseInfo[] = [
  {
    id: "foundation",
    name: "Foundation",
    weeks: "1–2",
    weekStart: 1,
    weekEnd: 2,
    rir: "3–4",
    goal: "Learn movement patterns. Most major exercises use 2 working sets.",
    message:
      "Finish each set knowing you could perform another 3–4 good repetitions.",
  },
  {
    id: "build",
    name: "Build",
    weeks: "3–4",
    weekStart: 3,
    weekEnd: 4,
    rir: "2–3",
    goal: "Use the prescribed sets. Find working weights with consistent technique.",
    message: "Stay 2–3 repetitions in reserve. Let technique set the weight.",
  },
  {
    id: "overload",
    name: "Progressive Overload",
    weeks: "5–7",
    weekStart: 5,
    weekEnd: 7,
    rir: "2",
    goal: "Increase reps or dumbbell weight from the previous session.",
    message: "About 2 reps in reserve. Add a rep, then add weight.",
  },
  {
    id: "peak",
    name: "Peak Training",
    weeks: "8–9",
    weekStart: 8,
    weekEnd: 9,
    rir: "1–2",
    goal: "A fourth set on the first three major exercises. Hard, not failure.",
    message: "1–2 reps in reserve. Do not chase muscular failure.",
  },
  {
    id: "consolidate",
    name: "Consolidate",
    weeks: "10",
    weekStart: 10,
    weekEnd: 10,
    rir: "2–3",
    goal: "Drop major lifts to 2–3 sets. Keep challenging weights without max effort.",
    message: "Maintain the load. Do not push maximal effort this week.",
  },
];

export const SUGGESTED_DAYS = ["Monday", "Wednesday", "Friday"] as const;

export const SHOULDER_STOP_RULES = [
  "pain is sharp",
  "pain increases from repetition to repetition",
  "movement causes new weakness",
  "pain persists significantly after training",
];

/** 0-based completed count → week 1–10 */
export function weekFromCompleted(completed: number): number {
  if (completed >= TOTAL_WORKOUTS) return TOTAL_WEEKS;
  return Math.min(TOTAL_WEEKS, Math.floor(completed / WORKOUTS_PER_WEEK) + 1);
}

/** 0-based workout index (0–29) → A/B. Odd weeks ABA, even weeks BAB. */
export function workoutTypeAt(index: number): WorkoutType {
  const week = Math.floor(index / WORKOUTS_PER_WEEK) + 1;
  const day = index % WORKOUTS_PER_WEEK;
  const oddWeek = week % 2 === 1;
  if (oddWeek) return day === 1 ? "B" : "A";
  return day === 1 ? "A" : "B";
}

export function nextWorkoutType(completed: number): WorkoutType {
  if (completed >= TOTAL_WORKOUTS) return workoutTypeAt(TOTAL_WORKOUTS - 1);
  return workoutTypeAt(completed);
}

export function phaseForWeek(week: number): PhaseInfo {
  return (
    PHASES.find((p) => week >= p.weekStart && week <= p.weekEnd) ?? PHASES[0]
  );
}

export function majorSetCount(week: number): number {
  if (week <= 2) return 2;
  if (week <= 7) return 3;
  if (week <= 9) return 4;
  return 3;
}

export function majorSetLabel(week: number): string {
  if (week === 10) return "2–3";
  return String(majorSetCount(week));
}

export function setsForExercise(exerciseId: string, week: number): number {
  const twoSetEarly = new Set([
    "goblet-squat",
    "floor-press",
    "one-arm-row",
    "bent-over-row",
    "split-squat",
    "bulgarian-split-squat",
    "rdl",
    "glute-bridge",
  ]);
  const fixedTwo = new Set(["reverse-lunge", "db-curl"]);
  const fixedThree = new Set(["dead-bug", "farmer-carry", "side-plank"]);

  if (fixedTwo.has(exerciseId)) return 2;
  if (fixedThree.has(exerciseId)) return 3;
  if (twoSetEarly.has(exerciseId)) {
    if (week <= 2) return 2;
    if (week <= 7) return 3;
    if (week <= 9) return 4;
    return 3;
  }
  return majorSetCount(week);
}

export function isFlexibleWeek10(exerciseId: string, week: number): boolean {
  if (week !== 10) return false;
  return [
    "goblet-squat",
    "floor-press",
    "one-arm-row",
    "bent-over-row",
    "split-squat",
    "bulgarian-split-squat",
  ].includes(exerciseId);
}

export function workoutExerciseIds(
  type: WorkoutType,
  useBulgarian: boolean,
  week: number,
): string[] {
  if (type === "A") return [...WORKOUT_A_IDS];
  const ids: string[] = [...WORKOUT_B_IDS];
  if (useBulgarian && week >= 3) ids[0] = "bulgarian-split-squat";
  return ids;
}

export function workoutExercises(
  type: WorkoutType,
  useBulgarian: boolean,
  week: number,
): ExerciseDef[] {
  return workoutExerciseIds(type, useBulgarian, week).map((id) => {
    const ex = getExercise(id);
    if (!ex) throw new Error(`Unknown exercise ${id}`);
    return ex;
  });
}

export function stepTarget(week: number): number {
  if (week <= 2) return 7000;
  if (week <= 4) return 8000;
  if (week <= 7) return 9000;
  return 10000;
}

export function isReadyToIncrease(
  reps: number[],
  repMax: number,
): boolean {
  return reps.length > 0 && reps.every((r) => r >= repMax);
}

export const STRENGTH_TRACK = [
  "goblet-squat",
  "floor-press",
  "one-arm-row",
  "bent-over-row",
  "rdl",
  "split-squat",
] as const;

export const DEFAULT_WEIGHTS: Record<string, number> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e.defaultWeightKg]),
);

export const WARMUP_STEPS: {
  id: string;
  title: string;
  detail: string;
  seconds?: number;
  reps?: string;
  visualId: string;
}[] = [
  {
    id: "march",
    title: "Brisk walking or marching",
    detail: "Easy pace. Swing the arms. Breathe through the nose if you can.",
    seconds: 120,
    visualId: "march",
  },
  {
    id: "bw-squat",
    title: "Bodyweight squats",
    detail: "Controlled. Sit back. Heels stay down.",
    reps: "10",
    visualId: "bw-squat",
  },
  {
    id: "hinge",
    title: "Hip hinges",
    detail: "Push the hips back. Soft knees. Feel the hamstrings.",
    reps: "10",
    visualId: "hinge",
  },
  {
    id: "scap",
    title: "Shoulder blade squeezes",
    detail: "Gentle. Do not shrug. Pause one second at the squeeze.",
    reps: "10",
    visualId: "scap",
  },
  {
    id: "circles",
    title: "Gentle arm circles",
    detail: "Small circles. Pain-free range only.",
    reps: "10 forward · 10 backward",
    visualId: "circles",
  },
  {
    id: "practice",
    title: "Light practice sets",
    detail:
      "One easy set of the first two exercises of today’s workout. Do not fatigue.",
    visualId: "practice",
  },
];
