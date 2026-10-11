import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ActiveWorkout,
  AppData,
  Settings,
  UserProfile,
  WeeklyMeasurement,
  WorkoutLog,
} from "./types";
import { uid } from "./utils";

const STORAGE_KEY = "forge-recomp-v1";

export const INITIAL_PROFILE: UserProfile = {
  weightKg: 82,
  waistIn: 35,
  startWeightKg: 82,
  startWaistIn: 35,
  heightCm: 173,
  age: 47,
};

export const INITIAL_SETTINGS: Settings = {
  units: "metric",
  restMajorSec: 90,
  restMinorSec: 60,
  darkMode: true,
  useBulgarian: false,
};

interface AppState {
  hydrated: boolean;
  userProfile: UserProfile;
  settings: Settings;
  workoutHistory: WorkoutLog[];
  weeklyMeasurements: WeeklyMeasurement[];
  stepLogs: { date: string; steps: number }[];
  activeWorkout: ActiveWorkout | null;
  setHydrated: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setActiveWorkout: (
    w: ActiveWorkout | null | ((prev: ActiveWorkout | null) => ActiveWorkout | null),
  ) => void;
  completeWorkout: (log: Omit<WorkoutLog, "id">) => void;
  addMeasurement: (m: WeeklyMeasurement) => void;
  logSteps: (date: string, steps: number) => void;
  exportData: () => AppData & { exportedAt: string };
  importData: (raw: unknown) => { ok: true } | { ok: false; error: string };
  resetProgram: () => void;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function parseImported(raw: unknown): AppData | null {
  if (!isObject(raw)) return null;
  const src = isObject(raw.data) ? (raw.data as Record<string, unknown>) : raw;
  if (!isObject(src.userProfile) || !Array.isArray(src.workoutHistory)) return null;
  const p = src.userProfile as Record<string, unknown>;
  const userProfile: UserProfile = {
    weightKg: num(p.weightKg, 82),
    waistIn: num(p.waistIn, 35),
    startWeightKg: num(p.startWeightKg, 82),
    startWaistIn: num(p.startWaistIn, 35),
    heightCm: num(p.heightCm, 173),
    age: num(p.age, 47),
  };
  const s = isObject(src.settings) ? src.settings : {};
  const settings: Settings = {
    units: s.units === "imperial" ? "imperial" : "metric",
    restMajorSec: num(s.restMajorSec, 90),
    restMinorSec: num(s.restMinorSec, 60),
    darkMode: s.darkMode !== false,
    useBulgarian: s.useBulgarian === true,
  };
  return {
    version: 1,
    userProfile,
    settings,
    workoutHistory: src.workoutHistory as WorkoutLog[],
    weeklyMeasurements: Array.isArray(src.weeklyMeasurements)
      ? (src.weeklyMeasurements as WeeklyMeasurement[])
      : [],
    stepLogs: Array.isArray(src.stepLogs)
      ? (src.stepLogs as AppData["stepLogs"])
      : [],
    activeWorkout: (src.activeWorkout as ActiveWorkout | null) ?? null,
  };
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      userProfile: { ...INITIAL_PROFILE },
      settings: { ...INITIAL_SETTINGS },
      workoutHistory: [],
      weeklyMeasurements: [],
      stepLogs: [],
      activeWorkout: null,
      setHydrated: () => set({ hydrated: true }),
      updateProfile: (patch) =>
        set((s) => ({ userProfile: { ...s.userProfile, ...patch } })),
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      setActiveWorkout: (w) =>
        set((s) => ({
          activeWorkout: typeof w === "function" ? w(s.activeWorkout) : w,
        })),
      completeWorkout: (log) =>
        set((s) => ({
          workoutHistory: [...s.workoutHistory, { ...log, id: uid() }],
          activeWorkout: null,
        })),
      addMeasurement: (m) =>
        set((s) => {
          const rest = s.weeklyMeasurements.filter(
            (x) => !(x.week === m.week && x.date === m.date),
          );
          return {
            weeklyMeasurements: [...rest, m],
            userProfile: {
              ...s.userProfile,
              weightKg: m.weightKg,
              waistIn: m.waistIn,
            },
          };
        }),
      logSteps: (date, steps) =>
        set((s) => ({
          stepLogs: [
            ...s.stepLogs.filter((x) => x.date !== date),
            { date, steps },
          ],
        })),
      exportData: () => {
        const s = get();
        return {
          version: 1 as const,
          exportedAt: new Date().toISOString(),
          userProfile: s.userProfile,
          settings: s.settings,
          workoutHistory: s.workoutHistory,
          weeklyMeasurements: s.weeklyMeasurements,
          stepLogs: s.stepLogs,
          activeWorkout: s.activeWorkout,
        };
      },
      importData: (raw) => {
        const parsed = parseImported(raw);
        if (!parsed) return { ok: false, error: "This file is not a FORGE backup." };
        set({
          userProfile: parsed.userProfile,
          settings: parsed.settings,
          workoutHistory: parsed.workoutHistory,
          weeklyMeasurements: parsed.weeklyMeasurements,
          stepLogs: parsed.stepLogs,
          activeWorkout: parsed.activeWorkout,
        });
        return { ok: true };
      },
      resetProgram: () =>
        set({
          userProfile: { ...INITIAL_PROFILE },
          settings: { ...INITIAL_SETTINGS },
          workoutHistory: [],
          weeklyMeasurements: [],
          stepLogs: [],
          activeWorkout: null,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        userProfile: s.userProfile,
        settings: s.settings,
        workoutHistory: s.workoutHistory,
        weeklyMeasurements: s.weeklyMeasurements,
        stepLogs: s.stepLogs,
        activeWorkout: s.activeWorkout,
      }),
    },
  ),
);

export function lastExerciseLog(
  history: WorkoutLog[],
  exerciseId: string,
): { date: string; week: number; sets: WorkoutLog["exercises"][0]["sets"] } | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const w = history[i];
    const ex = w.exercises.find((e) => {
      if (e.exerciseId === exerciseId) return true;
      if (
        (exerciseId === "split-squat" && e.exerciseId === "bulgarian-split-squat") ||
        (exerciseId === "bulgarian-split-squat" && e.exerciseId === "split-squat")
      )
        return true;
      if (
        (exerciseId === "one-arm-row" && e.exerciseId === "bent-over-row") ||
        (exerciseId === "bent-over-row" && e.exerciseId === "one-arm-row")
      )
        return true;
      return false;
    });
    if (ex && ex.sets.length) {
      return { date: w.date, week: w.week, sets: ex.sets };
    }
  }
  return null;
}
