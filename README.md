# Forge Library

A workout library of 13 strength movements and two reference sessions. Browse setup, cues, common mistakes, and a short demo. Nothing is logged.

Live site: https://ashishkamra.github.io/workout-library/

## What's in it

- **Movements** — search and filter by pattern (squat, hinge, lunge, push, pull, core, carry, arms), equipment, or shoulder sensitivity.
- **Sessions** — Session A and Session B as readable pairings. Open any movement for the demo and form notes.

## Local preview

```bash
npm install
npm run dev
```

## GitHub Pages

Pushes to `main` run `.github/workflows/pages.yml`, which builds the static site and deploys it.

To build that site locally:

```bash
npm run build:pages
```

Output lands in `docs/` (gitignored). Asset paths are relative, so the same build works at `https://ashishkamra.github.io/workout-library/`.
