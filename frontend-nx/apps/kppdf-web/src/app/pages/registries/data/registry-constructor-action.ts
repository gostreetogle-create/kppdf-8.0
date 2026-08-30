import type { Router } from '@angular/router';
import type { RegistryRowAction } from '../model/registry.types';

/**
 * Row action «Открыть в Конструкторе» — only when `/constructor` is a real
 * NX route (see `collectPageRoutePaths`). Navigates to the workspace shell;
 * per-record edit routes do not exist yet (no fake deep links).
 */
export function buildOpenConstructorRowAction<TRow>(
  router: Router,
  existingPaths: ReadonlySet<string>,
): RegistryRowAction<TRow> | undefined {
  if (!existingPaths.has('/constructor')) {
    return undefined;
  }
  return {
    id: 'open-constructor',
    label: 'Открыть в Конструкторе',
    icon: 'layers',
    tone: 'doc',
    run: () => {
      void router.navigate(['/constructor']);
    },
  };
}
