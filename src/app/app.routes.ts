import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'captures',
    loadComponent: () => import('./features/captures/capture-list/capture-list.component').then(m => m.CaptureListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'captures/new',
    loadComponent: () => import('./features/captures/capture-new/capture-new.component').then(m => m.CaptureNewComponent),
    canActivate: [authGuard],
  },
  {
    path: 'captures/:id',
    loadComponent: () => import('./features/captures/capture-detail/capture-detail.component').then(m => m.CaptureDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'species',
    loadComponent: () => import('./features/species/species-list/species-list.component').then(m => m.SpeciesListComponent),
  },
  {
    path: 'species/:id',
    loadComponent: () => import('./features/species/species-detail/species-detail.component').then(m => m.SpeciesDetailComponent),
  },
  {
    path: 'groups/:id',
    loadComponent: () => import('./features/groups/group-detail/group-detail.component').then(m => m.GroupDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'badges',
    loadComponent: () => import('./features/badges/badges/badges.component').then(m => m.BadgesComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'captures' },
];
