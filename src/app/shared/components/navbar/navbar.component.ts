import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppNotification } from '../../../core/models/notification.model';

const GRACE_DAYS = 7;

const TYPE_ICONS: Partial<Record<string, string>> = {
  JOIN_REQUEST_ACCEPTED: '✅', JOIN_REQUEST_REJECTED: '❌',
  POST_REACTION: '❤️', POST_COMMENT: '💬', COMMENT_REPLY: '↩️',
  GROUP_KICKED: '🚫', POST_PINNED: '📌',
  FRIEND_REQUEST: '👋', FRIEND_ACCEPTED: '🤝',
  CAPTURE_LIKED: '❤️', CAPTURE_COMMENTED: '💬',
};

const TYPE_TEXTS: Partial<Record<string, string>> = {
  JOIN_REQUEST_ACCEPTED: 'a accepté ta demande dans',
  JOIN_REQUEST_REJECTED: 'a refusé ta demande dans',
  POST_REACTION: 'a réagi à ton post',
  POST_COMMENT: 'a commenté ton post',
  COMMENT_REPLY: 'a répondu à ton commentaire',
  GROUP_KICKED: 't\'a retiré du groupe',
  POST_PINNED: 'a épinglé ton post dans',
  FRIEND_REQUEST: 't\'a envoyé une demande d\'ami',
  FRIEND_ACCEPTED: 'a accepté ta demande d\'ami',
  CAPTURE_LIKED: 'a aimé ta capture',
  CAPTURE_COMMENTED: 'a commenté ta capture',
};

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Bannière vérification email -->
    @if (showEmailBanner()) {
      <div class="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-3">
        <p class="text-xs text-amber-800">
          📬 <strong>Confirme ton email</strong> — {{ graceDaysLeft() }} jour{{ graceDaysLeft() > 1 ? 's' : '' }} restant{{ graceDaysLeft() > 1 ? 's' : '' }}
        </p>
        <div class="flex items-center gap-2 shrink-0">
          <button (click)="resendVerification()" class="text-xs font-semibold text-amber-700 underline">Renvoyer</button>
          <button (click)="dismissBanner()" class="text-amber-400 text-lg leading-none px-1">×</button>
        </div>
      </div>
    }

    <!-- ── HEADER TOP ─────────────────────────────────────────────────────── -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-warm-200">
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2 font-bold text-warm-900 hover:opacity-75 transition-opacity shrink-0">
          <span class="text-xl">🎣</span>
          <span class="text-sm tracking-tight hidden sm:block">FishDex</span>
        </a>

        <!-- Nav desktop (cachée sur mobile) -->
        <nav class="hidden md:flex items-center gap-0.5">
          <a routerLink="/feed" routerLinkActive="!bg-warm-100 !text-warm-900"
             class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium"
             *ngIf="false">Feed</a>

          @if (user()) {
            <a routerLink="/feed" routerLinkActive="bg-warm-100 text-warm-900"
               class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
              Feed
            </a>
          }
          <a routerLink="/captures" routerLinkActive="bg-warm-100 text-warm-900"
             class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
            Captures
          </a>
          <a routerLink="/species" routerLinkActive="bg-warm-100 text-warm-900"
             class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
            Espèces
          </a>
          @if (user()) {
            <a routerLink="/friends" routerLinkActive="bg-warm-100 text-warm-900"
               class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
              Amis
            </a>
            <a routerLink="/stats" routerLinkActive="bg-warm-100 text-warm-900"
               class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
              Stats
            </a>
            <a routerLink="/map" routerLinkActive="bg-warm-100 text-warm-900"
               class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
              🗺️ Carte
            </a>
            <a routerLink="/badges" routerLinkActive="bg-warm-100 text-warm-900"
               class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
              Badges
            </a>
            <a routerLink="/groups" routerLinkActive="bg-warm-100 text-warm-900"
               class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
              Groupes
            </a>
          }
          <a routerLink="/leaderboard" routerLinkActive="bg-warm-100 text-warm-900"
             class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-all font-medium">
            🏆
          </a>
        </nav>

        <!-- Actions desktop -->
        <div class="hidden md:flex items-center gap-1.5">
          @if (user(); as u) {
            <!-- Cloche notifications -->
            <div class="relative">
              <button (click)="toggleNotif($event)"
                      class="relative flex items-center justify-center w-9 h-9 rounded-lg text-warm-500 hover:bg-warm-100 transition-all"
                      title="Notifications">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                @if (notifService.unreadCount() > 0) {
                  <span class="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                    {{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}
                  </span>
                }
              </button>

              <!-- Dropdown notifications -->
              @if (notifOpen()) {
                <div class="absolute right-0 top-11 w-80 bg-white border border-warm-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div class="flex items-center justify-between px-4 py-3 border-b border-warm-100">
                    <span class="text-sm font-semibold text-warm-900">Notifications</span>
                    @if (notifService.unreadCount() > 0) {
                      <button (click)="markAllRead()" class="text-xs text-forest-600 hover:underline font-medium">
                        Tout marquer lu
                      </button>
                    }
                  </div>
                  @if (notifLoading()) {
                    <div class="py-8 flex justify-center">
                      <div class="w-5 h-5 border-2 border-forest-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  } @else if (notifications().length === 0) {
                    <div class="py-8 text-center text-sm text-warm-400">Aucune notification</div>
                  } @else {
                    <div class="max-h-80 overflow-y-auto divide-y divide-warm-50">
                      @for (n of notifications(); track n.id) {
                        <button (click)="handleNotif(n)"
                                class="w-full text-left px-4 py-3 hover:bg-warm-50 transition-colors flex items-start gap-3"
                                [class.bg-forest-50]="!n.read">
                          <span class="text-xl leading-none shrink-0 mt-0.5">{{ notifIcon(n.type) }}</span>
                          <div class="min-w-0">
                            <p class="text-sm text-warm-800 leading-snug">
                              <span class="font-semibold">{{ n.actorUsername }}</span>
                              {{ notifText(n.type) }}
                              @if (n.groupName) { <span class="font-medium">{{ n.groupName }}</span> }
                            </p>
                            <p class="text-xs text-warm-400 mt-0.5">{{ timeAgo(n.createdAt) }}</p>
                          </div>
                          @if (!n.read) {
                            <span class="w-2 h-2 bg-forest-500 rounded-full shrink-0 mt-1.5"></span>
                          }
                        </button>
                      }
                    </div>
                    <div class="border-t border-warm-100 px-4 py-2.5 text-center">
                      <a routerLink="/notifications" (click)="notifOpen.set(false)"
                         class="text-xs font-semibold text-forest-600 hover:underline">
                        Voir toutes les notifications
                      </a>
                    </div>
                  }
                </div>
              }
            </div>
            <a routerLink="/profile" routerLinkActive="bg-warm-100"
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
            <a routerLink="/login"
               class="px-3 py-1.5 rounded-lg text-sm text-warm-600 hover:bg-warm-100 transition-all font-medium">
              Connexion
            </a>
            <a routerLink="/register"
               class="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-forest-600 hover:bg-forest-700 transition-all">
              S'inscrire
            </a>
          }
        </div>

        <!-- Mobile : notif + avatar (top bar) -->
        <div class="flex md:hidden items-center gap-2">
          @if (user(); as u) {
            <div class="relative">
              <button (click)="toggleNotif($event)"
                      class="relative flex items-center justify-center w-10 h-10 rounded-xl text-warm-500 hover:bg-warm-100 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                @if (notifService.unreadCount() > 0) {
                  <span class="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                    {{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}
                  </span>
                }
              </button>

              <!-- Dropdown mobile -->
              @if (notifOpen()) {
                <div class="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-sm bg-white border border-warm-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div class="flex items-center justify-between px-4 py-3 border-b border-warm-100">
                    <span class="text-sm font-semibold text-warm-900">Notifications</span>
                    @if (notifService.unreadCount() > 0) {
                      <button (click)="markAllRead()" class="text-xs text-forest-600 font-medium">Tout marquer lu</button>
                    }
                  </div>
                  @if (notifLoading()) {
                    <div class="py-8 flex justify-center">
                      <div class="w-5 h-5 border-2 border-forest-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  } @else if (notifications().length === 0) {
                    <div class="py-8 text-center text-sm text-warm-400">Aucune notification</div>
                  } @else {
                    <div class="max-h-72 overflow-y-auto divide-y divide-warm-50">
                      @for (n of notifications(); track n.id) {
                        <button (click)="handleNotif(n)"
                                class="w-full text-left px-4 py-3 hover:bg-warm-50 transition-colors flex items-start gap-3"
                                [class.bg-forest-50]="!n.read">
                          <span class="text-xl leading-none shrink-0 mt-0.5">{{ notifIcon(n.type) }}</span>
                          <div class="min-w-0">
                            <p class="text-sm text-warm-800 leading-snug">
                              <span class="font-semibold">{{ n.actorUsername }}</span>
                              {{ notifText(n.type) }}
                              @if (n.groupName) { <span class="font-medium">{{ n.groupName }}</span> }
                            </p>
                            <p class="text-xs text-warm-400 mt-0.5">{{ timeAgo(n.createdAt) }}</p>
                          </div>
                          @if (!n.read) {
                            <span class="w-2 h-2 bg-forest-500 rounded-full shrink-0 mt-1.5"></span>
                          }
                        </button>
                      }
                    </div>
                    <div class="border-t border-warm-100 px-4 py-2.5 text-center">
                      <a routerLink="/notifications" (click)="notifOpen.set(false)"
                         class="text-xs font-semibold text-forest-600">
                        Voir toutes les notifications
                      </a>
                    </div>
                  }
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login"
               class="px-3 py-1.5 rounded-lg text-sm text-warm-600 font-medium">
              Connexion
            </a>
            <a routerLink="/register"
               class="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-forest-600">
              S'inscrire
            </a>
          }
        </div>

      </div>
    </header>

    <!-- ── BOTTOM NAV MOBILE ──────────────────────────────────────────────── -->
    @if (user()) {
      <nav class="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-warm-200"
           style="padding-bottom: env(safe-area-inset-bottom, 0px)">
        <div class="flex items-stretch h-16">

          <!-- Feed -->
          <a routerLink="/feed" routerLinkActive #rlaFeed="routerLinkActive"
             [routerLinkActiveOptions]="{exact: false}"
             class="flex-1 flex flex-col items-center justify-center gap-1 transition-colors active:bg-warm-50"
             [class.text-forest-700]="rlaFeed.isActive"
             [class.text-warm-400]="!rlaFeed.isActive">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span class="text-[10px] font-semibold leading-none">Feed</span>
          </a>

          <!-- Captures -->
          <a routerLink="/captures" routerLinkActive #rlaCaptures="routerLinkActive"
             [routerLinkActiveOptions]="{exact: false}"
             class="flex-1 flex flex-col items-center justify-center gap-1 transition-colors active:bg-warm-50"
             [class.text-forest-700]="rlaCaptures.isActive"
             [class.text-warm-400]="!rlaCaptures.isActive">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <span class="text-[10px] font-semibold leading-none">Captures</span>
          </a>

          <!-- Bouton + central -->
          <a routerLink="/captures/new"
             class="flex-1 flex flex-col items-center justify-center active:scale-95 transition-transform">
            <span class="w-12 h-12 bg-forest-600 rounded-2xl flex items-center justify-center shadow-lg text-white text-3xl font-light leading-none -mt-5 active:bg-forest-700">
              +
            </span>
          </a>

          <!-- Amis -->
          <a routerLink="/friends" routerLinkActive #rlaFriends="routerLinkActive"
             [routerLinkActiveOptions]="{exact: false}"
             class="flex-1 flex flex-col items-center justify-center gap-1 transition-colors active:bg-warm-50"
             [class.text-forest-700]="rlaFriends.isActive"
             [class.text-warm-400]="!rlaFriends.isActive">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="text-[10px] font-semibold leading-none">Amis</span>
          </a>

          <!-- Profil -->
          <a routerLink="/profile" routerLinkActive #rlaProfil="routerLinkActive"
             [routerLinkActiveOptions]="{exact: false}"
             class="flex-1 flex flex-col items-center justify-center gap-1 transition-colors active:bg-warm-50"
             [class.text-forest-700]="rlaProfil.isActive"
             [class.text-warm-400]="!rlaProfil.isActive">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span class="text-[10px] font-semibold leading-none">Profil</span>
          </a>

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

  user = toSignal(this.auth.currentUser$, { initialValue: this.auth.currentUser$.getValue() });
  private bannerDismissed = signal(false);

  // Notification popup
  notifOpen    = signal(false);
  notifLoading = signal(false);
  notifications = signal<AppNotification[]>([]);

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

  dismissBanner():      void { this.bannerDismissed.set(true); }
  resendVerification(): void {
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

  toggleNotif(e: Event): void {
    e.stopPropagation();
    const next = !this.notifOpen();
    this.notifOpen.set(next);
    if (next && this.notifications().length === 0) {
      this.notifLoading.set(true);
      this.notifService.getNotifications(0, 10).subscribe({
        next: res => { this.notifications.set(res.data?.content ?? []); this.notifLoading.set(false); },
        error: () => this.notifLoading.set(false),
      });
    }
  }

  markAllRead(): void {
    this.notifService.markAllRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, read: true })));
        this.notifService.unreadCount.set(0);
      },
      error: () => {},
    });
  }

  handleNotif(n: AppNotification): void {
    if (!n.read) {
      this.notifService.markRead(n.id).subscribe({
        next: () => {
          this.notifications.update(list => list.map(x => x.id === n.id ? { ...x, read: true } : x));
          this.notifService.unreadCount.update(c => Math.max(0, c - 1));
        },
        error: () => {},
      });
    }
    this.notifOpen.set(false);
    if (n.groupId) this.router.navigate(['/groups', n.groupId]);
    else if (['FRIEND_REQUEST', 'FRIEND_ACCEPTED'].includes(n.type)) this.router.navigate(['/friends']);
    else if (['CAPTURE_LIKED', 'CAPTURE_COMMENTED'].includes(n.type)) this.router.navigate(['/feed']);
    else this.router.navigate(['/notifications']);
  }

  notifIcon(type: string): string { return TYPE_ICONS[type] ?? '🔔'; }
  notifText(type: string): string { return TYPE_TEXTS[type] ?? ''; }

  timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'À l\'instant';
    if (m < 60) return `Il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `Il y a ${h}h`;
    const d = Math.floor(h / 24);
    return `Il y a ${d}j`;
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.notifOpen.set(false); }
}
