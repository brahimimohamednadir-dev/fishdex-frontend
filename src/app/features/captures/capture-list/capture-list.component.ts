import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, switchMap } from 'rxjs';
import { CaptureService } from '../../../core/services/capture.service';
import { Capture, Page } from '../../../core/models/capture.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-capture-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">

      <!-- Header -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h1 class="text-xl font-bold text-warm-900">Mes captures</h1>
          @if (page && !loading) {
            <p class="text-xs text-warm-400 mt-0.5">
              {{ page.totalElements }} prise{{ page.totalElements > 1 ? 's' : '' }}
            </p>
          }
        </div>
        <a routerLink="/captures/new"
           class="flex items-center gap-1.5 px-4 py-2 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 active:scale-95 transition-all shadow-sm shadow-forest-600/20">
          <span class="text-base">+</span> Capturer
        </a>
      </div>

      <!-- Skeletons loading -->
      @if (loading) {
        <div class="grid grid-cols-3 gap-0.5">
          @for (i of skeleton; track i) {
            <div class="aspect-square bg-warm-200 animate-pulse"></div>
          }
        </div>
      }

      <!-- Erreur -->
      @else if (error) {
        <div class="text-center py-16">
          <p class="text-4xl mb-3">😔</p>
          <p class="text-sm text-warm-600 mb-4">{{ error }}</p>
          <button (click)="retry()" class="px-5 py-2.5 text-sm font-semibold text-white bg-forest-600 rounded-xl hover:bg-forest-700 transition-all">
            Réessayer
          </button>
        </div>
      }

      <!-- Vide -->
      @else if (!captures.length) {
        <div class="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div class="w-24 h-24 rounded-3xl bg-forest-50 border-2 border-dashed border-forest-200 flex items-center justify-center mb-5">
            <span class="text-4xl opacity-40">🎣</span>
          </div>
          <h2 class="text-base font-bold text-warm-900 mb-1">Aucune capture pour l'instant</h2>
          <p class="text-sm text-warm-400 max-w-xs">Enregistre ta première prise et commence ton journal de pêche.</p>
          <a routerLink="/captures/new"
             class="mt-6 px-6 py-3 bg-forest-600 text-white text-sm font-bold rounded-2xl hover:bg-forest-700 active:scale-95 transition-all shadow-lg shadow-forest-600/25">
            🎣 Ajouter ma première capture
          </a>
        </div>
      }

      <!-- Grille Instagram -->
      @else {
        <div class="grid grid-cols-3 gap-0.5 rounded-2xl overflow-hidden">
          @for (capture of captures; track capture.id) {
            <a [routerLink]="['/captures', capture.id]"
               class="relative aspect-square overflow-hidden bg-warm-100 group">

              @if (capture.photoUrl) {
                <img [src]="capture.photoUrl" [alt]="capture.speciesName"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                     loading="lazy">
              } @else {
                <div class="w-full h-full bg-gradient-to-br from-forest-50 to-forest-100 flex flex-col items-center justify-center gap-1">
                  <span class="text-3xl opacity-30">🐟</span>
                  <span class="text-[10px] text-warm-400 px-1 text-center leading-tight font-medium">{{ capture.speciesName }}</span>
                </div>
              }

              <!-- Overlay au hover -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
                <p class="text-white text-xs font-bold truncate">{{ capture.speciesName }}</p>
                <div class="flex items-center gap-2 mt-0.5">
                  @if (capture.weight) {
                    <span class="text-white/80 text-[10px]">⚖️ {{ capture.weight }}kg</span>
                  }
                  @if (capture.length) {
                    <span class="text-white/80 text-[10px]">📏 {{ capture.length }}cm</span>
                  }
                </div>
              </div>

              <!-- Badge poids record -->
              @if (capture.weight && capture.weight >= 10) {
                <span class="absolute top-1.5 right-1.5 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                  🏆
                </span>
              }
            </a>
          }
        </div>

        <!-- Pagination -->
        @if ((page?.totalPages ?? 0) > 1) {
          <div class="flex justify-center items-center gap-2 mt-6">
            <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 0 || loading"
                    class="w-10 h-10 flex items-center justify-center rounded-xl border border-warm-200 text-warm-600 hover:bg-warm-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              ←
            </button>

            @for (p of pages; track p) {
              <button (click)="goToPage(p)"
                      [class]="p === currentPage
                        ? 'w-10 h-10 flex items-center justify-center rounded-xl bg-forest-600 text-white text-sm font-bold'
                        : 'w-10 h-10 flex items-center justify-center rounded-xl border border-warm-200 text-warm-600 text-sm hover:bg-warm-50 transition-all'">
                {{ p + 1 }}
              </button>
            }

            <button (click)="goToPage(currentPage + 1)"
                    [disabled]="currentPage >= (page?.totalPages ?? 1) - 1 || loading"
                    class="w-10 h-10 flex items-center justify-center rounded-xl border border-warm-200 text-warm-600 hover:bg-warm-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              →
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class CaptureListComponent {
  private captureService = inject(CaptureService);

  captures: Capture[] = [];
  page: Page<Capture> | null = null;
  currentPage = 0;
  loading = true;
  error = '';
  skeleton = Array(12).fill(0);

  private readonly page$ = new BehaviorSubject<number>(0);

  constructor() {
    this.page$.pipe(
      switchMap(p => {
        this.loading = true;
        this.error   = '';
        return this.captureService.getMyCaptures(p, 12);
      }),
      takeUntilDestroyed(),
    ).subscribe({
      next: res => {
        this.page        = res.data;
        this.captures    = res.data?.content ?? [];
        this.currentPage = this.page$.getValue();
        this.loading     = false;
      },
      error: err => {
        this.error   = err.error?.message ?? 'Impossible de charger les captures';
        this.loading = false;
      },
    });
  }

  get pages(): number[] {
    const total = this.page?.totalPages ?? 1;
    const start = Math.max(0, this.currentPage - 2);
    const end   = Math.min(total - 1, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(p: number): void { this.page$.next(p); }
  retry():             void { this.page$.next(this.currentPage); }
}
