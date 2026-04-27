import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { ToastService } from '../../../core/services/toast.service';
import { Group, GroupCategory } from '../../../core/models/group.model';
import { Page } from '../../../core/models/capture.model';
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

type FilterCategory = '' | GroupCategory;

@Component({
  selector: 'app-groups-discover',
  standalone: true,
  imports: [FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-5xl mx-auto px-5 py-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-warm-900 tracking-tight">Découvrir des groupes</h1>
        <p class="text-sm text-warm-500 mt-1">Trouve et rejoins des communautés de pêcheurs</p>
      </div>

      <!-- Search + filters -->
      <div class="bg-white border border-warm-200 rounded-2xl shadow-sm p-4 mb-6 space-y-4">
        <input
          type="text"
          [(ngModel)]="search"
          (ngModelChange)="onSearchChange()"
          placeholder="Rechercher un groupe..."
          class="w-full px-4 py-2.5 border border-warm-300 rounded-xl text-sm focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 bg-warm-50"
        />
        <div class="flex items-center gap-2 flex-wrap">
          @for (pill of categoryPills; track pill.value) {
            <button
              (click)="setCategory(pill.value)"
              [class]="pill.value === selectedCategory
                ? 'px-3 py-1.5 text-xs font-semibold rounded-full bg-forest-600 text-white transition-all'
                : 'px-3 py-1.5 text-xs font-semibold rounded-full bg-warm-100 text-warm-600 hover:bg-warm-200 transition-all'"
            >
              {{ pill.label }}
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (page()?.content?.length === 0) {
        <div class="text-center py-16 border-2 border-dashed border-warm-300 rounded-2xl">
          <div class="text-4xl mb-3 opacity-30">🔍</div>
          <p class="text-sm text-warm-500">Aucun groupe trouvé</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          @for (group of page()!.content; track group.id) {
            <div class="bg-white border border-warm-200 rounded-2xl shadow-sm overflow-hidden">
              @if (group.coverPhotoUrl) {
                <img [src]="group.coverPhotoUrl" [alt]="group.name" class="w-full h-24 object-cover">
              } @else {
                <div class="w-full h-24 bg-gradient-to-br from-forest-100 to-warm-200 flex items-center justify-center">
                  <span class="text-3xl opacity-40">🎣</span>
                </div>
              }
              <div class="p-4">
                <h3 class="text-sm font-semibold text-warm-900 truncate mb-1">{{ group.name }}</h3>
                @if (group.description) {
                  <p class="text-xs text-warm-500 line-clamp-2 mb-2">{{ group.description }}</p>
                }
                <div class="flex items-center gap-1.5 flex-wrap mb-3">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full {{ getCategoryColor(group.category) }}">
                    {{ getCategoryLabel(group.category) }}
                  </span>
                  @if (group.isPro) {
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">PRO</span>
                  }
                </div>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs text-warm-400">{{ group.memberCount }} membre{{ group.memberCount > 1 ? 's' : '' }}</span>
                  <span class="text-xs text-warm-400">{{ visibilityLabel(group.visibility) }}</span>
                </div>
                @if (group.myStatus === 'MEMBER') {
                  <button (click)="openGroup(group.id)"
                          class="w-full py-2 text-xs font-semibold text-forest-700 bg-forest-50 border border-forest-200 rounded-xl hover:bg-forest-100 transition-all">
                    Voir le groupe
                  </button>
                } @else if (group.myStatus === 'PENDING') {
                  <button disabled
                          class="w-full py-2 text-xs font-semibold text-warm-400 bg-warm-50 border border-warm-200 rounded-xl cursor-not-allowed">
                    Demande en attente
                  </button>
                } @else {
                  <button (click)="join(group)"
                          [disabled]="joiningId() === group.id"
                          class="w-full py-2 text-xs font-semibold text-white bg-forest-600 rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-all">
                    @if (joiningId() === group.id) {
                      <span class="flex items-center justify-center gap-2">
                        <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      </span>
                    } @else {
                      {{ group.visibility === 'PUBLIC' ? 'Rejoindre' : 'Demander à rejoindre' }}
                    }
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if ((page()?.totalPages ?? 0) > 1) {
          <div class="flex justify-center items-center gap-2">
            <button (click)="loadPage(currentPage() - 1)" [disabled]="currentPage() === 0"
                    class="px-4 py-2 text-sm font-medium text-warm-600 bg-white border border-warm-200 rounded-xl hover:bg-warm-50 disabled:opacity-30 transition-all">
              ← Précédent
            </button>
            <span class="px-3 text-sm text-warm-500">{{ currentPage() + 1 }} / {{ page()?.totalPages }}</span>
            <button (click)="loadPage(currentPage() + 1)"
                    [disabled]="currentPage() >= (page()?.totalPages ?? 1) - 1"
                    class="px-4 py-2 text-sm font-medium text-warm-600 bg-white border border-warm-200 rounded-xl hover:bg-warm-50 disabled:opacity-30 transition-all">
              Suivant →
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class GroupsDiscoverComponent implements OnInit {
  private groupService = inject(GroupService);
  private toast        = inject(ToastService);
  private router       = inject(Router);

  page         = signal<Page<Group> | null>(null);
  loading      = signal(true);
  currentPage  = signal(0);
  joiningId    = signal<number | null>(null);

  search           = '';
  selectedCategory: FilterCategory = '';
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  categoryPills: { label: string; value: FilterCategory }[] = [
    { label: 'Tous', value: '' },
    { label: 'Club', value: 'CLUB' },
    { label: 'Association', value: 'ASSOCIATION' },
    { label: 'Amis', value: 'FRIENDS' },
    { label: 'Compétition', value: 'COMPETITION' },
  ];

  ngOnInit(): void { this.loadPage(0); }

  loadPage(p: number): void {
    this.loading.set(true);
    this.groupService.discoverGroups(this.search, this.selectedCategory, p).subscribe({
      next: res => { this.page.set(res.data); this.currentPage.set(p); this.loading.set(false); },
      error: ()  => { this.loading.set(false); this.toast.error('Impossible de charger les groupes'); },
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadPage(0), 400);
  }

  setCategory(cat: FilterCategory): void {
    this.selectedCategory = cat;
    this.loadPage(0);
  }

  join(group: Group): void {
    if (this.joiningId() !== null) return;
    this.joiningId.set(group.id);
    this.groupService.joinGroup(group.id).subscribe({
      next: res => {
        this.joiningId.set(null);
        const updated = res.data;
        if (updated.myStatus === 'MEMBER') {
          this.toast.success(`Tu as rejoint "${group.name}" !`);
          this.router.navigate(['/groups', group.id]);
        } else {
          this.toast.info('Demande envoyée !');
          this.page.update(p => p ? {
            ...p,
            content: p.content.map(g => g.id === group.id ? { ...g, myStatus: 'PENDING' } : g),
          } : p);
        }
      },
      error: err => {
        this.joiningId.set(null);
        this.toast.error(err.error?.message ?? 'Impossible de rejoindre le groupe');
      },
    });
  }

  openGroup(id: number): void { this.router.navigate(['/groups', id]); }

  getCategoryLabel(cat: string): string { return CATEGORY_LABELS[cat] ?? cat; }
  getCategoryColor(cat: string): string { return CATEGORY_COLORS[cat] ?? 'bg-warm-100 text-warm-600'; }
  visibilityLabel(v: string): string {
    return v === 'PUBLIC' ? 'Public' : v === 'PRIVATE' ? 'Privé' : 'Secret';
  }
}
