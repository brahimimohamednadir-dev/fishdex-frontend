import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ─── Public ──────────────────────────────────────────────────────────────
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
    path: 'verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent),
  },
  {
    path: 'species',
    loadComponent: () => import('./features/species/species-list/species-list.component').then(m => m.SpeciesListComponent),
  },
  {
    path: 'species/:id',
    loadComponent: () => import('./features/species/species-detail/species-detail.component').then(m => m.SpeciesDetailComponent),
  },

  // ─── 2FA (semi-public — token temporaire requis) ──────────────────────────
  {
    path: '2fa',
    loadComponent: () => import('./features/auth/two-factor/two-factor.component').then(m => m.TwoFactorComponent),
  },
  {
    path: '2fa/backup',
    loadComponent: () => import('./features/auth/two-factor/two-factor.component').then(m => m.TwoFactorComponent),
  },

  // ─── Protégées ────────────────────────────────────────────────────────────
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

  // ─── Groupes ──────────────────────────────────────────────────────────────
  {
    path: 'groups',
    loadComponent: () => import('./features/groups/groups-dashboard/groups-dashboard.component').then(m => m.GroupsDashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'groups/discover',
    loadComponent: () => import('./features/groups/groups-discover/groups-discover.component').then(m => m.GroupsDiscoverComponent),
    canActivate: [authGuard],
  },
  {
    path: 'groups/new',
    loadComponent: () => import('./features/groups/group-new/group-new.component').then(m => m.GroupNewComponent),
    canActivate: [authGuard],
  },
  {
    path: 'groups/:id',
    loadComponent: () => import('./features/groups/group-detail/group-detail.component').then(m => m.GroupDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'groups/:id/members',
    loadComponent: () => import('./features/groups/group-members/group-members.component').then(m => m.GroupMembersComponent),
    canActivate: [authGuard],
  },
  {
    path: 'groups/:id/admin',
    loadComponent: () => import('./features/groups/group-admin/group-admin.component').then(m => m.GroupAdminComponent),
    canActivate: [authGuard],
  },
  {
    path: 'groups/:id/admin/requests',
    loadComponent: () => import('./features/groups/group-requests/group-requests.component').then(m => m.GroupRequestsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'groups/:id/admin/reports',
    loadComponent: () => import('./features/groups/group-reports/group-reports.component').then(m => m.GroupReportsComponent),
    canActivate: [authGuard],
  },

  // ─── Profil public (accessible sans auth) ────────────────────────────────
  {
    path: 'u/:username',
    loadComponent: () => import('./features/profile/public-profile/public-profile.component')
      .then(m => m.PublicProfileComponent),
  },

  // ─── Leaderboard (public) ─────────────────────────────────────────────────
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent),
  },

  // ─── Carte des spots ──────────────────────────────────────────────────────
  {
    path: 'map',
    loadComponent: () => import('./features/map/map.component').then(m => m.MapComponent),
    canActivate: [authGuard],
  },

  // ─── Stats personnelles ───────────────────────────────────────────────────
  {
    path: 'stats',
    loadComponent: () => import('./features/stats/stats.component').then(m => m.StatsComponent),
    canActivate: [authGuard],
  },

  // ─── Social ───────────────────────────────────────────────────────────────
  {
    path: 'feed',
    loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent),
    canActivate: [authGuard],
  },
  {
    path: 'friends',
    loadComponent: () => import('./features/friends/friends.component').then(m => m.FriendsComponent),
    canActivate: [authGuard],
  },

  // ─── Notifications ────────────────────────────────────────────────────────
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [authGuard],
  },

  // ─── Profile / Badges ─────────────────────────────────────────────────────
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile/sessions',
    loadComponent: () => import('./features/profile/profile-sessions/profile-sessions.component').then(m => m.ProfileSessionsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'badges',
    loadComponent: () => import('./features/badges/badges/badges.component').then(m => m.BadgesComponent),
    canActivate: [authGuard],
  },
  {
    path: '2fa/setup',
    loadComponent: () => import('./features/auth/two-factor-setup/two-factor-setup.component').then(m => m.TwoFactorSetupComponent),
    canActivate: [authGuard],
  },
  {
    path: '2fa/backup-codes',
    loadComponent: () => import('./features/auth/backup-codes/backup-codes.component').then(m => m.BackupCodesComponent),
    canActivate: [authGuard],
  },

  // ─── Pages légales (public) ───────────────────────────────────────────────
  {
    path: 'cgu',
    loadComponent: () => import('./features/legal/cgu.component').then(m => m.CguComponent),
    title: 'Conditions Générales d\'Utilisation — FishDex',
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/legal/privacy.component').then(m => m.PrivacyComponent),
    title: 'Politique de Confidentialité — FishDex',
  },

  { path: '**', redirectTo: 'captures' },
];
