# Decisions

## 2026-02-10T22:59:13Z
- Decision: focus this run on hardening settings deserialization in `appStore`.
- Rationale: observed direct casts (`as Tier`, `as Theme`) and unchecked numeric coercion (`Number(...)`) can yield invalid runtime state.
- Alternatives considered:
  - Broader schema validation library (rejected: unnecessary dependency/scope expansion).
  - Backend validation changes (rejected: no evidence of backend contract defect; frontend hydration is minimal-risk fix point).

## 2026-02-10T23:00:00Z
- Decision: keep hourly-rate parser permissive for any finite number (including 0/negative) to avoid policy change.
- Rationale: no existing repo invariant enforces minimum > 0; this run addresses malformed/non-numeric safety only.
- Alternative rejected: clamp hourly rate to positive values (would be behavior change requiring product decision).
