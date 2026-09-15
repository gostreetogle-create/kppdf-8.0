/**
 * `@kppdf/features/order-workspace` public API.
 *
 * TZ-NX-ORDER-WS-FACADE-SHELL: lib skeleton + `OrderWorkspaceFacade`
 * (Signals: order/status/error/paid, load + setPaid PATCH, quotation/meta
 * helpers). `ui/` populates across the following chain TZs
 * (HEADER/COMPOSITION/EXECUTION/LOGISTICS/DOCS-CHIPS) — see
 * `docs/agent-checklists/WAVE-NX-ORDER-WORKSPACE.md`.
 */
export * from './order-workspace.facade';
export * from './ui';
