import type { Route } from '@angular/router';
import { studioDirtyGuard } from './studio-dirty.guard';

export const STUDIO_ROUTES: Route[] = [
  { path: '', loadComponent: () => import('./studio-list.page').then((m) => m.StudioListPage) },
  {
    path: ':id',
    loadComponent: () => import('./studio-editor.page').then((m) => m.StudioEditorPage),
    canDeactivate: [studioDirtyGuard],
  },
];
