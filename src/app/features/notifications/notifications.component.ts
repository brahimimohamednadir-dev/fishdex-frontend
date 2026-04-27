import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { AppNotification, NotificationType } from '../../core/models/notification.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)  return 'à l\'instant';
  if (mins < 60) return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7)  return `il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const TYPE_ICONS: Partial<Record<NotificationType, string>> = {
  JOIN_REQUEST_ACCEPTED: '✅',
  JOIN_REQUEST_REJECTED: '❌',
  POST_REACTION:         '👍',
  POST_COMMENT:          '💬',
  COMMENT_REPLY:         '↩️',
  GROUP_KICKED:          '🚫',
  POST_PINNED:           '📌',
  FRIEND_REQUEST:        '👋',
  FRIEND_ACCEPTED:       '🤝',
  CAPTURE_LIKED:         '❤️',
  CAPTURE_COMMENTED:     '💬',
};

const TYPE_TEXTS: Partial<Record<NotificationType, (n: AppNotification) => string>> = {
  JOIN_REQUEST_ACCEPTED: n => `Ta demande pour rejoindre "${n.groupName}" a été acceptée`,
  JOIN_REQUEST_REJECTED: n => `Ta demande pour rejoindre "${n.groupName}" a été refusée`,
  POST_REACTION:         n => `${n.actorUsername} a réagi à ton post`,
  POST_COMMENT:          n => `${n.actorUsername} a commenté ton post`,
  COMMENT_REPLY:         n => `${n.actorUsername} a répondu à ton commentaire`,
  GROUP_KICKED:          n => `Tu as été expulsé de "${n.groupName}"`,
  POST_PINNED:           n => `Ton post dans "${n.groupName}" a été épinglé`,
  FRIEND_REQUEST:        n => `${n.actorUsername} t'a envoyé une demande d'ami`,
  FRIEND_ACCEPTED:       n => `${n.actorUsername} a accepté ta demande d'ami 🎣`,
  CAPTURE_LIKED:         n => `${n.actorUsername} a aimé ta capture`,
  CAPTURE_COMMENTED:     n => `${n.actorUsername} a commenté ta capture`,
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto px-5 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-warm-900 tracking-tight">Notifications</h1>
          @if (unreadTotal() > 0) {
            <p class="text-sm text-warm-500 mt-0.5">{{ unreadTotal() }} non lue{{ unreadTotal() > 1 ? 's' : '' }}</p>
          }
        </div>
        @if (unreadTotal() > 0) {
          <button (click)="markAllRead()"
                  class="px-4 py-2 text-xs font-semibold text-warm-700 bg-white border border-warm-300 rounded-xl hover:bg-warm-50 transition-all">
            Tout marquer comme lu
          </button>
        }
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (notifications().length === 0) {
        <div class="text-center py-16 border-2 border-dashed border-warm-300 rounded-2xl">
          <div class="text-4xl mb-3 opacity-30">🔔</div>
          <p class="text-sm text-warm-500">Aucune notification pour l'instant</p>
        </div>
      } @else {
        <div class="bg-white border border-warm-200 rounded-2xl shadow-sm divide-y divide-warm-100 overflow-hidden">
          @for (notif of notifications(); track notif.id) {
            <div
              (click)="handleClick(notif)"
              [class]="notif.read
                ? 'flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-warm-50 transition-all'
                : 'flex items-start gap-3 px-4 py-3.5 cursor-pointer bg-forest-50/50 hover:bg-forest-50 transition-all border-l-2 border-forest-400'"
            >
              <!-- Icon -->
              <div class="w-9 h-9 rounded-full bg-warm-100 flex items-center justify-center text-lg shrink-0">
                {{ getIcon(notif.type) }}
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-sm text-warm-800 leading-snug">{{ getText(notif) }}</p>
                <p class="text-xs text-warm-400 mt-0.5">{{ timeAgo(notif.createdAt) }}</p>
              </div>

              @if (!notif.read) {
                <div class="w-2 h-2 rounded-full bg-forest-500 mt-1.5 shrink-0"></div>
              }
            </div>
          }
        </div>

        <!-- Load more -->
        @if (!noMore()) {
          <div class="text-center mt-4">
            <button (click)="loadMore()"
                    [disabled]="loadingMore()"
                    class="px-5 py-2.5 text-sm font-semibold text-warm-700 bg-white border border-warm-300 rounded-xl hover:bg-warm-50 disabled:opacity-50 transition-all">
              @if (loadingMore()) {
                <span class="flex items-center gap-2 justify-center">
                  <span class="w-4 h-4 border-2 border-warm-300 border-t-warm-700 rounded-full animate-spin"></span>
                  Chargement...
                </span>
              } @else {
                Voir plus
              }
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
  private notifService = inject(NotificationService);
  private toast        = inject(ToastService);
  private router       = inject(Router);

  notifications = signal<AppNotification[]>([]);
  loading       = signal(true);
  loadingMore   = signal(false);
  noMore        = signal(false);
  unreadTotal   = signal(0);

  private currentPage = 0;

  readonly timeAgo = timeAgo;

  ngOnInit(): void {
    this.load(0);
  }

  load(page: number): void {
    if (page === 0) this.loading.set(true);
    else this.loadingMore.set(true);

    this.notifService.getNotifications(page).subscribe({
      next: res => {
        const data = res.data;
        if (page === 0) {
          this.notifications.set(data.content);
        } else {
          this.notifications.update(prev => [...prev, ...data.content]);
        }
        this.currentPage = page;
        this.noMore.set(page >= data.totalPages - 1);
        this.unreadTotal.set(this.notifications().filter(n => !n.read).length);
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
        this.toast.error('Impossible de charger les notifications');
      },
    });
  }

  loadMore(): void { this.load(this.currentPage + 1); }

  markAllRead(): void {
    this.notifService.markAllRead().subscribe({
      next: () => {
        this.notifications.update(prev => prev.map(n => ({ ...n, read: true })));
        this.unreadTotal.set(0);
        this.notifService.unreadCount.set(0);
      },
      error: () => this.toast.error('Erreur'),
    });
  }

  handleClick(notif: AppNotification): void {
    if (!notif.read) {
      this.notifService.markRead(notif.id).subscribe({
        next: () => {
          this.notifications.update(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
          this.unreadTotal.update(v => Math.max(0, v - 1));
          this.notifService.unreadCount.update(v => Math.max(0, v - 1));
        },
        error: () => {},
      });
    }
    // Navigate to relevant content
    if (notif.type === 'FRIEND_REQUEST' || notif.type === 'FRIEND_ACCEPTED') {
      this.router.navigate(['/friends']);
    } else if (notif.type === 'CAPTURE_LIKED' || notif.type === 'CAPTURE_COMMENTED') {
      // Navigate to feed or the capture if we had the id
      this.router.navigate(['/feed']);
    } else if (notif.groupId) {
      this.router.navigate(['/groups', notif.groupId]);
    }
  }

  getIcon(type: NotificationType): string { return TYPE_ICONS[type] ?? '🔔'; }
  getText(notif: AppNotification): string {
    const fn = TYPE_TEXTS[notif.type];
    return fn ? fn(notif) : notif.type;
  }
}
