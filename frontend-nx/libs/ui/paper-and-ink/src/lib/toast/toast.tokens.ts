/**
 * Reserved for future provider-mode Toast mount.
 *
 * Currently unused: <app-pi-toast-host> is mounted in app.ts root template
 * via selector (it owns the queue subscriber pattern via PiToastService).
 *
 * If a future TZ adds a service-driven alert (e.g. CDN-fail banner that
 * needs DI access to the host), drop an `export const PI_TOAST_HOST = new
 * InjectionToken<ToastHostComponent>('PI_TOAST_HOST');` here.
 */

export {};
