import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, debounceTime, distinctUntilChanged, startWith, BehaviorSubject, combineLatest } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { SpeciesService, SpeciesFilters } from '../../../core/services/species.service';
import { Species, WaterType, DifficultyLevel } from '../../../core/models/species.model';
import { Page } from '../../../core/models/capture.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

const WATER_LABELS: Record<WaterType, string> = {
  FRESHWATER: 'Eau douce',
  SALTWATER:  'Eau salée',
  BRACKISH:   'Saumâtre',
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, { label: string; color: string }> = {
  BEGINNER:     { label: 'Débutant',     color: 'bg-green-100 text-green-700' },
  INTERMEDIATE: { label: 'Intermédiaire',color: 'bg-amber-100 text-amber-700' },
  ADVANCED:     { label: 'Avancé',       color: 'bg-orange-100 text-orange-700' },
  EXPERT:       { label: 'Expert',       color: 'bg-red-100 text-red-700' },
};

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

@Component({
  selector: 'app-species-list',
  standalone: true,
  imports: [RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-6xl mx-auto px-5 py-8">

      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-warm-900 tracking-tight">Encyclopédie</h1>
        <p class="text-sm text-warm-500 mt-0.5">Découvre les espèces, leurs habitats et techniques de pêche.</p>
      </div>

      <!-- Search bar -->
      <div class="relative mb-4">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </span>
        <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)"
               class="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all text-warm-900 placeholder-warm-400"
               placeholder="Brochet, Carpe, Truite fario...">
      </div>

      <!-- Filter bar -->
      <div class="flex flex-wrap gap-2 mb-6">

        <!-- Water type -->
        @for (wt of waterTypeOptions; track wt.value) {
          <button (click)="toggleFilter('waterType', wt.value)"
                  [class.bg-forest-600]="activeFilters.waterType === wt.value"
                  [class.text-white]="activeFilters.waterType === wt.value"
                  [class.border-forest-600]="activeFilters.waterType === wt.value"
                  [class.bg-white]="activeFilters.waterType !== wt.value"
                  [class.text-warm-600]="activeFilters.waterType !== wt.value"
                  [class.border-warm-200]="activeFilters.waterType !== wt.value"
                  class="px-3 py-1.5 text-xs font-medium border rounded-full transition-all hover:border-warm-300">
            {{ wt.label }}
          </button>
        }

        <div class="w-px h-6 bg-warm-200 self-center mx-1"></div>

        <!-- Difficulty -->
        @for (d of difficultyOptions; track d.value) {
          <button (click)="toggleFilter('difficulty', d.value)"
                  [class.bg-forest-600]="activeFilters.difficulty === d.value"
                  [class.text-white]="activeFilters.difficulty === d.value"
                  [class.border-forest-600]="activeFilters.difficulty === d.value"
                  [class.bg-white]="activeFilters.difficulty !== d.value"
                  [class.text-warm-600]="activeFilters.difficulty !== d.value"
                  [class.border-warm-200]="activeFilters.difficulty !== d.value"
                  class="px-3 py-1.5 text-xs font-medium border rounded-full transition-all hover:border-warm-300">
            {{ d.label }}
          </button>
        }

        <div class="w-px h-6 bg-warm-200 self-center mx-1"></div>

        <!-- Season month -->
        <select [(ngModel)]="activeFilters.season" (ngModelChange)="applyFilters()"
                class="px-3 py-1.5 text-xs font-medium bg-white border border-warm-200 rounded-full outline-none focus:border-forest-500 transition-all text-warm-600 cursor-pointer">
          <option [ngValue]="undefined">Tous mois</option>
          @for (m of monthOptions; track m.value) {
            <option [ngValue]="m.value">{{ m.label }}</option>
          }
        </select>

        <!-- Sort -->
        <select [(ngModel)]="activeFilters.sort" (ngModelChange)="applyFilters()"
                class="px-3 py-1.5 text-xs font-medium bg-white border border-warm-200 rounded-full outline-none focus:border-forest-500 transition-all text-warm-600 cursor-pointer">
          <option value="name">A → Z</option>
          <option value="popularity">Populaire</option>
          <option value="difficulty">Difficulté</option>
        </select>

        <!-- Caught only (logged-in users) -->
        @if (isLoggedIn()) {
          <button (click)="toggleCaughtOnly()"
                  [class.bg-forest-600]="activeFilters.caughtOnly"
                  [class.text-white]="activeFilters.caughtOnly"
                  [class.border-forest-600]="activeFilters.caughtOnly"
                  [class.bg-white]="!activeFilters.caughtOnly"
                  [class.text-warm-600]="!activeFilters.caughtOnly"
                  [class.border-warm-200]="!activeFilters.caughtOnly"
                  class="px-3 py-1.5 text-xs font-medium border rounded-full transition-all hover:border-warm-300 flex items-center gap-1.5">
            <span>✅</span> Déjà pêchée
          </button>
        }

        <!-- Clear filters -->
        @if (hasActiveFilters()) {
          <button (click)="clearFilters()"
                  class="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 border border-red-100 rounded-full transition-all hover:bg-red-100">
            × Effacer
          </button>
        }
      </div>

      <!-- Stats bar -->
      @if (!loading && page) {
        <p class="text-xs text-warm-400 mb-4">
          {{ page.totalElements }} espèce{{ page.totalElements > 1 ? 's' : '' }} trouvée{{ page.totalElements > 1 ? 's' : '' }}
        </p>
      }

      <!-- Content -->
      @if (loading) {
        <app-loading-spinner />
      } @else if (error) {
        <div class="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">{{ error }}</div>
      } @else if (!species.length) {
        <div class="text-center py-20">
          <p class="text-5xl mb-4 opacity-20">🐟</p>
          <p class="text-sm text-warm-500 font-medium">Aucune espèce trouvée</p>
          <p class="text-xs text-warm-400 mt-1">Essaie d'autres filtres ou une autre recherche</p>
          @if (hasActiveFilters()) {
            <button (click)="clearFilters()" class="mt-4 text-xs text-forest-600 font-semibold hover:underline">
              Effacer les filtres
            </button>
          }
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (s of species; track s.id) {
            <a [routerLink]="['/species', s.id]"
               class="group relative bg-white border border-warm-200 rounded-2xl overflow-hidden hover:border-warm-300 hover:shadow-md transition-all duration-200">

              <!-- Caught badge -->
              @if (s.isCaught) {
                <div class="absolute top-2 left-2 z-10 flex items-center gap-1 bg-forest-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                  <span>✓</span> Pêchée
                </div>
              }

              <!-- Image -->
              <div class="aspect-[4/3] bg-warm-100 overflow-hidden">
                @if (s.imageUrl) {
                  <img [src]="s.imageUrl" [alt]="s.commonName"
                       class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                       loading="lazy">
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-4xl opacity-20">🐟</div>
                }
              </div>

              <div class="p-3.5">
                <p class="font-semibold text-sm text-warm-900 leading-tight">{{ s.commonName }}</p>
                <p class="text-xs text-warm-400 italic mt-0.5 truncate">{{ s.latinName }}</p>

                <div class="flex flex-wrap gap-1 mt-2">
                  @if (s.difficulty) {
                    <span [class]="difficultyClass(s.difficulty)" class="text-xs font-medium px-2 py-0.5 rounded-full">
                      {{ difficultyLabel(s.difficulty) }}
                    </span>
                  }
                  @if ((s.waterTypes?.length ?? 0) > 0 && s.waterTypes) {
                    <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {{ waterLabel(s.waterTypes[0]) }}
                    </span>
                  }
                </div>
              </div>
            </a>
          }
        </div>

        <!-- Pagination -->
        @if ((page?.totalPages ?? 0) > 1) {
          <div class="flex justify-center items-center gap-2 mt-10">
            <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 0"
                    class="px-4 py-2 text-sm font-medium text-warm-600 bg-white border border-warm-200 rounded-xl hover:bg-warm-50 disabled:opacity-30 transition-all">
              ← Précédent
            </button>
            <span class="px-3 text-sm text-warm-500">{{ currentPage + 1 }} / {{ page?.totalPages }}</span>
            <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= (page?.totalPages ?? 1) - 1"
                    class="px-4 py-2 text-sm font-medium text-warm-600 bg-white border border-warm-200 rounded-xl hover:bg-warm-50 disabled:opacity-30 transition-all">
              Suivant →
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class SpeciesListComponent implements OnInit {
  private speciesService = inject(SpeciesService);
  private auth           = inject(AuthService);

  isLoggedIn = toSignal(this.auth.currentUser$, { initialValue: this.auth.currentUser$.getValue() });

  species:     Species[] = [];
  page:        Page<Species> | null = null;
  currentPage  = 0;
  loading      = true;
  error        = '';
  searchQuery  = '';

  activeFilters: SpeciesFilters = { sort: 'name' };

  waterTypeOptions = [
    { value: 'FRESHWATER', label: 'Eau douce' },
    { value: 'SALTWATER',  label: 'Mer' },
    { value: 'BRACKISH',   label: 'Saumâtre' },
  ];
  difficultyOptions = [
    { value: 'BEGINNER',     label: 'Débutant' },
    { value: 'INTERMEDIATE', label: 'Intermédiaire' },
    { value: 'ADVANCED',     label: 'Avancé' },
    { value: 'EXPERT',       label: 'Expert' },
  ];
  monthOptions = MONTHS.map((label, i) => ({ value: i + 1, label }));

  // ── Flux réactif : annule la requête précédente à chaque nouveau filtre ──────
  private readonly filters$ = new BehaviorSubject<SpeciesFilters & { page: number }>({ sort: 'name', page: 0 });

  constructor() {
    // switchMap annule la requête HTTP en cours si de nouveaux filtres arrivent
    this.filters$.pipe(
      switchMap(filters => {
        this.loading = true;
        this.error   = '';
        return this.speciesService.getSpecies(filters);
      }),
      takeUntilDestroyed(),
    ).subscribe({
      next: res => {
        this.page        = res.data;
        this.species     = res.data?.content ?? [];
        this.currentPage = this.filters$.getValue().page ?? 0;
        this.loading     = false;
      },
      error: err => {
        this.error   = err.error?.message ?? 'Erreur de chargement';
        this.loading = false;
      },
    });
  }

  ngOnInit(): void {
    // Le BehaviorSubject émet automatiquement la valeur initiale dans le constructeur
  }

  onSearchChange(query: string): void {
    // Debounce via un timeout simple — la requête précédente est annulée par switchMap
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this.activeFilters = { ...this.activeFilters, search: query.trim() || undefined };
      this._emit(0);
    }, 350);
  }
  private _searchTimer: ReturnType<typeof setTimeout> | null = null;

  toggleFilter(key: 'waterType' | 'difficulty', value: string): void {
    (this.activeFilters as any)[key] = (this.activeFilters as any)[key] === value ? undefined : value;
    this._emit(0);
  }

  toggleCaughtOnly(): void {
    this.activeFilters = { ...this.activeFilters, caughtOnly: !this.activeFilters.caughtOnly };
    this._emit(0);
  }

  applyFilters(): void { this._emit(0); }

  clearFilters(): void {
    this.activeFilters = { sort: 'name' };
    this.searchQuery   = '';
    this._emit(0);
  }

  goToPage(p: number): void { this._emit(p); }

  hasActiveFilters(): boolean {
    return !!(this.activeFilters.waterType || this.activeFilters.difficulty ||
              this.activeFilters.season    || this.activeFilters.caughtOnly ||
              this.searchQuery.trim());
  }

  difficultyLabel(d: string): string { return (DIFFICULTY_LABELS as any)[d]?.label ?? d; }
  difficultyClass(d: string): string { return (DIFFICULTY_LABELS as any)[d]?.color ?? 'bg-warm-100 text-warm-600'; }
  waterLabel(w: string): string      { return (WATER_LABELS as any)[w] ?? w; }

  private _emit(page: number): void {
    this.filters$.next({ ...this.activeFilters, page, size: 20 });
  }
}
