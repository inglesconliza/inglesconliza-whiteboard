# Agent Runbook

## Install

```bash
corepack prepare yarn@1.22.22 --activate
corepack yarn install --ignore-scripts
```

## Build

```bash
VITE_APP_BASE_PATH=/whiteboard/ VITE_APP_DISABLE_SENTRY=true VITE_APP_ENABLE_TRACKING=false VITE_APP_ENABLE_ESLINT=false corepack yarn build
```

## Local Worker Runtime Test

Build the app with the whiteboard base path, then run the actual Wrangler asset binding against the built output. This starts Wrangler in local-only mode and does not deploy:

```bash
VITE_APP_BASE_PATH=/whiteboard/ corepack yarn build:app
corepack yarn test:worker-runtime
```

The runtime test checks a nested HTML navigation, a missing JavaScript asset, and `HEAD`/`POST` requests against the local Worker.

## Deploy

```bash
node scripts/deploy-with-metadata.mjs
```

Dry run:

```bash
node scripts/deploy-with-metadata.mjs --dry-run
```

The deploy script injects `DEPLOY_BRANCH`, `DEPLOY_COMMIT_HASH`, and `DEPLOYED_AT` into Wrangler vars.

## Live Verification

```bash
curl -fsS https://www.inglesconliza.com/whiteboard/health
curl -fsSI https://www.inglesconliza.com/whiteboard/
curl -fsSL https://www.inglesconliza.com/whiteboard/ | grep 'Excalidraw'
curl -fsS https://www.inglesconliza.com/whiteboard/sw.js | grep 'registration.unregister'
```
