import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'task-panel',
        loadComponent: () =>
          import('./pages/task-panel/task-panel.page').then((m) => m.TaskPanelPage),
      },
      {
        path: 'p/:id',
        loadComponent: () =>
          import('./pages/page-renderer').then((m) => m.PageRenderer),
      },
      {
        path: 'admin/gates',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () =>
          import('./pages/admin/gates.admin.page').then((m) => m.GatesAdminPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
