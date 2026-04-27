import { Component, inject, signal, HostListener, computed, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { NotificationService } from '../../../core/services/notification.service';

const GRACE_DAYS = 7;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  styles: [`
    :host { display: block; }
    /* padding bottom pour bottom nav mobile */
    @media (max-width: 767px) {
      :host + * { padding-bottom: 4rem; }
    }
  `],
  template: `
    <!-- Bannière vérification email -->
    @if (showEmailBanner()) {
      <div class="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-3">
        <p class="text-xs text-amber-800">
          📬 <strong>Confirme ton email</strong> — {{ graceDaysLeft() }} jour{{ graceDaysLeft() > 1 ? 's' : '' }} restant{{ graceDaysLeft() > 1 ? 's' : '' }}
        </p>
        <div class="flex items-center gap-2 shrink-0">
          <button (click)="resendVerification()" class="text-xs font-semibold text-amber-700 underline">Renvoyer</button>
          <button (click)="dismissBanner()" class="text-amber-400 text-lg leading-none">×</button>
        </div>
      </div>
    }

    <!-- Header desktop -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-warm-200">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2 font-bold text-warm-900 hover:opacity-75 transition-opacity shrink-0">
          <span class="text-xl">🎣</span>
          <span class="text-sm tracking-tight hidden sm:block">FishDex</span>
        </a>

        <!-- Nav desktop -->
        <nav class="hidden md:flex items-center gap-0.5">
          @for (item of navItems; track item.path) {
            @if (!item.authOnly || user()) {
              <a [routerLink]="item.path" routerLinkActive="bg-warm-100 text-warm-900"
                 class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium whitespace-nowrap">
                {{ item.label }}
              </a>
            }
          }
        </nav>

        <!-- Actions desktop -->
        <div class="hidden md:flex items-center gap-1.5">
          @if (user(); as u) {
            <!-- Notif -->
            <a routerLink="/notifications" class="relative flex items-center justify-center w-9 h-9 rounded-lg text-warm-500 hover:bg-warm-100 transition-all" title="Notifications">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              @if (notifService.unreadCount() > 0) {
                <span class="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                  {{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}
                </span>
              }
            </a>
            <!-- Profile -->
            <a routerLink="/profile"
               class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium text-warm-700 hover:bg-warm-100 transition-all">
              <span class="w-6 h-6 rounded-full bg-forest-600 text-white text-xs flex items-center justify-center font-bold">
                {{ u.username.charAt(0).toUpperCase() }}
              </span>
              <span class="hidden lg:block">{{ u.username }}</span>
            </a>
            <button (click)="logout()"
                    class="px-3 py-1.5 rounded-lg text-xs text-warm-400 hover:text-red-500 hover:bg-red-50 transition-all font-medium">
              Déco
            </button>
          } @else {
            <a routerLink="/login" class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:bg-warm-100 transition-all font-medium">Connexion</a>
            <a routerLink="/register" class="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-forest-600 hover:bg-forest-700 transition-all">S'inscrire</a>
          }
        </div>

        <!-- Mobile : notif + avatar -->
        <div class="flex md:hidden items-center gap-2">
          @if (user(); as u) {
            <a routerLink="/notifications" class="relative flex items-center justify-center w-9 h-9 rounded-lg text-warm-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              @if (notifService.unreadCount() > 0) {
                <span class="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                  {{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}
                </span>
              }
            </a>
            <a routerLink="/profile">
              <span class="w-8 h-8 rounded-full bg-forest-600 text-white text-sm flex items-center justify-center font-bold">
                {{ u.username.charAt(0).toUpperCase() }}
              </span>
            </a>
          } @else {
            <a routerLink="/login" class="px-3 py-1.5 rounded-lg text-sm text-warm-600 font-medium">Connexion</a>
            <a routerLink="/register" class="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-forest-600">S'inscrire</a>
          }
        </div>

      </div>
    </header>

    <!-- ── BOTTOM NAV MOBILE ──────────────────────────────────────────── -->
    @if (user()) {
      <nav class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-warm-200 safe-area-inset-bottom">
        <div class="flex items-stretch h-16">
          @for (item of bottomNavItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive #rla="routerLinkActive"
               class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
               [class]="rla.isActive ? 'text-forest-700' : 'text-warm-400'">
              <span class="text-xl leading-none">{{ item.icon }}</span>
              <span class="text-[10px] font-medium leading-none">{{ item.label }}</span>
            </a>
          }
          <!-- Bouton + central -->
          <a routerLink="/captures/new"
             class="flex-1 flex flex-col items-center justify-center">
            <span class="w-11 h-11 bg-forest-600 rounded-2xl flex items-center justify-center shadow-lg shadow-forest-600/30 text-white text-2xl leading-none -mt-4">
              +
            </span>
          </a>
          @for (item of bottomNavItemsRight; track item.path) {
            <a [routerLink]="item.path" routerLinkActive #rla2="routerLinkActive"
               class="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
               [class]="rla2.isActive ? 'text-forest-700' : 'text-warm-400'">
              <span class="text-xl leading-none">{{ item.icon }}</span>
              <span class="text-[10px] font-medium leading-none">{{ item.label }}</span>
            </a>
          }
        </div>
      </nav>
    }
  `,
})
export class NavbarComponent implements OnInit {
  private auth    = inject(AuthService);
  private router  = inject(Router);
  private toast   = inject(ToastService);
  notifService    = inject(NotificationService);

