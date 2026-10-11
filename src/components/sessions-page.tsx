import { SESSIONS, doseLabel, sessionExercises } from "@/lib/catalog";
import { publicUrl } from "@/lib/public-url";

export function SessionsPage({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <main className="library-main">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
        Workout library
      </p>
      <h1 className="display mt-2 text-4xl">Sessions</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Two reference pairings. Read them, then open any movement for the demo and cues.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {SESSIONS.map((session) => {
          const exercises = sessionExercises(session);
          return (
            <section key={session.id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
              <h2 className="display text-2xl">{session.name}</h2>
              <p className="mt-1 text-sm text-muted">{session.summary}</p>
              {session.note ? (
                <p className="mt-2 text-sm text-subtle">{session.note}</p>
              ) : null}
              <ol className="mt-4 space-y-2">
                {exercises.map((ex, index) => (
                  <li key={ex.id}>
                    <button type="button" className="session-row" onClick={() => onOpen(ex.id)}>
                      <img
                        src={publicUrl(`videos/posters/${ex.id}.jpg`)}
                        alt=""
                        className="size-14 rounded-md object-cover"
                      />
                      <span className="min-w-0 text-left">
                        <span className="block text-sm font-medium">
                          {index + 1}. {ex.shortName}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">{doseLabel(ex)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </main>
  );
}
