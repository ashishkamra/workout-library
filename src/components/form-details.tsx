import type { ReactNode } from "react";
import type { ExerciseDef } from "@/lib/types";
import { TEMPO_DETAIL, TEMPO_LINES } from "@/lib/exercises";

export function FormDetails({ exercise }: { exercise: ExerciseDef }) {
  return (
    <div className="form-copy space-y-5 text-sm leading-relaxed text-fg">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-accent">
          {TEMPO_LINES[0]}
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-accent">
          {TEMPO_LINES[1]}
        </p>
        <p className="mt-2 text-muted">{TEMPO_DETAIL}</p>
      </div>

      <Section title="Muscles">{exercise.muscles.join(" · ")}</Section>

      {exercise.cues.length ? (
        <Section title="Cues">
          <ul className="cue-list">
            {exercise.cues.map((cue) => (
              <li key={cue}>{cue}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="Starting position">
        <StepList items={exercise.starting} />
      </Section>

      <Section title="Movement">
        <StepList items={exercise.movement} />
      </Section>

      <Section title="Breathing">
        <p>{exercise.breathing}</p>
      </Section>

      <Section title="Common mistakes">
        <ul className="mark-list">
          {exercise.mistakes.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Section>

      {exercise.safety ? (
        <Section title="Shoulder / safety">
          <ul className="mark-list text-danger">
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

function StepList({ items }: { items: string[] }) {
  return (
    <ol className="step-list">
      {items.map((item, index) => (
        <li key={item}>
          <span className="step-num">{index + 1}</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
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