  user     = toSignal(this.auth.currentUser$, { initialValue: this.auth.currentUser$.getValue() });
  private bannerDismissed = signal(false);

  // Desktop nav
  navItems = [
    { path: '/feed',        label: 'Feed',      authOnly: true  },
    { path: '/captures',    label: 'Captures',  authOnly: false },
    { path: '/species',     label: 'Espèces',   authOnly: false },
    { path: '/friends',     label: 'Amis',      authOnly: true  },
    { path: '/stats',       label: 'Stats',     authOnly: true  },
    { path: '/map',         label: '🗺️ Carte',  authOnly: true  },
    { path: '/badges',      label: 'Badges',    authOnly: true  },
    { path: '/groups',      label: 'Groupes',   authOnly: true  },
    { path: '/leaderboard', label: '🏆',        authOnly: false },
  ];

  // Mobile bottom nav — 2 gauche + bouton + + 2 droite
  bottomNavItems = [
    { path: '/feed',     icon: '🏠', label: 'Feed'     },
    { path: '/captures', icon: '🎣', label: 'Captures' },
  ];
  bottomNavItemsRight = [
    { path: '/friends',  icon: '👥', label: 'Amis'    },
    { path: '/profile',  icon: '👤', label: 'Profil'  },
  ];

  showEmailBanner = computed(() => {
    const u = this.user();
    if (!u || u.emailVerified || this.bannerDismissed()) return false;
    const daysOld = (Date.now() - new Date(u.createdAt).getTime()) / 86_400_000;
    return daysOld <= GRACE_DAYS;
  });

  graceDaysLeft = computed(() => {
    const u = this.user();
    if (!u) return 0;
    const daysOld = (Date.now() - new Date(u.createdAt).getTime()) / 86_400_000;
    return Math.max(0, Math.ceil(GRACE_DAYS - daysOld));
  });

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(u => {
      if (u) this.notifService.startPolling();
      else   this.notifService.stopPolling();
    });
  }

  dismissBanner():       void { this.bannerDismissed.set(true); }
  resendVerification():  void {
    this.auth.resendVerification().subscribe({
      next:  () => this.toast.success('Email de confirmation renvoyé !'),
      error: () => this.toast.error('Impossible d\'envoyer l\'email.'),
    });
    this.dismissBanner();
  }

  logout(): void {
    this.notifService.stopPolling();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
