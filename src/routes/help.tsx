import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Label, Screen } from "@/components/screen";

export const Route = createFileRoute("/help")({
  component: HelpPage,
});

function HelpPage() {
  return (
    <Screen>
      <h1 className="display text-3xl">Use on Android</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        FORGE is built to run on your phone without an account or a gym-server. After
        the first load, it keeps working offline.
      </p>

      <Card className="mt-5 space-y-2">
        <Label>Add to Home Screen</Label>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>Open this app in Chrome on your Android phone.</li>
          <li>Tap the menu (three dots).</li>
          <li>Choose Add to Home screen or Install app.</li>
          <li>Confirm. FORGE appears like a regular app. Open it from the icon; it works without the browser chrome.</li>
        </ol>
      </Card>

      <Card className="mt-4 space-y-2">
        <Label>Option A · Local web server app</Label>
        <p className="text-sm leading-relaxed text-muted">
          If you copied the app files onto the phone, install a lightweight local server
          such as Simple HTTP Server or PHA from the Play Store. Point it at the folder
          that contains the app, start it, then open the address it shows in Chrome.
          Use Add to Home screen so it launches like an app.
        </p>
      </Card>

      <Card className="mt-4 space-y-2">
        <Label>Option B · Termux</Label>
        <p className="text-sm leading-relaxed text-muted">
          In Termux, move into the app folder and run a local static server on port 8080.
          Then open that local address in Chrome and add it to the home screen.
        </p>
        <pre className="overflow-x-auto rounded-md bg-raised p-3 text-xs text-fg">
          {`python -m http.server 8080`}
        </pre>
      </Card>

      <Card className="mt-4">
        <Label>Shoulder</Label>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This is not a rehabilitation program. Stop if pain is sharp, increasing, or
          leaves you weaker. Persistent pain belongs with a clinician, not another set.
        </p>
      </Card>

      <Link to="/settings" className="mt-6 block text-center text-sm text-accent">
        Back to settings
      </Link>
    </Screen>
  );
}
