import { useEffect, useRef } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const VIDEO_IDS = [
  "goblet-squat",
  "floor-press",
  "one-arm-row",
  "bent-over-row",
  "rdl",
  "reverse-lunge",
  "split-squat",
  "bulgarian-split-squat",
  "glute-bridge",
  "db-curl",
  "dead-bug",
  "side-plank",
  "farmer-carry",
  "march",
  "bw-squat",
  "hinge",
  "scap",
  "circles",
  "practice",
] as const;

const ALIAS: Record<string, string> = {
  practice: "goblet-squat",
};

function resolveId(id: string): string {
  return ALIAS[id] ?? id;
}

function hasVideo(id: string): boolean {
  const resolved = resolveId(id);
  return (VIDEO_IDS as readonly string[]).includes(resolved);
}

export function ExerciseVisual({
  id,
  paused,
  onTogglePause,
  className,
}: {
  id: string;
  paused?: boolean;
  onTogglePause?: () => void;
  className?: string;
}) {
  const srcId = resolveId(id);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const sync = (visible: boolean) => {
      if (paused || reduce || !visible) {
        el.pause();
        return;
      }
      void el.play().catch(() => undefined);
    };

    const io = new IntersectionObserver(
      ([entry]) => sync(entry.isIntersecting),
      { threshold: 0.35 },
    );
    io.observe(el);
    sync(true);
    return () => io.disconnect();
  }, [paused, srcId]);

  if (!hasVideo(id)) {
    return (
      <div className={cn("ex-visual grid place-items-center text-sm text-muted", className)}>
        {id}
      </div>
    );
  }

  return (
    <div className={cn("ex-visual", className)}>
      <video
        key={srcId}
        ref={videoRef}
        src={`/videos/${srcId}.mp4`}
        poster={`/videos/posters/${srcId}.jpg`}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={`${srcId.replace(/-/g, " ")} demonstration`}
      />
      {onTogglePause ? (
        <button
          type="button"
          onClick={onTogglePause}
          className="absolute right-2 bottom-2 size-10 rounded-md bg-bg/70 text-fg grid place-items-center"
          aria-label={paused ? "Play video" : "Pause video"}
        >
          {paused ? <Play className="size-4 ml-0.5" /> : <Pause className="size-4" />}
        </button>
      ) : null}
    </div>
  );
}
