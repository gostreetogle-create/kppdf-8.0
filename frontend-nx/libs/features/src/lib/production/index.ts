/**
 * `@kppdf/features/production` public API.
 *
 * TZ-NX-PRODUCTION-TO-FEATURES wave: relocates the Gantt/Cockpit
 * decomposition (DECOMP-B1 Stream A) out of `apps/kppdf-web` — pure helpers
 * in `util/`, dumb UI in `ui/`, facades + the shared `ProductionCockpitContext`
 * at the lib root. `production-cockpit.page.ts` stays in the app: it owns
 * chrome (ShellToolRail wiring, the escape-key handler) and is the route's
 * lazy-loaded component.
 */
export * from './util';
export * from './ui';
export * from './production-cockpit.context';
export * from './production-read.facade';
export * from './production-cockpit.facade';
export * from './gantt-bars.facade';
