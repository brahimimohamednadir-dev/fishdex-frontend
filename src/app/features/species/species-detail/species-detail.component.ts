import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpeciesService } from '../../../core/services/species.service';
import { Species } from '../../../core/models/species.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-species-detail',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto px-5 py-8">
      <a routerLink="/species" class="text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← Encyclopédie
      </a>

      @if (loading) { <app-loading-spinner /> }
      @else if (error) {
        <div class="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{{ error }}</div>
      }
      @else if (species) {
        <div class="mt-6">

          <!-- Photo -->
          <div class="rounded-2xl overflow-hidden bg-gray-100 aspect-[16/9]">
            @if (species.imageUrl) {
              <img [src]="species.imageUrl" [alt]="species.commonName" class="w-full h-full object-cover">
            } @else {
              <div class="w-full h-full flex items-center justify-center text-6xl opacity-20">🐟</div>
            }
          </div>

          <div class="mt-6">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ species.commonName }}</h1>
                <p class="text-sm text-gray-400 italic mt-0.5">{{ species.latinName }}</p>
              </div>
            </div>

            @if (species.description) {
              <p class="mt-4 text-sm text-gray-600 leading-relaxed">{{ species.description }}</p>
            }

            <!-- Poids min / max -->
            @if (species.minWeightKg || species.maxWeightKg) {
              <div class="grid grid-cols-2 gap-3 mt-6">
                @if (species.minWeightKg) {
                  <div class="bg-white border border-gray-100 rounded-xl p-4">
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Poids min. légal</p>
                    <p class="text-2xl font-bold text-gray-900 mt-1">
                      {{ species.minWeightKg }}<span class="text-sm font-medium text-gray-500 ml-1">kg</span>
                    </p>
                  </div>
                }
                @if (species.maxWeightKg) {
                  <div class="bg-white border border-gray-100 rounded-xl p-4">
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Poids max. connu</p>
                    <p class="text-2xl font-bold text-gray-900 mt-1">
                      {{ species.maxWeightKg }}<span class="text-sm font-medium text-gray-500 ml-1">kg</span>
                    </p>
                  </div>
                }
              </div>
            }

            <!-- Habitat -->
            @if (species.habitat) {
              <div class="mt-4 bg-white border border-gray-100 rounded-xl p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Habitat</p>
                <p class="text-sm text-gray-700">{{ species.habitat }}</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class SpeciesDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private speciesService = inject(SpeciesService);
  species: Species | null = null;
  loading = true; error = '';

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.speciesService.getSpeciesById(id).subscribe({
      next: res => { this.species = res.data; this.loading = false; },
      error: err => { this.error = err.error?.message ?? 'Espèce introuvable'; this.loading = false; },
    });
  }
}
