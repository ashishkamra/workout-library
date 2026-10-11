import type { ReactNode } from "react";
import type { ExerciseDef } from "@/lib/types";
import { TEMPO_DETAIL, TEMPO_LINES } from "@/lib/exercises";

export function FormDetails({ exercise }: { exercise: ExerciseDef }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-fg">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-accent">
        {TEMPO_LINES[0]} {TEMPO_LINES[1]}
      </p>
      <p className="text-muted">{TEMPO_DETAIL}</p>

      <Section title="Muscles">{exercise.muscles.join(" · ")}</Section>

      <Section title="Starting position">
        <ul className="space-y-1.5">
          {exercise.starting.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Section>

      <Section title="Movement">
        <ul className="space-y-1.5">
          {exercise.movement.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Section>

      <Section title="Breathing">{exercise.breathing}</Section>

      <Section title="Common mistakes">
        <ul className="space-y-1.5">
          {exercise.mistakes.map((s) => (
            <li key={s}>— {s}</li>
          ))}
        </ul>
      </Section>

      {exercise.safety ? (
        <Section title="Shoulder / safety">
          <ul className="space-y-1.5 text-danger">
            {exercise.safety.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      {exercise.beginnerMod ? (
        <Section title="Beginner modification">{exercise.beginnerMod}</Section>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
}
