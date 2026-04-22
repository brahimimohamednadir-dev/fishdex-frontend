import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { ToastService } from '../../../core/services/toast.service';
import { Group } from '../../../core/models/group.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

const CATEGORY_LABELS: Record<string, string> = {
  CLUB: 'Club', ASSOCIATION: 'Association', FRIENDS: 'Amis', COMPETITION: 'Compétition',
};

const CATEGORY_COLORS: Record<string, string> = {
  CLUB: 'bg-forest-100 text-forest-700',
  ASSOCIATION: 'bg-blue-100 text-blue-700',
  FRIENDS: 'bg-pink-100 text-pink-700',
  COMPETITION: 'bg-amber-100 text-amber-700',
};

@Component({
  selector: 'app-groups-dashboard',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-5xl mx-auto px-5 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl font-bold text-warm-900 tracking-tight">Mes groupes</h1>
          <p class="text-sm text-warm-500 mt-1">Retrouve tous les groupes dont tu fais partie</p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/groups/discover"
             class="px-4 py-2 text-sm font-semibold text-warm-700 bg-white border border-warm-300 rounded-xl hover:bg-warm-50 transition-all">
            Découvrir
          </a>
          <a routerLink="/groups/new"
             class="px-4 py-2 text-sm font-semibold text-white bg-forest-600 rounded-xl hover:bg-forest-700 transition-all">
            + Créer un groupe
          </a>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (groups().length === 0) {
        <!-- Empty state -->
        <div class="text-center py-20 border-2 border-dashed border-warm-300 rounded-2xl">
          <div class="text-5xl mb-4 opacity-30">🏕️</div>
          <h2 class="text-lg font-semibold text-warm-700 mb-2">Tu n'es dans aucun groupe</h2>
          <p class="text-sm text-warm-400 mb-6">Rejoins une communauté de pêcheurs ou crée le tien.</p>
          <a routerLink="/groups/discover"
             class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-forest-600 rounded-xl hover:bg-forest-700 transition-all">
            Découvrir des groupes
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @for (group of groups(); track group.id) {
            <div class="bg-white border border-warm-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                 (click)="navigate(group.id)">
              <!-- Cover photo or colored placeholder -->
              @if (group.coverPhotoUrl) {
                <img [src]="group.coverPhotoUrl" [alt]="group.name"
                     class="w-full h-28 object-cover">
              } @else {
                <div class="w-full h-28 bg-gradient-to-br from-forest-100 to-warm-200 flex items-center justify-center">
                  <span class="text-4xl opacity-40">🎣</span>
                </div>
              }

              <div class="p-4">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <h3 class="text-sm font-semibold text-warm-900 leading-tight truncate">{{ group.name }}</h3>
                  @if (group.unreadCount > 0) {
                    <span class="shrink-0 text-xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                      {{ group.unreadCount > 99 ? '99+' : group.unreadCount }}
                    </span>
                  }
                </div>

                <div class="flex items-center gap-2 flex-wrap mb-3">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full {{ getCategoryColor(group.category) }}">
                    {{ getCategoryLabel(group.category) }}
                  </span>
                  @if (group.isPro) {
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">PRO</span>
                  }
                  <span class="text-xs text-warm-400 px-2 py-0.5 rounded-full bg-warm-100">
                    {{ visibilityLabel(group.visibility) }}
                  </span>
                </div>

                <div class="flex items-center justify-between text-xs text-warm-500">
                  <span>{{ group.memberCount }} membre{{ group.memberCount > 1 ? 's' : '' }}</span>
                  <span>{{ group.postCount }} post{{ group.postCount > 1 ? 's' : '' }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class GroupsDashboardComponent implements OnInit {
  private groupService = inject(GroupService);
  private toast        = inject(ToastService);
  private router       = inject(Router);

  groups  = signal<Group[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.groupService.getMyGroups().subscribe({
      next:  res => { this.groups.set(res.data ?? []); this.loading.set(false); },
      error: ()  => { this.loading.set(false); this.toast.error('Impossible de charger tes groupes'); },
    });
  }

  navigate(id: number): void { this.router.navigate(['/groups', id]); }

  getCategoryLabel(cat: string): string { return CATEGORY_LABELS[cat] ?? cat; }
  getCategoryColor(cat: string): string { return CATEGORY_COLORS[cat] ?? 'bg-warm-100 text-warm-600'; }

  visibilityLabel(v: string): string {
    return v === 'PUBLIC' ? 'Public' : v === 'PRIVATE' ? 'Privé' : 'Secret';
  }
}
