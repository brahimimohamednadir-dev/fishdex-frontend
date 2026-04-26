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
  template: `
    <!-- Bannière vérification email (grace period 7j) -->
    @if (showEmailBanner()) {
      <div class="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center justify-between gap-3">
        <p class="text-xs text-amber-800">
          📬 <strong>Confirme ton email</strong> pour accéder à toutes les fonctionnalités.
          Il te reste {{ graceDaysLeft() }} jour{{ graceDaysLeft() > 1 ? 's' : '' }}.
        </p>
        <div class="flex items-center gap-3 shrink-0">
          <button (click)="resendVerification()"
                  class="text-xs font-semibold text-amber-700 hover:text-amber-900 underline transition-colors">
            Renvoyer
          </button>
          <button (click)="dismissBanner()" class="text-amber-400 hover:text-amber-700 transition-colors text-base leading-none">×</button>
        </div>
      </div>
    }

    <header class="sticky top-0 z-50 bg-warm-50/95 backdrop-blur-sm border-b border-warm-200">
      <div class="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">

        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2 font-semibold text-warm-900 hover:opacity-70 transition-opacity shrink-0">
          <span class="text-lg">🎣</span>
          <span class="text-sm tracking-tight">FishDex</span>
        </a>

        <!-- Nav desktop -->
        <nav class="hidden md:flex items-center gap-0.5">
          <a routerLink="/captures" routerLinkActive="!text-warm-900 !bg-warm-200"
             class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
            Captures
          </a>
          <a routerLink="/species" routerLinkActive="!text-warm-900 !bg-warm-200"
             class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
            Espèces
          </a>
          @if (user()) {
            <a routerLink="/feed" routerLinkActive="!text-warm-900 !bg-warm-200"
               class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
              Feed
            </a>
            <a routerLink="/friends" routerLinkActive="!text-warm-900 !bg-warm-200"
               class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
              Amis
            </a>
            <a routerLink="/badges" routerLinkActive="!text-warm-900 !bg-warm-200"
               class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
              Badges
            </a>
            <a routerLink="/groups" routerLinkActive="!text-warm-900 !bg-warm-200"
               class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
              Groupes
            </a>
          }
        </nav>

        <!-- Actions desktop -->
        <div class="hidden md:flex items-center gap-2">
          @if (user(); as u) {
            <!-- Notification bell -->
            <a routerLink="/notifications"
               class="relative flex items-center justify-center w-9 h-9 rounded-lg text-warm-600 hover:bg-warm-200 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              @if (notifService.unreadCount() > 0) {
                <span class="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                  {{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}
                </span>
              }
            </a>

            <a routerLink="/profile"
               class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-warm-700 hover:bg-warm-200 transition-all">
              <span class="w-6 h-6 rounded-full bg-forest-600 text-white text-xs flex items-center justify-center font-semibold">
                {{ u.username.charAt(0).toUpperCase() }}
              </span>
              <span>{{ u.username }}</span>
            </a>
            <button (click)="logout()"
                    class="px-3 py-1.5 rounded-lg text-sm text-warm-500 hover:text-warm-900 hover:bg-warm-200 transition-all font-medium">
              Déconnexion
            </button>
          } @else {
            <a routerLink="/login"
               class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
              Connexion
            </a>
            <a routerLink="/register"
               class="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-forest-600 hover:bg-forest-700 transition-all">
              S'inscrire
            </a>
          }
        </div>

        <!-- Hamburger mobile -->
        <button (click)="toggleMenu()"
                class="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-warm-200 transition-all"
                [attr.aria-label]="menuOpen() ? 'Fermer' : 'Menu'">
          @if (menuOpen()) {
            <svg class="w-5 h-5 text-warm-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          } @else {
            <svg class="w-5 h-5 text-warm-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          }
        </button>
      </div>

      <!-- Menu mobile -->
      @if (menuOpen()) {
        <div class="md:hidden border-t border-warm-200 bg-warm-50 px-4 py-3 space-y-1">
          <a routerLink="/captures" (click)="closeMenu()"
             routerLinkActive="!bg-warm-200 !text-warm-900"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-100 transition-all">
            🎣 Captures
          </a>
          <a routerLink="/species" (click)="closeMenu()"
             routerLinkActive="!bg-warm-200 !text-warm-900"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-100 transition-all">
            🐟 Espèces
          </a>
          @if (user(); as u) {
            <a routerLink="/feed" (click)="closeMenu()"
               routerLinkActive="!bg-warm-200 !text-warm-900"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-100 transition-all">
              🏠 Feed
            </a>
            <a routerLink="/friends" (click)="closeMenu()"
               routerLinkActive="!bg-warm-200 !text-warm-900"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-100 transition-all">
              👥 Amis
            </a>
            <a routerLink="/badges" (click)="closeMenu()"
               routerLinkActive="!bg-warm-200 !text-warm-900"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-100 transition-all">
              🏆 Badges
            </a>
            <a routerLink="/groups" (click)="closeMenu()"
               routerLinkActive="!bg-warm-200 !text-warm-900"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-100 transition-all">
              🏕️ Groupes
            </a>
            <a routerLink="/notifications" (click)="closeMenu()"
               routerLinkActive="!bg-warm-200 !text-warm-900"
               class="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-100 transition-all">
              <span class="flex items-center gap-3">🔔 Notifications</span>
              @if (notifService.unreadCount() > 0) {
                <span class="text-xs font-bold text-white bg-red-500 rounded-full px-1.5 py-0.5">
                  {{ notifService.unreadCount() }}
                </span>
              }
            </a>
            <a routerLink="/profile" (click)="closeMenu()"
               routerLinkActive="!bg-warm-200 !text-warm-900"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-100 transition-all">
              <span class="w-6 h-6 rounded-full bg-forest-600 text-white text-xs flex items-center justify-center font-semibold">
                {{ u.username.charAt(0).toUpperCase() }}
              </span>
              {{ u.username }}
            </a>
            <div class="pt-2 border-t border-warm-200">
              <button (click)="logout()"
                      class="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
                Déconnexion
              </button>
            </div>
          } @else {
            <div class="pt-2 border-t border-warm-200 flex gap-2">
              <a routerLink="/login" (click)="closeMenu()"
                 class="flex-1 text-center py-2.5 rounded-xl text-sm font-medium text-warm-700 bg-warm-100 hover:bg-warm-200 transition-all">
                Connexion
              </a>
              <a routerLink="/register" (click)="closeMenu()"
                 class="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-forest-600 hover:bg-forest-700 transition-all">
                S'inscrire
              </a>
            </div>
          }
        </div>
      }
    </header>
  `,
})
export class NavbarComponent implements OnInit {
  private auth    = inject(AuthService);
  private router  = inject(Router);
  private toast   = inject(ToastService);
  notifService    = inject(NotificationService);

