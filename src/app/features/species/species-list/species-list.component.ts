import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SpeciesService } from '../../../core/services/species.service';
import { Species } from '../../../core/models/species.model';
import { Page } from '../../../core/models/capture.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-species-list',
  standalone: true,
  imports: [RouterLink, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="max-w-6xl mx-auto px-5 py-8">

      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-warm-900 tracking-tight">Encyclopédie</h1>
        <p class="text-sm text-warm-500 mt-0.5">Découvre les espèces, leurs habitats et techniques.</p>
      </div>

      <div class="relative mb-6">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400 text-sm">🔍</span>
        <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
               class="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all text-warm-900 placeholder-warm-400"
               placeholder="Brochet, Carpe, Truite...">
      </div>

      @if (loading) {
        <app-loading-spinner />
      } @else if (error) {
        <div class="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">{{ error }}</div>
      } @else if (!species.length) {
        <div class="text-center py-16 text-warm-400">
          <p class="text-4xl mb-3 opacity-30">🐟</p>
          <p class="text-sm">Aucune espèce trouvée pour "{{ searchQuery }}"</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (s of species; track s.id) {
            <a [routerLink]="['/species', s.id]"
               class="group bg-white border border-warm-200 rounded-2xl overflow-hidden hover:border-warm-300 hover:shadow-md transition-all duration-200">
              <div class="aspect-[4/3] bg-warm-100 overflow-hidden">
                @if (s.imageUrl) {
                  <img [src]="s.imageUrl" [alt]="s.commonName"
                       class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-3xl opacity-20">🐟</div>
                }
              </div>
              <div class="p-3.5">
                <p class="font-semibold text-sm text-warm-900">{{ s.commonName }}</p>
                <p class="text-xs text-warm-400 italic mt-0.5">{{ s.latinName }}</p>
                @if (s.habitat) {
                  <span class="inline-block mt-2 text-xs text-warm-500 bg-warm-100 px-2 py-0.5 rounded-md">
                    {{ s.habitat }}
                  </span>
                }
              </div>
            </a>
          }
        </div>

        @if ((page?.totalPages ?? 0) > 1) {
          <div class="flex justify-center items-center gap-2 mt-10">
            <button (click)="loadPage(currentPage - 1)" [disabled]="currentPage === 0"
                    class="px-4 py-2 text-sm font-medium text-warm-600 bg-white border border-warm-200 rounded-xl hover:bg-warm-50 disabled:opacity-30 transition-all">
              ← Précédent
            </button>
            <span class="px-3 text-sm text-warm-500">{{ currentPage + 1 }} / {{ page?.totalPages }}</span>
            <button (click)="loadPage(currentPage + 1)" [disabled]="currentPage >= (page?.totalPages ?? 1) - 1"
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
  species: Species[] = [];
  page: Page<Species> | null = null;
  currentPage = 0; loading = true; error = ''; searchQuery = '';
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void { this.loadPage(0); }

  loadPage(p: number): void {
    this.loading = true;
    const obs = this.searchQuery.trim()
      ? this.speciesService.searchSpecies(this.searchQuery, p)
      : this.speciesService.getAllSpecies(p, 20);
    obs.subscribe({
      next: res => { this.page = res.data; this.species = res.data.content; this.currentPage = p; this.loading = false; },
      error: err => { this.error = err.error?.message ?? 'Erreur'; this.loading = false; },
    });
  }

  onSearch(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadPage(0), 400);
  }
}
