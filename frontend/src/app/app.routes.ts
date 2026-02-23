import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'check-email',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/check-email/check-email.component').then(m => m.CheckEmailComponent),
  },
  {
    path: 'verify-email',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'expenses', loadComponent: () => import('./features/expenses/expenses.component').then(m => m.ExpensesComponent) },
      { path: 'accounts', loadComponent: () => import('./features/accounts/accounts.component').then(m => m.AccountsComponent) },
      { path: 'categories', loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'goals', loadComponent: () => import('./features/goals/goals.component').then(m => m.GoalsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];