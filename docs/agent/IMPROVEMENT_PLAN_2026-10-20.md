# Excalidraw improvement plan, 2026-10-20

Status: planned, implementation not started by this documentation change. Coordinator: InglesConLiza manager. Requester: @guerrerocarlos.

Baseline: branch `master`, commit `f518b5393d4ffc91ca14e688d605f942f1526973`; working tree clean at planning inspection. Recheck both branch and dirty files before implementation. [Fleet review](https://github.com/inglesconliza/inglesconliza-manager/blob/main/docs/reviews/2026-10-16/REVIEW.md) is the finding baseline, not proof of a live fix. Source paths below are relative to this repository.

## First bounded task: WHITEBOARD-01

**Additional backlog item 11: custom Worker base-path smoke tests and upstream baseline.**

Inspected boundary: src/worker.ts; scripts/deploy-with-metadata.mjs; wrangler.jsonc; excalidraw-app build configuration; public/service-worker.js.

Add focused custom Worker tests for /whiteboard routing with mocked ASSETS and record current fork/upstream divergence with existing remotes and immutable revisions. Verify build base path and self-destroying PWA strategy. Keep editor code untouched. Record absent collaboration infrastructure/credentials as unknown rather than claiming collaboration works.

Acceptance: 308 redirect /whiteboard to /whiteboard/ preserving query; health metadata; routes outside prefix 404; asset path stripping; missing JS stays 404; HTML GET fallback; HEAD/non-GET do not incorrectly get fallback; nested route refresh. Build/browser smoke covers asset URLs, stale service-worker update, and preserved drawings.

Validation commands: `corepack yarn install --frozen-lockfile`, `corepack yarn test:typecheck`; run added Worker tests with `corepack yarn test:app --run <test-file>` after checking Vitest inclusion; `VITE_APP_BASE_PATH=/whiteboard/ corepack yarn build:app`. Record exact paths/commands and baseline unrelated failures. Do not run deploy as a build shortcut. These are implementation gates, not tests claimed run during this documentation-only task.

## Dependencies and ownership

Work independently on the custom Worker boundary. Confirm www landing route ownership and deployment target before release. Collaboration backend ownership is a separate audit and not permission to provision a new service. Upstream merges require reviewed fork diff and separate tests.

## Ordered remaining backlog

P2 additional item 11: upstream security/advisory baseline and incremental compatible merge plan, offline-update smoke coverage, collaboration ownership/recovery documentation. R23: fork release gate and exact metadata. Optional: bundle/network profiling and classroom browser acceptance. Avoid editor rewrite or broad dependency upgrade for fleet consistency.

Measure latency with representative synthetic fixtures and authenticated read-only runtime evidence when available. Record cold/warm behavior, payload size, errors and p50/p95/p99 before setting performance budgets. Health success alone is not functional or customer acceptance.

## Execution, reporting and release gates

1. Execute only the first bounded task initially. Read global/local instructions and applicable Cloudflare skills, revalidate finding against current source, preserve unrelated changes and add failing behavioral tests before a fix.
2. Report to the manager with task ID, status (running, blocked, verified or shipped), branch, commit, tests/counts, source evidence, dependency requests and next step. Manager owns program worklog and dispatch. Update this plan and STATE with actual progress; do not mark later phases complete by implication.
3. Before any production rollout, verify target bindings and branch, passing checks, exact artifact revision and health metadata. Use isolated synthetic/provider test fixtures first. First dispatch is local implementation/design/tests only; no deploy, remote migration, historical replay, backfill, content change or external sends.
4. Commit only task files and push after verification. Use `[skip ci]` for planning and first-dispatch commits to prevent auto-deploy; inspect workflows before every push. Report commit and branch, and keep documentation-only completion distinct from runtime remediation.
5. Rollout later: release a small independently verified change, observe errors/latency and required behavioral acceptance, then expand. Additive schema/contracts must support old and new consumers before producer changes. Record last known good deployed revision and schema compatibility before rollout.
6. Rollback: redeploy the recorded compatible artifact for code-only regressions. Pause new dispatch when ambiguous background effects appear; preserve job/outbox evidence and reconcile instead of blind replay. Do not delete persisted state or reverse schema changes without a tested recovery plan.

## Current blockers and next owner action

No blocker to starting this first local task. Missing test harnesses or dependencies are work to complete, not a reason to claim validation passed. Cross-repository contracts, product policy and production release approval remain gates only for the dependent follow-up phases described above.
