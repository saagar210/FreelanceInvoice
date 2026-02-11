# Delta Improvement Plan

## A) Executive Summary
### Current state (repo-grounded)
- Front-end is a React + TypeScript SPA with route-based pages and a shared `AppShell`. Key entry points are `src/main.tsx` and `src/App.tsx`.
- Front-end state management is Zustand (`src/stores/*`) with command adapters in `src/lib/commands.ts` invoking Tauri backend commands.
- Shared UI components have unit tests, plus store tests in Vitest (`src/components/shared/*.test.tsx`, `src/stores/*.test.ts`).
- Backend is a Tauri Rust app (`src-tauri/src/lib.rs`) exposing commands organized by domain modules (`src-tauri/src/commands/*`) and SQLite-backed persistence (`src-tauri/src/db/*`).
- Settings are loaded and saved through `useAppStore` (`src/stores/appStore.ts`) with simple key mapping and numeric conversion.
- Baseline JS verification is green (`pnpm build`, `pnpm exec vitest run`), while Rust verification is blocked by environment dependency (`glib-2.0`).

### Key risks
- `default_hourly_rate` is parsed using `Number(...)` without fallback on invalid values; malformed persisted settings can yield `NaN` and propagate into forms/calculations.
- `tier` and `theme` are cast with TypeScript assertions (`as Tier`, `as Theme`) with no runtime validation, so invalid persisted values can enter app state.
- `saveSetting` also coerces hourly rate via raw `Number(value)` and may store invalid number state locally.
- Error handling in `loadSettings` swallows exceptions (acceptable UX), but currently lacks selective normalization of retrieved values.

### Improvement themes (prioritized)
1. Harden settings deserialization/normalization in `appStore`.
2. Preserve backward compatibility and UX defaults when settings are invalid.
3. Expand regression tests for malformed settings inputs.

## B) Constraints & Invariants (Repo-derived)
### Explicit invariants
- Existing setting keys and backend API signatures in `src/lib/commands.ts` remain unchanged.
- Store defaults (`tier=free`, `theme=system`, `defaultHourlyRate=100`) remain the fallback behavior.
- No persistence schema changes (SQLite tables/columns untouched).

### Implicit invariants (inferred)
- UI expects `defaultHourlyRate` to be numeric for controlled inputs and downstream calculations.
- Theme values are expected to be one of `light|dark|system` by `useDarkMode` logic.
- Tier values are expected to be `free|pro|premium` for feature gating.

### Non-goals
- No redesign of settings architecture.
- No Rust/Tauri command changes.
- No broad form validation refactor beyond app store normalization.

## C) Proposed Changes by Theme (Prioritized)
### Theme 1: Runtime-safe settings normalization
- Current approach: direct type assertions and `Number` coercion in `src/stores/appStore.ts`.
- Proposed change: introduce narrow helper parsers for tier/theme/hourly rate with safe fallback defaults.
- Why: protects runtime state against malformed persisted values while preserving existing API.
- Tradeoffs: adds small helper code; avoids larger schema validation library dependency.
- Scope boundary: only `appStore` normalization paths in `loadSettings` and `saveSetting`.
- Migration approach: no data migration; invalid values are treated as defaults at read/update time.

### Theme 2: Regression coverage for invalid settings
- Current approach: tests cover happy paths and error catch, but not malformed values.
- Proposed change: add tests for invalid `tier`, `theme`, and `default_hourly_rate` load/save behavior.
- Why: prevents future regressions and documents expected fallback behavior.
- Tradeoffs: slight increase in test suite size.
- Scope boundary: `src/stores/appStore.test.ts` only.
- Migration approach: update tests first/alongside code for deterministic behavior.

## D) File/Module Delta (Exact)
### ADD
- `codex/SESSION_LOG.md` — iterative execution trail.
- `codex/DECISIONS.md` — explicit judgment calls.
- `codex/CHECKPOINTS.md` — resume-safe checkpoints.
- `codex/CHANGELOG_DRAFT.md` — delivery draft.

### MODIFY
- `src/stores/appStore.ts` — safe parsing helpers + integration into load/save flow.
- `src/stores/appStore.test.ts` — new malformed-setting regression tests.
- `codex/PLAN.md`, `codex/VERIFICATION.md` — planning/verification updates.

### REMOVE/DEPRECATE
- None.

### Boundary rules
- Allowed: `appStore` consuming existing `commands` API.
- Forbidden: changing command names/payloads or rust-side settings persistence.

## E) Data Models & API Contracts (Delta)
- Current definitions: `Tier` in `src/types/index.ts`; settings values returned as string pairs via `AppSetting`.
- Proposed changes: no contract changes; only runtime guards in front-end state hydration.
- Compatibility: fully backward compatible with current stored settings.
- Migrations: none required.
- Versioning strategy: N/A (internal app state behavior only).

## F) Implementation Sequence (Dependency-Explicit)
1. **Step S1 — Add parser helpers and wire into appStore**
   - Objective: prevent invalid settings from corrupting app state.
   - Files: `src/stores/appStore.ts`.
   - Preconditions: baseline JS checks green.
   - Dependencies: none.
   - Immediate verification: `pnpm exec vitest run src/stores/appStore.test.ts`.
   - Rollback plan: revert file if behavior/tests regress.

2. **Step S2 — Add malformed settings regression tests**
   - Objective: codify expected fallback behavior.
   - Files: `src/stores/appStore.test.ts`.
   - Preconditions: S1 merged locally.
   - Dependencies: S1 helper behavior.
   - Immediate verification: `pnpm exec vitest run src/stores/appStore.test.ts`.
   - Rollback plan: revert test-only changes if inconsistent with approved behavior.

3. **Step S3 — Full JS verification + finalize artifacts**
   - Objective: ensure repo remains healthy and logs complete.
   - Files: `codex/*` docs + any touched files.
   - Preconditions: S1/S2 passing targeted tests.
   - Dependencies: previous steps complete.
   - Immediate verification: `pnpm build` and `pnpm exec vitest run`.
   - Rollback plan: revert latest step and restore last green commit state.

## G) Error Handling & Edge Cases
- Current pattern: broad try/catch around `loadSettings`, no typed errors in UI store.
- Proposed improvement: deterministic normalization for invalid enum/number settings.
- Edge cases to cover:
  - non-numeric hourly rate (`abc`) => fallback to 100
  - negative/zero/hourly edge values: keep current behavior for numeric values (no policy change)
  - invalid tier/theme strings => fallback to `free`/`system`
- Tests:
  - load malformed map values
  - save invalid hourly rate string

## H) Integration & Testing Strategy
- Integration points: `SettingsPage` and hooks consuming `useAppStore` state; no API changes.
- Unit tests to modify/add: `src/stores/appStore.test.ts`.
- Regression suite: store tests + full Vitest + TS build.
- Definition of done:
  - targeted store tests pass
  - full JS verification passes
  - codex session artifacts updated with checkpoints and outcomes

## I) Assumptions & Judgment Calls
### Assumptions
- Persisted settings may contain stale/manual invalid values in real user environments.
- Fallback defaults are preferable to surfacing invalid raw values in UI state.

### Judgment calls
- Use lightweight local parser helpers instead of zod/yup dependency to keep scope small.
- Do not alter backend validation because issue is isolated to front-end hydration and local state sync.
