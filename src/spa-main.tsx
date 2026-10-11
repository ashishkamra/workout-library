import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ExercisePage } from "@/components/exercise-page";
import { LibraryHome } from "@/components/library-home";
import { SessionsPage } from "@/components/sessions-page";
import { SiteHeader } from "@/components/site-header";
import "./styles.css";

function readHash(): string {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return path.split("?")[0] || "/";
}

function go(to: string) {
  window.location.hash = to;
  window.scrollTo(0, 0);
}

function PagesApp() {
  const [path, setPath] = useState(readHash);

  useEffect(() => {
    const sync = () => setPath(readHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const detail = path.match(/^\/library\/([^/]+)$/);

  return (
    <div className="app-shell">
      <SiteHeader path={path} />
      {detail ? (
        <ExercisePage id={decodeURIComponent(detail[1])} onBack={() => go("/")} />
      ) : path.startsWith("/sessions") ? (
        <SessionsPage onOpen={(id) => go(`/library/${id}`)} />
      ) : (
        <LibraryHome onOpen={(id) => go(`/library/${id}`)} />
      )}
    </div>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<PagesApp />);
