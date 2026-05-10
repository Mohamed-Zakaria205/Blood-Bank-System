# Mock Data Architecture Stabilization Report

## Fixed Issues

- Split centralized `src/app/data/mockData.ts` into domain files:
  - `src/app/data/auth.mock.ts`
  - `src/app/data/donors.mock.ts`
  - `src/app/data/campaigns.mock.ts`
  - `src/app/data/inventory.mock.ts`
  - `src/app/data/appointments.mock.ts`
  - `src/app/data/lab.mock.ts`
- Converted `src/app/data/mockData.ts` into a compatibility barrel that re-exports domain files, preserving current behavior while removing monolithic coupling.
- Rewired API modules to import only domain mock files (no API file imports from `mockData.ts` anymore):
  - `auth.ts`, `donors.ts`, `campaigns.ts`, `inventory.ts`, `appointments.ts`, `lab.ts`, `staff.ts`
- Removed duplicate appointment model declarations from the data layer by using centralized types from `src/app/types/*`.
- Removed usage of deprecated mock structures:
  - `TIME_SLOTS` removed from active exports.
  - `appointmentDays` removed from active exports.
  - `initialOutflowRecords` removed from active exports and replaced with derived outflow mock data generated from transactions in `inventory.ts`.
- Verified build integrity after refactor with `npm run build` (successful).

## Audit Results

### Direct mock imports in components

- No direct imports from mock data files were found under `src/app/components`.
- UI continues to consume data through hooks/API modules.

### Inconsistent ID types

- No `id: number` model definitions found in `src`; IDs are consistently string-based.

### Duplicate models/interfaces

- Removed duplicate `Slot15` and `Slot15Status` definitions from data layer usage path.
- Canonical types are now centralized under `src/app/types/*`.

### Date format consistency

- Mixed runtime formats still exist and may cause backend mismatch risk:
  - ISO date: `YYYY-MM-DD`
  - Full ISO timestamp: `toISOString()`
  - Locale timestamp: `toLocaleString('ar-EG')`
  - Space-separated datetime literals in mocks: `YYYY-MM-DD HH:mm`

### API response shape consistency

- API functions consistently return `PaginatedResponse<T>` or `ApiResponse<T>` in mock mode.
- Error throws are still ad-hoc object literals (`throw { response: ... }`) instead of a unified error class.

### Dead code / unused exports

- Monolithic data file logic has been eliminated; `mockData.ts` now acts only as a compatibility re-export layer.
- Removed obsolete outflow dataset dependency (`initialOutflowRecords`) from runtime usage.

## Remaining Risks

- `inventory` outflow mock derivation currently infers `donationType` as `'whole'` for all records; if UI/backend depends on precise original donation type, this may diverge.
- Mock timestamps still use multiple formats across domains, which may hide backend parsing issues.
- Some mock flows still generate IDs from `Date.now()` and random numbers, which can differ from backend-generated identifiers and sequencing expectations.
- Error handling shape is not yet normalized through a shared error adapter.

## Backend Integration Blockers

- No hard blocker from this refactor for compilation/runtime.
- Potential integration blockers to address before backend switch:
  - Inconsistent date/time formats across API mock branches.
  - Non-standardized mock error objects vs expected backend error contract.
  - Derived outflow records may not match eventual backend payload richness.

## Recommended Next Cleanup Steps

1. Introduce a shared date serialization utility for all API mock and real adapters.
2. Add a shared API error normalizer (`toApiError`) and migrate all throw sites.
3. Define endpoint-by-endpoint response contract tests (mock vs expected backend schema).
4. Add runtime guards (zod/io-ts) at API boundaries for backend payload validation.
5. Remove compatibility barrel `mockData.ts` after one transition cycle to enforce strict domain imports.
