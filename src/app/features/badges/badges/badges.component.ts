import { Component, OnInit, inject } from '@angular/core';
import { BadgeService } from '../../../core/services/badge.service';
import { Badge } from '../../../core/models/badge.model';
import { BadgeCardComponent } from '../../../shared/components/badge-card/badge-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface BadgeDef { type: string; label: string; icon: string; }

const BADGE_CATALOG: BadgeDef[] = [
  { type: 'FIRST_CAPTURE', label: 'Première prise',       icon: '🎣' },
  { type: 'CAPTURE_5',     label: 'Pêcheur confirmé',     icon: '🐟' },
  { type: 'CAPTURE_10',    label: 'Expert de la canne',   icon: '⭐' },
  { type: 'SPECIES_3',     label: 'Diversité aquatique',  icon: '🦈' },
  { type: 'SPECIES_5',     label: 'Chasseur de trophées', icon: '🌊' },
  { type: 'FIRST_GROUP',   label: "Esprit d'équipe",      icon: '👥' },
];

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [BadgeCardComponent, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto px-5 py-8">

      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-warm-900 tracking-tight">Badges</h1>
        <p class="text-sm text-warm-500 mt-0.5">{{ earnedCount }} obtenu{{ earnedCount > 1 ? 's' : '' }} sur {{ BADGE_CATALOG.length }}</p>
        <div class="mt-3 w-full h-1.5 bg-warm-200 rounded-full overflow-hidden">
          <div class="h-full bg-forest-600 rounded-full transition-all duration-500"
               [style.width.%]="(earnedCount / BADGE_CATALOG.length) * 100">
          </div>
        </div>
      </div>

      @if (loading) {
        <app-loading-spinner />
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          @for (def of BADGE_CATALOG; track def.type) {
            <app-badge-card
              [label]="def.label"
              [icon]="def.icon"
              [earned]="isEarned(def.type)"
              [earnedAt]="getEarnedAt(def.type)" />
          }
        </div>

        @if (extraBadges.length) {
          <h2 class="text-base font-semibold text-warm-900 mt-10 mb-4">Badges spéciaux</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            @for (badge of extraBadges; track badge.id) {
              <app-badge-card [label]="badge.label" icon="🏅" [earned]="true" [earnedAt]="badge.earnedAt" />
            }
          </div>
        }
      }
    </div>
  `,
})
export class BadgesComponent implements OnInit {
  private badgeService = inject(BadgeService);
  readonly BADGE_CATALOG = BADGE_CATALOG;
  earnedBadges: Badge[] = []; extraBadges: Badge[] = []; loading = true;

  get earnedCount(): number { return BADGE_CATALOG.filter(d => this.isEarned(d.type)).length; }

  ngOnInit(): void {
    this.badgeService.getMyBadges().subscribe({
      next: res => {
        this.earnedBadges = res.data;
        const types = new Set(BADGE_CATALOG.map(b => b.type));
        this.extraBadges = res.data.filter(b => !types.has(b.type));
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  isEarned(type: string): boolean { return this.earnedBadges.some(b => b.type === type); }
  getEarnedAt(type: string): string | null { return this.earnedBadges.find(b => b.type === type)?.earnedAt ?? null; }
}
