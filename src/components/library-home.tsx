import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { EXERCISES } from "@/lib/exercises";
import {
  PATTERNS,
  doseLabel,
  equipmentLabel,
  filterExercises,
  patternLabel,
  type Pattern,
} from "@/lib/catalog";
import { publicUrl } from "@/lib/public-url";
import type { LoadType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LibraryHome({
  onOpen,
}: {
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [pattern, setPattern] = useState<Pattern | "all">("all");
  const [load, setLoad] = useState<LoadType | "all">("all");
  const [hideShoulder, setHideShoulder] = useState(false);

  const results = useMemo(
    () => filterExercises({ query, pattern, load, hideShoulder }),
    [query, pattern, load, hideShoulder],
  );

  return (
    <main className="library-main">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
        Workout library
      </p>
      <h1 className="display mt-2 text-4xl">Movements</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        {EXERCISES.length} strength movements with setup, cues, and a short demo.
        Nothing here is logged.
      </p>

      <label className="mt-6 block">
        <span className="sr-only">Search movements</span>
        <input
          className="library-search"
          type="search"
          value={query}
          placeholder="Search name or muscle"
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <div className="filter-row mt-4" role="group" aria-label="Movement pattern">
        <Chip pressed={pattern === "all"} onClick={() => setPattern("all")}>
          All
        </Chip>
        {PATTERNS.map((item) => (
          <Chip
            key={item.id}
            pressed={pattern === item.id}
            onClick={() => setPattern(item.id)}
          >
            {item.label}
          </Chip>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="filter-row" role="group" aria-label="Equipment">
          {(
            [
              ["all", "Any equipment"],
              ["dumbbell", "Dumbbell"],
              ["band", "Band"],
              ["bodyweight", "Bodyweight"],
            ] as const
          ).map(([id, label]) => (
            <Chip key={id} pressed={load === id} onClick={() => setLoad(id)}>
              {label}
            </Chip>
          ))}
        </div>
        <Chip pressed={hideShoulder} onClick={() => setHideShoulder((v) => !v)}>
          Hide shoulder-sensitive
        </Chip>
      </div>

      <p className="mt-5 text-xs text-subtle">
        {results.length} {results.length === 1 ? "movement" : "movements"}
      </p>

      {results.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No movements match those filters.</p>
      ) : (
        <ul className="library-grid mt-3">
          {results.map((ex) => (
            <li key={ex.id}>
              <button type="button" className="move-card" onClick={() => onOpen(ex.id)}>
                <img
                  src={publicUrl(`videos/posters/${ex.id}.jpg`)}
                  alt=""
                  className="move-poster"
                />
                <span className="block px-3 pt-3">
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-medium leading-snug">{ex.name}</span>
                    {ex.shoulderInvolved ? (
                      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-label="Shoulder-sensitive" />
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {patternLabel(ex.id)} · {equipmentLabel(ex.loadType)}
                  </span>
                  <span className="mt-1 block text-xs text-subtle">{doseLabel(ex)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      className={cn("chip", pressed && "is-on")}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
