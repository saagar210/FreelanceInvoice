# Changelog Draft

## Theme: Settings-state resilience
### What changed
- Hardened `useAppStore` setting hydration by adding runtime validation for `tier`, `theme`, and `default_hourly_rate`.
- Replaced unchecked casts/coercions with parser helpers that fall back to defaults when malformed values are encountered.
- Added regression tests that validate fallback behavior for invalid enum strings and invalid numeric values during both load and save flows.

### Why it changed
- Persisted settings are string-based and may contain stale/manual malformed values.
- Direct enum casts and raw numeric coercion can pollute app state (`NaN`/invalid literals), which risks downstream UI and calculation instability.

### User-visible behavior
- If settings contain invalid tier/theme/hourly-rate values, the app now safely defaults to:
  - tier: `free`
  - theme: `system`
  - default hourly rate: `100`
- No changes to command APIs, DB schema, or valid settings behavior.
