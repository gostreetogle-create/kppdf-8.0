import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canMatch: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/login.page').then((m) => m.LoginPage),
    title: 'KPPDF — Вход',
  },
  {
    path: 'home',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/home/home.page').then((m) => m.HomePage),
    title: 'KPPDF — Главная',
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
