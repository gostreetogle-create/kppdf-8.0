/**
 * TZ-NEW: Jest global setup — initialise Angular testing utilities.
 *
 * `jest-preset-angular` requires this file to:
 *   1) Load `zone.js` (Angular 20 still depends on Zone-based CD
 *      by default; signal-based CD is opt-in per-component).
 *   2) Register Angular's TestBed init helpers so `TestBed.configureTestingModule(...)`
 *      and `await render(Component, ...)` work without manual setup.
 *
 * Must be referenced from `jest.config.js` via `setupFilesAfterEnv`.
 *
 * Note: the older `import 'jest-preset-angular/setup-jest'` form is
 * deprecated in jest-preset-angular 14. The new API is
 * `setupZoneTestEnv()` from `jest-preset-angular/setup-env/zone`,
 * which keeps zone.js + Angular TestBed init in one explicit call.
 */
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();
