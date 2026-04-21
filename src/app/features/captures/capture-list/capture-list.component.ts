import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CaptureService } from '../../../core/services/capture.service';
import { Capture, Page } from '../../../core/models/capture.model';
import { CaptureCardComponent } from '../../../shared/components/capture-card/capture-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-capture-list',
  standalone: true,
  imports: [RouterLink, CaptureCardComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-6xl mx-auto px-5 py-8">

      <div class="flex items-end justify-between mb-8">
        <div>
          <h1 class="text-2xl font-semibold text-warm-900 tracking-tight">Mes captures</h1>
          @if (page) {
            <p class="text-sm text-warm-500 mt-0.5">
              {{ page.totalElements }} prise{{ page.totalElements > 1 ? 's' : '' }} au total
            </p>
          }
        </div>
        <a routerLink="/captures/new"
           class="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 transition-all">
          <span class="text-base leading-none">+</span>
          <span>Nouvelle capture</span>
        </a>
      </div>

      @if (loading) {
        <app-loading-spinner />
      } @else if (error) {
        <div class="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">{{ error }}</div>
      } @else if (!captures.length) {
        <div class="text-center py-24 border-2 border-dashed border-warm-300 rounded-2xl">
          <span class="text-5xl opacity-20">🎣</span>
          <h2 class="mt-4 text-lg font-semibold text-warm-900">Aucune capture pour l'instant</h2>
          <p class="mt-1 text-sm text-warm-500">Enregistre ta première prise et commence ton journal.</p>
          <a routerLink="/captures/new"
             class="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 transition-all">
            Ajouter une capture
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (capture of captures; track capture.id) {
            <app-capture-card [capture]="capture" />
          }
        </div>

        @if ((page?.totalPages ?? 0) > 1) {
          <div class="flex justify-center items-center gap-2 mt-10">
            <button (click)="loadPage(currentPage - 1)" [disabled]="currentPage === 0"
                    class="px-4 py-2 text-sm font-medium text-warm-600 bg-white border border-warm-200 rounded-xl hover:bg-warm-50 disabled:opacity-30 transition-all">
              ← Précédent
            </button>
            <span class="px-4 py-2 text-sm text-warm-500">{{ currentPage + 1 }} / {{ page?.totalPages }}</span>
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
export class CaptureListComponent implements OnInit {
  private captureService = inject(CaptureService);
  captures: Capture[] = [];
  page: Page<Capture> | null = null;
  currentPage = 0; loading = true; error = '';

  ngOnInit(): void { this.loadPage(0); }

  loadPage(p: number): void {
    this.loading = true; this.error = '';
    this.captureService.getMyCaptures(p, 12).subscribe({
      next: res => { this.page = res.data; this.captures = res.data.content; this.currentPage = p; this.loading = false; },
      error: err => { this.error = err.error?.message ?? 'Erreur de chargement'; this.loading = false; },
    });
  }
}
