export type WorkoutType = "A" | "B";
export type Units = "metric" | "imperial";
export type RestKind = "major" | "minor";
export type LoadType = "dumbbell" | "bodyweight";

export interface UserProfile {
  weightKg: number;
  waistIn: number;
  startWeightKg: number;
  startWaistIn: number;
  heightCm: number;
  age: number;
}

export interface Settings {
  units: Units;
  restMajorSec: number;
  restMinorSec: number;
  darkMode: boolean;
  useBulgarian: boolean;
}

export interface SetLog {
  weightKg: number;
  reps: number;
  durationSec?: number;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  week: number;
  workoutType: WorkoutType;
  durationSec: number;
  difficulty: number;
  shoulderPain: number;
  exercises: ExerciseLog[];
  swappedSidePlank: boolean;
}

export interface WeeklyMeasurement {
  date: string;
  week: number;
  weightKg: number;
  waistIn: number;
}

export interface StepLog {
  date: string;
  steps: number;
}

export interface ActiveWorkout {
  week: number;
  workoutType: WorkoutType;
  startedAt: number;
  warmupComplete: boolean;
  warmupStep: number;
  warmupStepStartedAt: number;
  exerciseIndex: number;
  currentSet: number;
  logs: ExerciseLog[];
  restUntil: number | null;
  restExerciseIndex: number | null;
  swappedSidePlank: boolean;
  useBulgarian: boolean;
  dismissedShoulder: boolean;
}

export interface AppData {
  version: 1;
  userProfile: UserProfile;
  settings: Settings;
  workoutHistory: WorkoutLog[];
  weeklyMeasurements: WeeklyMeasurement[];
  stepLogs: StepLog[];
  activeWorkout: ActiveWorkout | null;
}

export interface ExerciseDef {
  id: string;
  name: string;
  shortName: string;
  muscles: string[];
  starting: string[];
  movement: string[];
  breathing: string;
  mistakes: string[];
  safety?: string[];
  cues: string[];
  beginnerMod?: string;
  loadType: LoadType;
  timed: boolean;
  perSide: boolean;
  shoulderInvolved: boolean;
  rest: RestKind;
  repMin: number;
  repMax: number;
  durationMin?: number;
  durationMax?: number;
  defaultWeightKg: number;
  warmupVisual?: boolean;
}

export type PhaseId = "foundation" | "build" | "overload" | "peak" | "consolidate";

export interface PhaseInfo {
  id: PhaseId;
  name: string;
  weeks: string;
  weekStart: number;
  weekEnd: number;
  rir: string;
  goal: string;
  message: string;
}
