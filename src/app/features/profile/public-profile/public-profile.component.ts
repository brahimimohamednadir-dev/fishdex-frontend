import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../../core/services/user.service';
import { FriendService } from '../../../core/services/friend.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { PublicProfile } from '../../../core/models/profile.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">

      @if (loading()) {
        <div class="flex justify-center py-20"><app-loading-spinner /></div>
      } @else if (!profile()) {
        <div class="text-center py-20">
          <p class="text-warm-400">Utilisateur introuvable 🎣</p>
          <a routerLink="/feed" class="mt-4 inline-block text-sm text-forest-600 hover:underline">← Retour au feed</a>
        </div>
      } @else {
        <!-- Header profil -->
        <div class="bg-white border border-warm-200 rounded-2xl p-6 shadow-sm mb-6">
          <div class="flex items-start gap-5">

            <!-- Avatar grand -->
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-forest-400 to-forest-700 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {{ profile()!.username[0].toUpperCase() }}
            </div>

            <div class="flex-1 min-w-0">
              <h1 class="text-xl font-bold text-warm-900">
                {{ profile()!.username }}<span class="text-warm-300 font-normal text-base">#{{ profile()!.userTag }}</span>
              </h1>
              <p class="text-sm text-warm-400 mt-0.5">Pêcheur depuis {{ memberSince() }}</p>

              <!-- Stats rapides -->
              <div class="flex gap-5 mt-3">
                <div class="text-center">
                  <p class="text-lg font-bold text-warm-900">{{ profile()!.totalCaptures }}</p>
                  <p class="text-xs text-warm-400">Captures</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-bold text-warm-900">{{ profile()!.distinctSpecies }}</p>
                  <p class="text-xs text-warm-400">Espèces</p>
                </div>
                @if (profile()!.heaviestCatchKg) {
                  <div class="text-center">
                    <p class="text-lg font-bold text-forest-700">{{ profile()!.heaviestCatchKg }} kg</p>
                    <p class="text-xs text-warm-400">Record</p>
                  </div>
                }
              </div>
            </div>

            <!-- Bouton amitié -->
            @if (isMe()) {
              <a routerLink="/profile"
                 class="flex-shrink-0 text-xs font-semibold text-warm-600 bg-warm-100 hover:bg-warm-200 border border-warm-200 px-3 py-1.5 rounded-xl transition-all">
                Modifier
              </a>
            } @else if (isAuthenticated()) {
              @switch (profile()!.friendshipStatus) {
                @case ('ACCEPTED') {
                  <span class="flex-shrink-0 text-xs text-forest-600 font-semibold bg-forest-50 border border-forest-200 px-3 py-1.5 rounded-xl">
                    ✓ Ami
                  </span>
                }
                @case ('PENDING_SENT') {
                  <span class="flex-shrink-0 text-xs text-warm-400 bg-warm-100 px-3 py-1.5 rounded-xl">
                    Demande envoyée
                  </span>
                }
                @case ('PENDING_RECEIVED') {
                  <button (click)="acceptRequest()"
                          class="flex-shrink-0 text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 px-3 py-1.5 rounded-xl transition-all">
                    Accepter ✓
                  </button>
                }
                @default {
                  <button (click)="sendRequest()"
                          [disabled]="actionLoading()"
                          class="flex-shrink-0 text-xs font-semibold text-forest-600 bg-forest-50 hover:bg-forest-100 border border-forest-200 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50">
                    + Ajouter
                  </button>
                }
              }
            }
          </div>

          <!-- Record -->
          @if (profile()!.heaviestCatchKg && profile()!.heaviestCatchSpecies) {
            <div class="mt-4 pt-4 border-t border-warm-100 flex items-center gap-2 text-sm text-warm-600">
              <span class="text-xl">🏆</span>
              <span>Record : <strong class="text-warm-900">{{ profile()!.heaviestCatchKg }} kg</strong>
                de <strong class="text-warm-900">{{ profile()!.heaviestCatchSpecies }}</strong></span>
            </div>
          }
        </div>

        <!-- Badges -->
        @if (profile()!.badges.length > 0) {
          <section class="mb-6">
            <h2 class="text-xs font-semibold text-warm-400 uppercase tracking-widest mb-3">
              Badges · {{ profile()!.badges.length }}
            </h2>
            <div class="flex flex-wrap gap-2">
              @for (badge of profile()!.badges.slice(0, 12); track badge.id) {
                <div class="bg-white border border-warm-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                  <span class="text-base">{{ badgeIcon(badge.type) }}</span>
                  <span class="text-xs font-medium text-warm-700">{{ badge.label }}</span>
                </div>
              }
            </div>
          </section>
        }

        <!-- Grille captures publiques -->
        @if (profile()!.recentCaptures.length > 0) {
          <section>
            <h2 class="text-xs font-semibold text-warm-400 uppercase tracking-widest mb-3">
              Captures récentes
            </h2>
            <div class="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden">
              @for (c of profile()!.recentCaptures; track c.id) {
                <a [routerLink]="['/captures', c.id]"
                   class="aspect-square bg-warm-100 relative overflow-hidden hover:opacity-90 transition-opacity">
                  @if (c.photoUrl) {
                    <img [src]="c.photoUrl" [alt]="c.speciesName"
                         class="w-full h-full object-cover">
                  } @else {
                    <div class="w-full h-full flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-warm-100 to-warm-200">
                      <span class="text-2xl opacity-25">🐟</span>
                      <span class="text-xs text-warm-400 text-center px-1 leading-tight truncate w-full text-center">{{ c.speciesName }}</span>
                    </div>
                  }
                  <!-- Overlay info -->
                  <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
                    <p class="text-white text-xs font-medium truncate">{{ c.speciesName }}</p>
                    @if (c.weight) {
                      <p class="text-white/70 text-xs">{{ c.weight }} kg</p>
                    }
                  </div>
                </a>
              }
            </div>
          </section>
        } @else {
          <div class="text-center py-12 text-warm-400 text-sm">
            Aucune capture publique pour l'instant.
          </div>
        }
      }

    </div>
  `,
})
export class PublicProfileComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  private userService = inject(UserService);
  private friendService = inject(FriendService);
  private auth        = inject(AuthService);
  private toast       = inject(ToastService);

  profile      = signal<PublicProfile | null>(null);
  loading      = signal(true);
  actionLoading = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const username = params.get('username')!;
      this.loading.set(true);
      this.userService.getPublicProfile(username).subscribe({
        next: res => { this.profile.set(res.data ?? null); this.loading.set(false); },
        error: () => { this.profile.set(null); this.loading.set(false); },
      });
    });
  }

  isAuthenticated() { return !!this.auth.currentUser$.getValue(); }

  isMe() {
    const me = this.auth.currentUser$.getValue();
    return me?.id === this.profile()?.userId;
  }

  memberSince(): string {
    const p = this.profile();
    if (!p) return '';
    const d = new Date(p.memberSince);
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  sendRequest(): void {
    const p = this.profile();
    if (!p) return;
    this.actionLoading.set(true);
    this.friendService.sendRequest(p.userId).subscribe({
      next: () => {
        this.toast.success('Demande envoyée 🎣');
        this.profile.update(prev => prev ? { ...prev, friendshipStatus: 'PENDING_SENT' } : prev);
        this.actionLoading.set(false);
      },
      error: err => {
        this.toast.error(err.error?.message ?? 'Impossible d\'envoyer la demande');
        this.actionLoading.set(false);
      },
    });
  }

  acceptRequest(): void {
    const p = this.profile();
    if (!p?.friendshipId) return;
    this.friendService.acceptRequest(p.friendshipId).subscribe({
      next: () => {
        this.toast.success('Vous êtes maintenant amis 🎣');
        this.profile.update(prev => prev ? { ...prev, friendshipStatus: 'ACCEPTED' } : prev);
      },
      error: () => this.toast.error('Impossible d\'accepter'),
    });
  }

  badgeIcon(type: string): string {
    const icons: Record<string, string> = {
      FIRST_CATCH: '🎣', TEN_CATCHES: '🏆', FIFTY_CATCHES: '⭐',
      HUNDRED_CATCHES: '💯', RECORD_WEIGHT: '🏋️', SPECIES_COLLECTOR: '🐟',
      EARLY_BIRD: '🌅', NIGHT_FISHER: '🌙', GROUP_MEMBER: '👥',
    };
    return icons[type] ?? '🏅';
  }
}
