import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { PersonalStats } from '../../core/models/profile.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">

      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-warm-900 tracking-tight">Mes stats 📊</h1>
        <p class="mt-1 text-sm text-warm-500">Ton année en pêche, résumée.</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20"><app-loading-spinner /></div>
      } @else if (stats()) {

        <!-- ── Chiffres clés ─────────────────────────────────────────── -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div class="bg-white border border-warm-200 rounded-2xl p-4 text-center shadow-sm">
            <p class="text-2xl font-bold text-warm-900">{{ stats()!.totalCaptures }}</p>
            <p class="text-xs text-warm-400 mt-0.5">Total captures</p>
          </div>
          <div class="bg-white border border-warm-200 rounded-2xl p-4 text-center shadow-sm">
            <p class="text-2xl font-bold text-forest-700">{{ stats()!.thisYear }}</p>
            <p class="text-xs text-warm-400 mt-0.5">Cette année</p>
          </div>
          <div class="bg-white border border-warm-200 rounded-2xl p-4 text-center shadow-sm">
            <p class="text-2xl font-bold text-warm-900">{{ stats()!.thisMonth }}</p>
            <p class="text-xs text-warm-400 mt-0.5">Ce mois</p>
          </div>
          <div class="bg-white border border-warm-200 rounded-2xl p-4 text-center shadow-sm">
            <p class="text-2xl font-bold text-warm-900">{{ stats()!.distinctSpecies }}</p>
            <p class="text-xs text-warm-400 mt-0.5">Espèces</p>
          </div>
        </div>

        <!-- ── Records ───────────────────────────────────────────────── -->
        @if (stats()!.heaviestCatchKg || stats()!.longestCatchCm) {
          <div class="grid grid-cols-2 gap-3 mb-6">
            @if (stats()!.heaviestCatchKg) {
              <div class="bg-gradient-to-br from-forest-50 to-white border border-forest-200 rounded-2xl p-4 shadow-sm">
                <p class="text-xs font-semibold text-forest-600 mb-1">🏆 Plus gros poisson</p>
                <p class="text-xl font-bold text-warm-900">{{ stats()!.heaviestCatchKg }} kg</p>
                <p class="text-xs text-warm-500 mt-0.5">{{ stats()!.heaviestCatchSpecies }}</p>
              </div>
            }
            @if (stats()!.longestCatchCm) {
              <div class="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-4 shadow-sm">
                <p class="text-xs font-semibold text-blue-600 mb-1">📏 Plus long</p>
                <p class="text-xl font-bold text-warm-900">{{ stats()!.longestCatchCm }} cm</p>
                <p class="text-xs text-warm-500 mt-0.5">{{ stats()!.longestCatchSpecies }}</p>
              </div>
            }
          </div>
        }

        <!-- ── Graphique mensuel ──────────────────────────────────────── -->
        <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm mb-6">
          <h2 class="text-sm font-semibold text-warm-900 mb-4">
            Captures {{ currentYear() }} — mois par mois
          </h2>

          @if (maxMonthlyCount() === 0) {
            <p class="text-sm text-warm-400 text-center py-6">Aucune capture cette année.</p>
          } @else {
            <div class="flex items-end gap-1.5 h-32">
              @for (m of stats()!.monthlyCaptures; track m.month) {
                <div class="flex-1 flex flex-col items-center gap-1">
                  <!-- Barre -->
                  <div class="w-full relative flex items-end justify-center"
                       style="height: 100px">
                    <div class="w-full rounded-t-md transition-all"
                         [style.height.%]="barHeight(m.count)"
                         [class.bg-forest-600]="m.count > 0"
                         [class.bg-warm-100]="m.count === 0">
                    </div>
                    @if (m.count > 0) {
                      <span class="absolute -top-5 text-xs font-semibold text-warm-700">{{ m.count }}</span>
                    }
                  </div>
                  <!-- Label mois -->
                  <span class="text-xs text-warm-400">{{ m.label }}</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- ── Palmarès espèces ────────────────────────────────────────── -->
        @if (stats()!.topSpecies.length > 0) {
          <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm mb-6">
            <h2 class="text-sm font-semibold text-warm-900 mb-4">🐟 Mes espèces favorites</h2>
            <div class="space-y-3">
              @for (s of stats()!.topSpecies; track s.speciesName; let i = $index) {
                <div class="flex items-center gap-3">
                  <!-- Rang -->
                  <span class="w-6 text-center text-sm font-bold"
                        [class.text-yellow-500]="i === 0"
                        [class.text-warm-400]="i === 1"
                        [class.text-orange-400]="i === 2"
                        [class.text-warm-300]="i > 2">
                    {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.' }}
                  </span>

                  <!-- Bar + nom -->
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-0.5">
                      <span class="text-sm font-medium text-warm-900">{{ s.speciesName }}</span>
                      <span class="text-xs text-warm-500">{{ s.count }} prise{{ s.count > 1 ? 's' : '' }}</span>
                    </div>
                    <div class="h-1.5 bg-warm-100 rounded-full overflow-hidden">
                      <div class="h-full bg-forest-500 rounded-full transition-all"
                           [style.width.%]="speciesBarWidth(s.count)">
                      </div>
                    </div>
                    @if (s.recordWeight || s.recordLength) {
                      <p class="text-xs text-warm-400 mt-0.5">
                        Record :
                        @if (s.recordWeight) { {{ s.recordWeight }} kg }
                        @if (s.recordWeight && s.recordLength) { · }
                        @if (s.recordLength) { {{ s.recordLength }} cm }
                      </p>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- ── Spots favoris ──────────────────────────────────────────── -->
        @if (stats()!.favoriteSpots.length > 0) {
          <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
            <h2 class="text-sm font-semibold text-warm-900 mb-4">📍 Mes spots favoris</h2>
            <div class="space-y-2">
              @for (spot of stats()!.favoriteSpots; track spot.label; let i = $index) {
                <div class="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
                  <span class="text-lg">{{ i === 0 ? '🥇' : i === 1 ? '🥈' : '📍' }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-warm-900 truncate">{{ spot.label }}</p>
                    <p class="text-xs text-warm-400">{{ spot.count }} capture{{ spot.count > 1 ? 's' : '' }}</p>
                  </div>
                  <a [href]="mapsUrl(spot.lat, spot.lng)" target="_blank" rel="noopener"
                     class="text-xs text-forest-600 hover:underline flex-shrink-0">
                    Voir →
                  </a>
                </div>
              }
            </div>
          </div>
        }

      }
    </div>
  `,
})
export class StatsComponent implements OnInit {
  private userService = inject(UserService);

  stats   = signal<PersonalStats | null>(null);
  loading = signal(true);

  currentYear = computed(() => new Date().getFullYear());

  maxMonthlyCount = computed(() => {
    const s = this.stats();
    if (!s) return 0;
    return Math.max(...s.monthlyCaptures.map(m => m.count), 1);
  });

  ngOnInit(): void {
    this.userService.getPersonalStats().subscribe({
      next: res => { this.stats.set(res.data ?? null); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  barHeight(count: number): number {
    const max = this.maxMonthlyCount();
    if (max === 0 || count === 0) return 2;
    return Math.max(4, Math.round((count / max) * 100));
  }

  speciesBarWidth(count: number): number {
    const s = this.stats();
    if (!s || s.topSpecies.length === 0) return 0;
    const max = s.topSpecies[0].count;
    return max === 0 ? 0 : Math.round((count / max) * 100);
  }

  mapsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
}
