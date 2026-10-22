# WHITEBOARD-01 status, 2026-10-20

Requester: @guerrerocarlos. Work item: ICL-2026-10-20 #28. Coordinator: [InglesConLiza improvement program](https://github.com/inglesconliza/inglesconliza-manager/blob/main/docs/agent/IMPROVEMENT_PROGRAM_2026-10-20.md).

## Status

Verified locally, not shipped. The original package added focused custom Worker boundary coverage. The manager-reviewed follow-up below adds a real Wrangler asset-binding regression and fixes nested-route shell delivery. No deploy, customer send, migration, replay, copy change, manager edit, or queue-worker edit was performed.

- Branch: `improvement/whiteboard-01`.
- Implementation commit: `4d13e07dd843dbf6632013be8976b05afe437782` (`test(app): cover whiteboard Worker routing [skip ci]`).
- Release posture: nondeploying branch. Workflow inspection found `master` push tests, `release` publishing workflows, and pull-request workflows only. This branch does not match a deployment workflow.

## Delivered scope

Added `src/worker.test.ts` with eight mocked-`ASSETS` Worker cases. The tests lock the custom `/whiteboard` boundary without changing editor code:

- `308` bare-path redirect preserves the query string.
- health metadata remains local to the Worker and avoids asset fetches.
- routes outside `/whiteboard` return `404`.
- asset requests strip the base path, including a query string.
- HTML GET navigation and nested-route refresh fall back to the app shell.
- missing JavaScript assets remain `404`, and missing `HEAD` and `POST` requests do not receive HTML fallback.

## Checks and results

| Check | Result |
| --- | --- |
| `corepack yarn install --frozen-lockfile` | Passed using a fresh task-specific Yarn cache. The pre-existing shared Yarn cache was corrupt and was not changed. |
| `corepack yarn test:app --run src/worker.test.ts` | Passed, 1 file and 8 tests. |
| `corepack yarn test:typecheck` | Passed. |
| `VITE_APP_BASE_PATH=/whiteboard/ corepack yarn build:app` | Passed. Build emitted known upstream warnings for font resolution, ignored module-level `use client` directives, and chunks over 500 kB. |
| Built-artifact smoke | Passed for `/whiteboard/` asset URLs. Generated `sw.js` contains `skipWaiting`, `self.registration.unregister`, and `clients.matchAll`, confirming the configured self-destroying update strategy. |
| `corepack yarn test:app --run packages/excalidraw/tests/data/restore.test.ts` | Passed, 1 file and 51 tests. Expected negative-path diagnostics were emitted by that test. It supports, but does not replace, a real browser drawing-preservation acceptance check. |

## Evidence and limits

Source evidence: `src/worker.ts` implements the tested routing behavior. `scripts/deploy-with-metadata.mjs` supplies `/whiteboard/` as the Vite base path, while `excalidraw-app/vite.config.mts` enables the self-destroying PWA strategy. The production build confirms both output-path and generated-service-worker artifacts.

Live evidence: none collected. No deployment or production request was made, so this package does not assert live routing, asset availability, service-worker activation, collaboration, or customer drawing preservation. Collaboration infrastructure and credentials remain unverified, and are recorded as unknown.

Fork/upstream baseline: the only configured remote is `origin` (`https://github.com/inglesconliza/excalidraw.git`), and `origin/master` resolves to `beceb186eda642644dfe4894b3257ff04af6f843`. There is no configured `upstream` remote, so an exact current fork-versus-upstream commit divergence cannot be measured from existing remotes. The immutable whiteboard-specific source revisions remain `5921c1a16b733fe6f753b69057ae42e61713c76e` (route deployment) and `f518b5393d4ffc91ca14e688d605f942f1526973` (stale service-worker mitigation), followed by the plan baseline `beceb186eda642644dfe4894b3257ff04af6f843`.

## Blockers and next package

Release remains gated on manager review, target binding and branch confirmation, an exact artifact revision, and authenticated live health verification. A real browser smoke for initial load, service-worker replacement, nested-route refresh, and a preserved local drawing is still required before a release claim. Do not infer collaboration readiness from the source tree. The accepted push warned that this repository moved to `git@github.com:inglesconliza/inglesconliza-whiteboard.git`; manager review should confirm the canonical remote before later release work.

Stop after WHITEBOARD-01. The manager should review this isolated test package and select the next ordered backlog item. Listmonk activation remains deferred.

## Manager-reviewed follow-up, 2026-10-22

Task: WHITEBOARD-01 nested-route Wrangler runtime correction. Status: verified locally, not shipped. Branch: `improvement/whiteboard-01`. Implementation commit: `7a754123121a7ddf2f73ef7050dce127c25957e1` (`fix(worker): keep nested whiteboard routes in app shell`).

The actual Wrangler `ASSETS` binding returns a 404 for an unknown nested path, then redirects an explicit `/index.html` binding request to `/` under its HTML handling. The Worker now fetches `/` for its HTML-navigation fallback, preserving the requested `/whiteboard/room/...` URL. The existing `ASSETS` missing-file behavior remains unchanged. No unrelated files, editor code, copy, manager files, or queue workers were changed.

| Check | Result |
| --- | --- |
| `corepack yarn test:app --run src/worker.test.ts` | Passed, 1 file and 8 tests. The nested-route mock now returns the app shell for the actual binding fallback path `/`. |
| `corepack yarn test:typecheck` | Passed. |
| `VITE_APP_BASE_PATH=/whiteboard/ corepack yarn build:app` | Passed. Existing font resolution, ignored `use client`, dynamic/static import, and large-chunk warnings remain. |
| `corepack yarn test:worker-runtime` | Passed against local Wrangler and the built asset directory. `/whiteboard/room/runtime-regression` returned the app shell with HTTP 200 and no redirect; missing JavaScript returned 404; `HEAD` and `POST` did not receive the app shell. |
| `eslint --max-warnings=0 scripts/test-worker-runtime.mjs` and Prettier check | Passed. |

Source evidence: `src/worker.ts`, `wrangler.jsonc`, `src/worker.test.ts`, and `scripts/test-worker-runtime.mjs`. The runtime test launches Wrangler with `--local` and exercises the configured `ASSETS` binding, rather than a mocked binding.

Live evidence: none for this follow-up. No production request or deployment was made. The source change and local runtime test do not establish the deployed revision or live nested-route behavior.

Blockers and next action: production release gates remain unchanged, including manager review, target binding and branch confirmation, exact artifact revision, and authenticated live health verification. Stop here for manager review and select the next package independently. Do not close ICL-2026-10-20 #28 based on this follow-up. Listmonk activation remains deferred.
