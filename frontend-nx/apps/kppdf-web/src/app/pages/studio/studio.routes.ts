import type { Route } from '@angular/router';
import { studioDirtyGuard } from './studio-dirty.guard';

/**
 * TZ-NX-DOCSTUDIO-C2-THREE-SECTIONS — three live sections:
 * `/studio` (Документы) · `/studio/templates` (Шаблоны) · `/studio/:id` (Студия).
 * `templates` MUST be registered before `:id` so the editor never consumes
 * the literal segment as a document id.
 */
export const STUDIO_ROUTES: Route[] = [
  { path: '', loadComponent: () => import('./studio-list.page').then((m) => m.StudioListPage) },
  { path: 'templates', loadComponent: () => import('./studio-templates-list.page').then((m) => m.StudioTemplatesListPage) },
  {
    path: ':id',
    loadComponent: () => import('./studio-editor.page').then((m) => m.StudioEditorPage),
    canDeactivate: [studioDirtyGuard],
  },
];
