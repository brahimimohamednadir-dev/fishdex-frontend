import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  userTag: string;
  totalCaptures: number;
  totalWeight: number;
  distinctSpecies: number;
  score: number;
}

interface ApiResponse<T> { success: boolean; data: T; }

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-semibold text-warm-900 tracking-tight mb-2">🏆 Classement</h1>
      <p class="text-sm text-warm-400 mb-6">Les meilleurs pêcheurs de FishDex</p>

      <!-- Filtres type -->
      <div class="flex gap-2 mb-4">
        @for (t of types; track t.value) {
          <button (click)="setType(t.value)"
                  [class]="activeType() === t.value
                    ? 'px-4 py-2 rounded-xl text-sm font-semibold bg-forest-600 text-white shadow-sm'
                    : 'px-4 py-2 rounded-xl text-sm font-medium bg-white border border-warm-200 text-warm-600 hover:border-warm-300'">
            {{ t.label }}
          </button>
        }
      </div>

      <!-- Filtres période -->
      <div class="flex gap-2 mb-6">
        @for (p of periods; track p.value) {
          <button (click)="setPeriod(p.value)"
                  [class]="activePeriod() === p.value
                    ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-warm-800 text-white'
                    : 'px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-warm-200 text-warm-500 hover:border-warm-300'">
            {{ p.label }}
          </button>
        }
      </div>

      <!-- Podium top 3 -->
      @if (!loading() && entries().length >= 3) {
        <div class="flex items-end justify-center gap-3 mb-6">
          <!-- 2e -->
          <div class="flex flex-col items-center">
            <a [routerLink]="['/u', entries()[1].username]" class="flex flex-col items-center">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xl font-bold mb-1">
                {{ entries()[1].username[0].toUpperCase() }}
              </div>
              <div class="bg-gray-100 border border-gray-200 rounded-xl px-3 py-4 text-center w-24 flex flex-col items-center">
                <span class="text-2xl mb-1">🥈</span>
                <p class="text-xs font-bold text-warm-800 truncate w-full text-center">{{ entries()[1].username }}</p>
                <p class="text-xs text-warm-500">{{ formatScore(entries()[1]) }}</p>
              </div>
            </a>
          </div>
          <!-- 1er -->
          <div class="flex flex-col items-center -mt-4">
            <a [routerLink]="['/u', entries()[0].username]" class="flex flex-col items-center">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold mb-1 shadow-lg">
                {{ entries()[0].username[0].toUpperCase() }}
              </div>
              <div class="bg-amber-50 border border-amber-200 rounded-xl px-3 py-5 text-center w-28 flex flex-col items-center shadow-sm">
                <span class="text-3xl mb-1">🥇</span>
                <p class="text-xs font-bold text-warm-900 truncate w-full text-center">{{ entries()[0].username }}</p>
                <p class="text-xs text-amber-700 font-medium">{{ formatScore(entries()[0]) }}</p>
              </div>
            </a>
          </div>
          <!-- 3e -->
          <div class="flex flex-col items-center">
            <a [routerLink]="['/u', entries()[2].username]" class="flex flex-col items-center">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-xl font-bold mb-1">
                {{ entries()[2].username[0].toUpperCase() }}
              </div>
              <div class="bg-orange-50 border border-orange-200 rounded-xl px-3 py-4 text-center w-24 flex flex-col items-center">
                <span class="text-2xl mb-1">🥉</span>
                <p class="text-xs font-bold text-warm-800 truncate w-full text-center">{{ entries()[2].username }}</p>
                <p class="text-xs text-warm-500">{{ formatScore(entries()[2]) }}</p>
              </div>
            </a>
          </div>
        </div>
      }

      <!-- Liste complète -->
      @if (loading()) {
        <div class="space-y-2">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="h-16 bg-warm-100 rounded-xl animate-pulse"></div>
          }
        </div>
      } @else {
        <div class="bg-white border border-warm-200 rounded-2xl overflow-hidden shadow-sm">
          @for (entry of entries().slice(3); track entry.userId) {
            <a [routerLink]="['/u', entry.username]"
               class="flex items-center gap-3 px-4 py-3.5 hover:bg-warm-50 transition-all border-b border-warm-100 last:border-0">
              <span class="w-6 text-center text-sm font-bold text-warm-400">#{{ entry.rank }}</span>
              <div class="w-9 h-9 rounded-xl bg-forest-700 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {{ entry.username[0].toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-warm-900 truncate">
                  {{ entry.username }}<span class="text-warm-300 font-normal">#{{ entry.userTag }}</span>
                </p>
                <p class="text-xs text-warm-400">{{ entry.totalCaptures }} captures · {{ entry.distinctSpecies }} espèces</p>
              </div>
              <span class="text-sm font-bold text-forest-700 flex-shrink-0">{{ formatScore(entry) }}</span>
            </a>
          }
          @if (entries().length === 0) {
            <div class="py-16 text-center text-warm-400 text-sm">Aucune donnée pour cette période</div>
          }
        </div>
      }
    </div>
  `,
})
export class LeaderboardComponent implements OnInit {
  private http = inject(HttpClient);

  entries    = signal<LeaderboardEntry[]>([]);
  loading    = signal(true);
  activeType   = signal('captures');
  activePeriod = signal('alltime');

  types   = [
    { value: 'captures', label: '🎣 Captures' },
    { value: 'weight',   label: '⚖️ Poids' },
    { value: 'species',  label: '🐟 Espèces' },
  ];
  periods = [
    { value: 'alltime', label: 'Tout temps' },
    { value: 'year',    label: 'Cette année' },
    { value: 'month',   label: 'Ce mois' },
  ];

  ngOnInit(): void { this.load(); }

  setType(t: string): void   { this.activeType.set(t);   this.load(); }
  setPeriod(p: string): void { this.activePeriod.set(p); this.load(); }

  load(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<LeaderboardEntry[]>>(
      `${environment.apiUrl}/leaderboard?type=${this.activeType()}&period=${this.activePeriod()}`
    ).subscribe({
      next: res => { this.entries.set(res.data ?? []); this.loading.set(false); },
      error: ()  => { this.entries.set([]); this.loading.set(false); },
    });
  }

  formatScore(e: LeaderboardEntry): string {
    switch (this.activeType()) {
      case 'weight':  return `${e.totalWeight.toFixed(1)} kg`;
      case 'species': return `${e.distinctSpecies} espèces`;
      default:        return `${e.totalCaptures} prises`;
    }
  }
}
