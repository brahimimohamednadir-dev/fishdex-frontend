import {
  Component, OnInit, inject, signal, computed
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FriendService } from '../../core/services/friend.service';
import { ToastService } from '../../core/services/toast.service';
import { Friend } from '../../core/models/friend.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">

      <!-- Header -->
      <div class="mb-8">
        <a routerLink="/feed" class="text-sm text-warm-400 hover:text-warm-700 transition-colors">
          ← Fil d'actualité
        </a>
        <h1 class="mt-3 text-2xl font-semibold text-warm-900 tracking-tight">Amis pêcheurs</h1>
        <p class="mt-1 text-sm text-warm-500">Trouve tes partenaires de pêche et partage tes captures.</p>
      </div>

      <!-- Barre de recherche -->
      <div class="relative mb-6">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400 pointer-events-none"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input [(ngModel)]="searchQuery"
               (ngModelChange)="onSearch($event)"
               placeholder="Rechercher un pêcheur..."
               class="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all text-warm-900 placeholder-warm-400 shadow-sm">
        @if (searchQuery) {
          <button (click)="clearSearch()"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-700 transition-colors text-base leading-none">
            ×
          </button>
        }
      </div>

      <!-- ── Résultats recherche ───────────────────────────────────────── -->
      @if (searchQuery.length >= 2) {
        <section class="mb-8">
          <h2 class="text-xs font-semibold text-warm-400 uppercase tracking-widest mb-3">Résultats</h2>

          @if (searching()) {
            <div class="flex justify-center py-8"><app-loading-spinner /></div>
          } @else if (searchResults().length === 0) {
            <div class="text-center py-8">
              <p class="text-sm text-warm-400">Aucun pêcheur trouvé pour "{{ searchQuery }}"</p>
            </div>
          } @else {
            <div class="space-y-2">
              @for (f of searchResults(); track f.userId) {
                <div class="bg-white border border-warm-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                  <!-- Avatar -->
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-forest-400 to-forest-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {{ f.username[0].toUpperCase() }}
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-warm-900">{{ f.username }}</p>
                    <p class="text-xs text-warm-400">{{ f.captureCount }} capture{{ f.captureCount !== 1 ? 's' : '' }}</p>
                  </div>

                  <!-- Action -->
                  @if (f.friendshipStatus === 'ACCEPTED') {
                    <span class="text-xs text-forest-600 font-semibold bg-forest-50 px-2.5 py-1 rounded-full">✓ Ami</span>
                  } @else if (f.friendshipStatus === 'PENDING_SENT') {
                    <span class="text-xs text-warm-400 bg-warm-100 px-2.5 py-1 rounded-full">Demande envoyée</span>
                  } @else if (f.friendshipStatus === 'PENDING_RECEIVED') {
                    <button (click)="acceptRequest(f)"
                            class="text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 px-3 py-1.5 rounded-xl transition-all">
                      Accepter
                    </button>
                  } @else {
                    <button (click)="sendRequest(f)"
                            class="text-xs font-semibold text-forest-600 bg-forest-50 hover:bg-forest-100 border border-forest-200 px-3 py-1.5 rounded-xl transition-all">
                      + Ajouter
                    </button>
                  }
                </div>
              }
            </div>
          }
        </section>
      }

      <!-- ── Demandes reçues ──────────────────────────────────────────── -->
      @if (!searchQuery && pendingRequests().length > 0) {
        <section class="mb-8">
          <h2 class="text-xs font-semibold text-warm-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            Demandes reçues
            <span class="bg-forest-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {{ pendingRequests().length }}
            </span>
          </h2>

          <div class="space-y-2">
            @for (f of pendingRequests(); track f.friendshipId) {
              <div class="bg-gradient-to-r from-forest-50 to-white border border-forest-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-forest-400 to-forest-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {{ f.username[0].toUpperCase() }}
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-warm-900">{{ f.username }}</p>
                  <p class="text-xs text-warm-500">{{ f.captureCount }} captures · veut pêcher avec toi 🎣</p>
                </div>

                <div class="flex gap-2 flex-shrink-0">
                  <button (click)="rejectRequest(f)"
                          class="text-xs text-warm-500 hover:text-red-500 bg-warm-100 hover:bg-red-50 border border-warm-200 hover:border-red-200 px-2.5 py-1.5 rounded-xl transition-all">
                    Refuser
                  </button>
                  <button (click)="acceptRequest(f)"
                          class="text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 px-3 py-1.5 rounded-xl transition-all">
                    Accepter ✓
                  </button>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- ── Mes amis ───────────────────────────────────────────────── -->
      @if (!searchQuery) {
        <section>
          <h2 class="text-xs font-semibold text-warm-400 uppercase tracking-widest mb-3">
            Mes amis · {{ friends().length }}
          </h2>

          @if (loadingFriends()) {
            <div class="flex justify-center py-8"><app-loading-spinner /></div>
          } @else if (friends().length === 0) {
            <div class="text-center py-16 px-6">
              <div class="text-5xl mb-4 opacity-20">👥</div>
              <p class="text-sm font-medium text-warm-700 mb-2">Aucun ami pour l'instant</p>
              <p class="text-xs text-warm-400 leading-relaxed">
                Recherche des pêcheurs par leur pseudo pour les ajouter.
              </p>
            </div>
          } @else {
            <div class="space-y-2">
              @for (f of friends(); track f.friendshipId) {
                <div class="bg-white border border-warm-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:border-warm-300 transition-all">
                  <!-- Avatar + activité -->
                  <div class="relative flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-forest-400 to-forest-700 flex items-center justify-center text-white font-bold text-sm">
                      {{ f.username[0].toUpperCase() }}
                    </div>
                    @if (f.activeToday) {
                      <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                    }
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-semibold text-warm-900 truncate">{{ f.username }}</p>
                      @if (f.activeToday) {
                        <span class="text-xs text-green-600 font-medium flex-shrink-0">actif aujourd'hui</span>
                      }
                    </div>
                    @if (f.lastCaptureSpecies) {
                      <p class="text-xs text-warm-400 truncate">
                        Dernière prise : {{ f.lastCaptureSpecies }}
                        @if (f.lastCaptureAt) { · {{ formatDate(f.lastCaptureAt) }} }
                      </p>
                    } @else {
                      <p class="text-xs text-warm-400">{{ f.captureCount }} capture{{ f.captureCount !== 1 ? 's' : '' }}</p>
                    }
                  </div>

                  <!-- Dernière capture miniature -->
                  @if (f.lastCapturePhotoUrl && f.lastCaptureId) {
                    <a [routerLink]="['/captures', f.lastCaptureId]" class="flex-shrink-0">
                      <img [src]="f.lastCapturePhotoUrl" alt="Capture"
                           class="w-10 h-10 rounded-xl object-cover border border-warm-100 hover:scale-105 transition-transform">
                    </a>
                  }

                  <!-- Menu supprimer -->
                  <div class="relative flex-shrink-0">
                    <button (click)="confirmRemove(f)"
                            class="w-8 h-8 flex items-center justify-center text-warm-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all text-lg">
                      ×
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </section>
      }

    </div>

    <!-- ── Modale confirmation suppression ───────────────────────── -->
    @if (friendToRemove()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center px-4"
           (click)="cancelRemove()">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
             (click)="$event.stopPropagation()">
          <h3 class="text-base font-semibold text-warm-900 mb-2">Retirer {{ friendToRemove()!.username }} ?</h3>
          <p class="text-sm text-warm-500 mb-6">
            Vous ne verrez plus vos captures mutuelles dans le feed.
          </p>
          <div class="flex gap-3">
            <button (click)="cancelRemove()"
                    class="flex-1 py-2.5 text-sm font-medium text-warm-600 bg-warm-100 rounded-xl hover:bg-warm-200 transition-all">
              Annuler
            </button>
            <button (click)="removeFriend()"
                    class="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all">
              Retirer
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class FriendsComponent implements OnInit {
  private friendService = inject(FriendService);
  private toast         = inject(ToastService);

  // ── State ──────────────────────────────────────────────────────────
  friends         = signal<Friend[]>([]);
  pendingRequests = signal<Friend[]>([]);
  searchResults   = signal<Friend[]>([]);
  loadingFriends  = signal(true);
  searching       = signal(false);
  friendToRemove  = signal<Friend | null>(null);
  searchQuery     = '';

  private search$ = new Subject<string>();

  constructor() {
    // Reactive search with debounce
    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.length < 2) { this.searchResults.set([]); this.searching.set(false); return []; }
        this.searching.set(true);
        return this.friendService.search(q);
      }),
      takeUntilDestroyed(),
    ).subscribe({
      next: res => { this.searchResults.set((res as any).data ?? []); this.searching.set(false); },
      error: () => this.searching.set(false),
    });
  }

  ngOnInit(): void {
    this.loadFriends();
    this.loadPending();
  }

  // ── Data loading ─────────────────────────────────────────────────

  loadFriends(): void {
    this.loadingFriends.set(true);
    this.friendService.getMyFriends().subscribe({
      next: res => { this.friends.set(res.data ?? []); this.loadingFriends.set(false); },
      error: () => this.loadingFriends.set(false),
    });
  }

  loadPending(): void {
    this.friendService.getPendingRequests().subscribe({
      next: res => this.pendingRequests.set(res.data ?? []),
      error: () => {},
    });
  }

  // ── Search ───────────────────────────────────────────────────────

  onSearch(q: string): void {
    if (q.length < 2) { this.searchResults.set([]); return; }
    this.search$.next(q);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults.set([]);
  }

  // ── Actions ──────────────────────────────────────────────────────

  sendRequest(f: Friend): void {
    this.friendService.sendRequest(f.userId).subscribe({
      next: () => {
        this.toast.success(`Demande envoyée à ${f.username} 🎣`);
        // Update status in search results
        this.searchResults.update(list =>
          list.map(x => x.userId === f.userId ? { ...x, friendshipStatus: 'PENDING_SENT' as const } : x)
        );
      },
      error: err => this.toast.error(err.error?.message ?? 'Impossible d\'envoyer la demande'),
    });
  }

  acceptRequest(f: Friend): void {
    const id = f.friendshipId!;
    this.friendService.acceptRequest(id).subscribe({
      next: res => {
        this.toast.success(`Tu es maintenant ami avec ${f.username} 🎣`);
        this.pendingRequests.update(list => list.filter(x => x.friendshipId !== id));
        // Update search results if visible
        this.searchResults.update(list =>
          list.map(x => x.userId === f.userId ? { ...x, friendshipStatus: 'ACCEPTED' as const } : x)
        );
        this.loadFriends();
      },
      error: () => this.toast.error('Impossible d\'accepter la demande'),
    });
  }

  rejectRequest(f: Friend): void {
    const id = f.friendshipId!;
    this.friendService.rejectRequest(id).subscribe({
      next: () => {
        this.pendingRequests.update(list => list.filter(x => x.friendshipId !== id));
        this.toast.info('Demande refusée');
      },
      error: () => this.toast.error('Impossible de refuser la demande'),
    });
  }

  confirmRemove(f: Friend): void { this.friendToRemove.set(f); }
  cancelRemove():           void { this.friendToRemove.set(null); }

  removeFriend(): void {
    const f = this.friendToRemove();
    if (!f?.friendshipId) return;
    this.friendService.removeFriend(f.friendshipId).subscribe({
      next: () => {
        this.friends.update(list => list.filter(x => x.friendshipId !== f.friendshipId));
        this.toast.info(`${f.username} retiré de tes amis`);
        this.friendToRemove.set(null);
      },
      error: () => this.toast.error('Impossible de retirer cet ami'),
    });
  }

  // ── Utils ─────────────────────────────────────────────────────────

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return 'aujourd\'hui';
    if (days === 1) return 'hier';
    if (days < 7)  return `il y a ${days}j`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}
