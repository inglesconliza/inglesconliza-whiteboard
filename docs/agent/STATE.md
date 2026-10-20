# Agent State

- This repo is the InglesConLiza fork of `excalidraw/excalidraw`, cloned at `/home/gnu/excalidraw`.
- GitHub fork: `https://github.com/inglesconliza/excalidraw`.
- Live Telegram topic: `excalidraw` with topic id `29933`.
- Target production URL: `https://www.inglesconliza.com/whiteboard`.
- The app is served by the Cloudflare Worker `inglesconliza-whiteboard` on route `www.inglesconliza.com/whiteboard*`.
- The Vite app builds with `VITE_APP_BASE_PATH=/whiteboard/`; the Worker strips `/whiteboard` before serving static assets from `excalidraw-app/build`.
- `/whiteboard/health` returns deploy metadata.
- The generated PWA service worker is self-destroying for this fork so stale `/whiteboard` app-shell caches do not keep running older hashed bundles after deploys.

## Improvement program, 2026-10-20

- Planned first task: WHITEBOARD-01. See [repository improvement plan](IMPROVEMENT_PLAN_2026-10-20.md). No implementation or deployment has occurred in this planning task.