  user     = toSignal(this.auth.currentUser$, { initialValue: this.auth.currentUser$.getValue() });
  menuOpen = signal(false);
  private bannerDismissed = signal(false);

  showEmailBanner = computed(() => {
    const u = this.user();
    if (!u || u.emailVerified || this.bannerDismissed()) return false;
    const created = new Date(u.createdAt).getTime();
    const daysOld = (Date.now() - created) / (1000 * 60 * 60 * 24);
    return daysOld <= GRACE_DAYS;
  });

  graceDaysLeft = computed(() => {
    const u = this.user();
    if (!u) return 0;
    const created = new Date(u.createdAt).getTime();
    const daysOld = (Date.now() - created) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(GRACE_DAYS - daysOld));
  });

  ngOnInit(): void {
    // BehaviorSubject emits current value immediately, so this handles both
    // the initial state and future login/logout events in one place
    this.auth.currentUser$.subscribe(u => {
      if (u) this.notifService.startPolling();
      else this.notifService.stopPolling();
    });
  }

  dismissBanner(): void { this.bannerDismissed.set(true); }

  resendVerification(): void {
    this.auth.resendVerification().subscribe({
      next:  () => this.toast.success('Email de confirmation renvoyé !'),
      error: () => this.toast.error('Impossible d\'envoyer l\'email.'),
    });
    this.dismissBanner();
  }

  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu():  void { this.menuOpen.set(false); }

  logout(): void {
    this.closeMenu();
    this.notifService.stopPolling();
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeMenu(); }
}
