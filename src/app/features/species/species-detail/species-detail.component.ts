import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { SpeciesService } from '../../../core/services/species.service';
import { ToastService } from '../../../core/services/toast.service';
import { Species, SeasonStatus, DifficultyLevel, BudgetTier, MonthActivity } from '../../../core/models/species.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

type Tab = 'general' | 'habitat' | 'calendar' | 'activity' | 'baits' | 'techniques' | 'equipment' | 'community';

const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const STATUS_CONFIG: Record<SeasonStatus, { bg: string; text: string; label: string }> = {
  EXCELLENT: { bg: 'bg-forest-600',  text: 'text-white',      label: 'Excellent' },
  GOOD:      { bg: 'bg-forest-300',  text: 'text-forest-900', label: 'Bon' },
  AVERAGE:   { bg: 'bg-amber-300',   text: 'text-amber-900',  label: 'Moyen' },
  DIFFICULT: { bg: 'bg-orange-400',  text: 'text-white',      label: 'Difficile' },
  CLOSED:    { bg: 'bg-red-500',     text: 'text-white',      label: 'Fermé' },
};

const DIFFICULTY_CONFIG: Record<DifficultyLevel, { label: string; color: string }> = {
  BEGINNER:     { label: 'Débutant',      color: 'bg-green-100 text-green-700 border-green-200' },
  INTERMEDIATE: { label: 'Intermédiaire', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  ADVANCED:     { label: 'Avancé',        color: 'bg-orange-100 text-orange-700 border-orange-200' },
  EXPERT:       { label: 'Expert',        color: 'bg-red-100 text-red-700 border-red-200' },
};

const BUDGET_CONFIG: Record<BudgetTier, { label: string; icon: string; color: string }> = {
  BUDGET: { label: '< 50 €',    icon: '💰',   color: 'border-green-200 bg-green-50' },
  MID:    { label: '50–200 €',  icon: '💰💰', color: 'border-amber-200 bg-amber-50' },
  PRO:    { label: '200 € +',   icon: '💰💰💰',color: 'border-red-200 bg-red-50' },
};

const BAIT_TYPE_LABELS: Record<string, string> = {
  NATURAL: 'Appât naturel', LURE: 'Leurre', FLY: 'Mouche', GROUND: 'Amorce',
};

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'general',    label: 'Général',     icon: '📋' },
  { id: 'habitat',    label: 'Habitat',     icon: '🌿' },
  { id: 'calendar',   label: 'Calendrier',  icon: '📅' },
  { id: 'activity',   label: 'Horaires',    icon: '⏰' },
  { id: 'baits',      label: 'Appâts',      icon: '🪱' },
  { id: 'techniques', label: 'Techniques',  icon: '🎣' },
  { id: 'equipment',  label: 'Matériel',    icon: '🔧' },
  { id: 'community',  label: 'Communauté',  icon: '👥' },
];

@Component({
  selector: 'app-species-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, DatePipe, LoadingSpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto px-5 py-8">

      <!-- Back -->
      <a routerLink="/species" class="inline-flex items-center gap-1.5 text-sm text-warm-400 hover:text-warm-700 transition-colors mb-6">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Encyclopédie
      </a>

      @if (loading) {
        <app-loading-spinner />
      } @else if (error) {
        <div class="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">{{ error }}</div>
      } @else if (species) {

        <!-- Hero -->
        <div class="rounded-2xl overflow-hidden bg-warm-100 aspect-[21/9] mb-6 relative">
          @if (species.imageUrl) {
            <img [src]="species.imageUrl" [alt]="species.commonName" class="w-full h-full object-cover">
          } @else {
            <div class="w-full h-full flex items-center justify-center text-8xl opacity-10">🐟</div>
          }
          <!-- Caught badge overlay -->
          @if (species.isCaught) {
            <div class="absolute top-4 right-4 flex items-center gap-1.5 bg-forest-600 text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-lg">
              ✅ Déjà pêchée
            </div>
          }
        </div>

        <!-- Title row -->
        <div class="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <h1 class="text-2xl font-bold text-warm-900 tracking-tight">{{ species.commonName }}</h1>
            <p class="text-sm text-warm-400 italic mt-0.5">{{ species.latinName }}</p>
            @if (species.family) {
              <p class="text-xs text-warm-500 mt-0.5">Famille : {{ species.family }}</p>
            }
          </div>
          <div class="flex flex-wrap gap-2">
            @if (species.difficulty) {
              <span [class]="difficultyClass(species.difficulty)"
                    class="text-xs font-semibold px-3 py-1 rounded-full border">
                {{ difficultyLabel(species.difficulty) }}
              </span>
            }
            @for (wt of species.waterTypes; track wt) {
              <span class="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                {{ waterTypeLabel(wt) }}
              </span>
            }
          </div>
        </div>

        <!-- Quick stats bar -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div class="bg-white border border-warm-200 rounded-xl p-3 text-center shadow-sm">
            <p class="text-xs text-warm-400 font-medium">Captures</p>
            <p class="text-xl font-bold text-warm-900 mt-0.5">{{ species.totalCaptures | number }}</p>
          </div>
          @if (species.fishDexRecord) {
            <div class="bg-white border border-warm-200 rounded-xl p-3 text-center shadow-sm">
              <p class="text-xs text-warm-400 font-medium">🏆 Record FishDex</p>
              <p class="text-xl font-bold text-warm-900 mt-0.5">{{ species.fishDexRecord.weight }} kg</p>
            </div>
          }
          @if (species.maxWeightKg) {
            <div class="bg-white border border-warm-200 rounded-xl p-3 text-center shadow-sm">
              <p class="text-xs text-warm-400 font-medium">Poids max</p>
              <p class="text-xl font-bold text-warm-900 mt-0.5">{{ species.maxWeightKg }} kg</p>
            </div>
          }
          @if (species.maxLengthCm) {
            <div class="bg-white border border-warm-200 rounded-xl p-3 text-center shadow-sm">
              <p class="text-xs text-warm-400 font-medium">Taille max</p>
              <p class="text-xl font-bold text-warm-900 mt-0.5">{{ species.maxLengthCm }} cm</p>
            </div>
          }
        </div>

        <!-- Personal stats (logged in) -->
        @if (species.personalStats && species.personalStats.totalCatches > 0) {
          <div class="bg-forest-50 border border-forest-200 rounded-2xl p-4 mb-6">
            <p class="text-xs font-semibold text-forest-700 uppercase tracking-wide mb-3">Mes stats personnelles</p>
            <div class="grid grid-cols-3 gap-3">
              <div class="text-center">
                <p class="text-2xl font-bold text-forest-800">{{ species.personalStats.totalCatches }}</p>
                <p class="text-xs text-forest-600 mt-0.5">Captures</p>
              </div>
              @if (species.personalStats.personalRecord) {
                <div class="text-center">
                  <p class="text-2xl font-bold text-forest-800">{{ species.personalStats.personalRecord.weight }} kg</p>
                  <p class="text-xs text-forest-600 mt-0.5">Mon record</p>
                </div>
              }
              <div class="text-center">
                <p class="text-2xl font-bold text-forest-800">{{ species.personalStats.caughtThisYear }}</p>
                <p class="text-xs text-forest-600 mt-0.5">Cette année</p>
              </div>
            </div>
          </div>
        }

        <!-- Tab nav (scrollable on mobile) -->
        <div class="flex gap-1 overflow-x-auto scrollbar-hide mb-6 -mx-5 px-5 pb-1">
          @for (tab of tabs; track tab.id) {
            <button (click)="activeTab.set(tab.id)"
                    [class.bg-forest-600]="activeTab() === tab.id"
                    [class.text-white]="activeTab() === tab.id"
                    [class.bg-white]="activeTab() !== tab.id"
                    [class.text-warm-600]="activeTab() !== tab.id"
                    class="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-warm-200 transition-all hover:bg-warm-100 whitespace-nowrap">
              <span>{{ tab.icon }}</span> {{ tab.label }}
            </button>
          }
        </div>

        <!-- ═══════════════════════════════ TABS ════════════════════════════════ -->

        <!-- GÉNÉRAL -->
        @if (activeTab() === 'general') {
          <div class="space-y-4">
            @if (species.description) {
              <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
                <h2 class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-3">Description</h2>
                <p class="text-sm text-warm-700 leading-relaxed">{{ species.description }}</p>
              </div>
            }

            <div class="grid grid-cols-2 gap-3">
              @if (species.minWeightKg || species.maxWeightKg) {
                <div class="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm">
                  <p class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-2">Poids</p>
                  <p class="text-sm text-warm-700">
                    @if (species.minWeightKg) { <span class="font-semibold">{{ species.minWeightKg }}</span> kg min. }
                    @if (species.minWeightKg && species.maxWeightKg) { &ndash; }
                    @if (species.maxWeightKg) { <span class="font-semibold">{{ species.maxWeightKg }}</span> kg max. }
                  </p>
                </div>
              }
              @if (species.minLengthCm || species.maxLengthCm) {
                <div class="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm">
                  <p class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-2">Taille</p>
                  <p class="text-sm text-warm-700">
                    @if (species.minLengthCm) { <span class="font-semibold">{{ species.minLengthCm }}</span> cm min. }
                    @if (species.minLengthCm && species.maxLengthCm) { &ndash; }
                    @if (species.maxLengthCm) { <span class="font-semibold">{{ species.maxLengthCm }}</span> cm max. }
                  </p>
                </div>
              }
            </div>

            @if (species.conservationStatus) {
              <div class="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm">
                <p class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-2">Statut de conservation</p>
                <p class="text-sm font-semibold text-warm-900">{{ species.conservationStatus }}</p>
              </div>
            }

            @if (species.fishDexRecord) {
              <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
                <p class="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">🏆 Record FishDex</p>
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-lg font-bold text-amber-900">{{ species.fishDexRecord.weight }} kg · {{ species.fishDexRecord.length }} cm</p>
                    <p class="text-xs text-amber-700 mt-0.5">par <strong>{{ species.fishDexRecord.username }}</strong> · {{ species.fishDexRecord.date | date:'dd/MM/yyyy' }}</p>
                  </div>
                  <span class="text-3xl">🎖️</span>
                </div>
              </div>
            }
          </div>
        }

        <!-- HABITAT -->
        @if (activeTab() === 'habitat') {
          <div class="space-y-4">
            @if (species.habitatDetail || species.habitat) {
              <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
                <h2 class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-3">🌿 Milieu de vie</h2>
                <p class="text-sm text-warm-700 leading-relaxed">{{ species.habitatDetail ?? species.habitat }}</p>
              </div>
            }
            <div class="grid grid-cols-2 gap-3">
              @if (species.preferredDepth) {
                <div class="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm">
                  <p class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-1">Profondeur</p>
                  <p class="text-sm font-medium text-warm-900">{{ species.preferredDepth }}</p>
                </div>
              }
              @if (species.temperature) {
                <div class="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm">
                  <p class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-1">Température</p>
                  <p class="text-sm font-medium text-warm-900">{{ species.temperature }}</p>
                </div>
              }
              @if (species.waterTypes?.length) {
                <div class="col-span-2 bg-white border border-warm-200 rounded-2xl p-4 shadow-sm">
                  <p class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-2">Type d'eau</p>
                  <div class="flex flex-wrap gap-2">
                    @for (wt of species.waterTypes; track wt) {
                      <span class="text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                        {{ waterTypeLabel(wt) }}
                      </span>
                    }
                  </div>
                </div>
              }
            </div>
            @if (!species.habitat && !species.habitatDetail && !species.preferredDepth && !species.temperature) {
              <div class="text-center py-16 text-warm-400">
                <p class="text-4xl mb-3 opacity-20">🌿</p>
                <p class="text-sm">Données d'habitat non disponibles</p>
              </div>
            }
          </div>
        }

        <!-- CALENDRIER -->
        @if (activeTab() === 'calendar') {
          <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
            <h2 class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-4">Meilleurs mois de pêche</h2>
            @if (species.monthlyActivity?.length) {
              <!-- Calendar grid -->
              <div class="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-5">
                @for (m of species.monthlyActivity; track m.month) {
                  <div class="text-center">
                    <p class="text-xs text-warm-400 font-medium mb-1.5">{{ monthName(m.month) }}</p>
                    <div [class]="monthBg(m)"
                         class="h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-default"
                         [title]="monthStatusLabel(m)">
                      @if (m.legalClosure) {
                        <span class="text-base">🚫</span>
                      } @else {
                        <span [class]="monthText(m)">{{ monthStatusLabel(m) }}</span>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Legend -->
              <div class="flex flex-wrap gap-3 pt-4 border-t border-warm-100">
                @for (entry of calendarLegend; track entry.status) {
                  <div class="flex items-center gap-1.5">
                    <div [class]="entry.bg" class="w-4 h-4 rounded-md shrink-0"></div>
                    <span class="text-xs text-warm-500">{{ entry.label }}</span>
                  </div>
                }
                <div class="flex items-center gap-1.5">
                  <span class="text-sm">🚫</span>
                  <span class="text-xs text-warm-500">Fermeture légale</span>
                </div>
              </div>
            } @else {
              <div class="text-center py-12 text-warm-400">
                <p class="text-4xl mb-3 opacity-20">📅</p>
                <p class="text-sm">Calendrier non disponible</p>
              </div>
            }
          </div>
        }

        <!-- HORAIRES -->
        @if (activeTab() === 'activity') {
          <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
            <h2 class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-4">Activité par heure de la journée</h2>
            @if (species.hourlyActivity?.length) {
              <!-- Bar chart -->
              <div class="flex items-end gap-1 h-32 mb-2">
                @for (h of species.hourlyActivity; track h.hour) {
                  <div class="flex-1 flex flex-col items-center gap-1">
                    <div class="w-full rounded-t-sm transition-all"
                         [style.height.%]="h.activityLevel"
                         [class]="hourBarClass(h.hour)"
                         style="min-height: 2px; max-height: 100%;"
                         [title]="h.hour + 'h — ' + h.activityLevel + '%'">
                    </div>
                  </div>
                }
              </div>
              <!-- Hour labels (every 4h) -->
              <div class="flex items-center">
                @for (h of species.hourlyActivity; track h.hour) {
                  <div class="flex-1 text-center">
                    @if (h.hour % 4 === 0) {
                      <span class="text-xs text-warm-400">{{ h.hour }}h</span>
                    }
                  </div>
                }
              </div>
              <!-- Period legend -->
              <div class="flex flex-wrap gap-3 pt-4 mt-2 border-t border-warm-100">
                <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded-md bg-indigo-800"></div><span class="text-xs text-warm-500">Nuit</span></div>
                <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded-md bg-amber-400"></div><span class="text-xs text-warm-500">Aube / Crépuscule</span></div>
                <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded-md bg-sky-400"></div><span class="text-xs text-warm-500">Matin</span></div>
                <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded-md bg-sky-200"></div><span class="text-xs text-warm-500">Journée</span></div>
                <div class="flex items-center gap-1.5"><div class="w-4 h-4 rounded-md bg-orange-400"></div><span class="text-xs text-warm-500">Soir</span></div>
              </div>
            } @else {
              <div class="text-center py-12 text-warm-400">
                <p class="text-4xl mb-3 opacity-20">⏰</p>
                <p class="text-sm">Données horaires non disponibles</p>
              </div>
            }
          </div>
        }

        <!-- APPÂTS -->
        @if (activeTab() === 'baits') {
          <div class="space-y-3">
            @if (species.baits?.length) {
              @for (bait of species.baits; track bait.id) {
                <div class="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm">
                  <div class="flex items-start gap-3">
                    @if (bait.imageUrl) {
                      <img [src]="bait.imageUrl" [alt]="bait.name"
                           class="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-warm-100">
                    } @else {
                      <div class="w-14 h-14 rounded-xl bg-warm-100 flex items-center justify-center text-2xl flex-shrink-0">🪱</div>
                    }
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <p class="font-semibold text-sm text-warm-900">{{ bait.name }}</p>
                        <span class="text-xs text-warm-500 bg-warm-100 px-2 py-0.5 rounded-full">{{ baitTypeLabel(bait.type) }}</span>
                      </div>
                      <!-- Effectiveness stars -->
                      <div class="flex gap-0.5 mt-1.5">
                        @for (star of [1,2,3,4,5]; track star) {
                          <span [class]="star <= bait.effectiveness ? 'text-amber-400' : 'text-warm-200'" class="text-sm">★</span>
                        }
                      </div>
                      @if (bait.seasons?.length) {
                        <div class="flex flex-wrap gap-1 mt-2">
                          @for (s of bait.seasons; track s) {
                            <span class="text-xs text-forest-700 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded-full">{{ s }}</span>
                          }
                        </div>
                      }
                      @if (bait.conditions) {
                        <p class="text-xs text-warm-500 mt-1.5">{{ bait.conditions }}</p>
                      }
                    </div>
                  </div>
                </div>
              }
            } @else {
              <div class="text-center py-16 text-warm-400">
                <p class="text-4xl mb-3 opacity-20">🪱</p>
                <p class="text-sm">Aucun appât référencé pour cette espèce</p>
              </div>
            }
          </div>
        }

        <!-- TECHNIQUES -->
        @if (activeTab() === 'techniques') {
          <div class="space-y-4">
            @if (species.techniques?.length) {
              @for (tech of species.techniques; track tech.id) {
                <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <h3 class="font-semibold text-warm-900">{{ tech.name }}</h3>
                    <span [class]="difficultyClass(tech.difficulty)"
                          class="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border">
                      {{ difficultyLabel(tech.difficulty) }}
                    </span>
                  </div>
                  <p class="text-sm text-warm-600 leading-relaxed">{{ tech.description }}</p>
                  @if (tech.bestSeasons?.length) {
                    <div class="flex flex-wrap gap-1.5 mt-3">
                      @for (s of tech.bestSeasons; track s) {
                        <span class="text-xs font-medium text-forest-700 bg-forest-50 border border-forest-100 px-2.5 py-1 rounded-full">{{ s }}</span>
                      }
                    </div>
                  }
                  @if (tech.proTip) {
                    <div class="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <p class="text-xs font-semibold text-amber-700 mb-1">💡 Conseil pro</p>
                      <p class="text-xs text-amber-800">{{ tech.proTip }}</p>
                    </div>
                  }
                  @if (tech.commonMistake) {
                    <div class="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <p class="text-xs font-semibold text-red-600 mb-1">⚠️ Erreur courante</p>
                      <p class="text-xs text-red-700">{{ tech.commonMistake }}</p>
                    </div>
                  }
                </div>
              }
            } @else {
              <div class="text-center py-16 text-warm-400">
                <p class="text-4xl mb-3 opacity-20">🎣</p>
                <p class="text-sm">Aucune technique référencée</p>
              </div>
            }
          </div>
        }

        <!-- MATÉRIEL -->
        @if (activeTab() === 'equipment') {
          <div class="space-y-6">
            @if (species.equipment.length) {
              @for (tier of budgetTiers; track tier) {
                @if (equipmentByTier(tier).length > 0) {
                  <div>
                    <div class="flex items-center gap-2 mb-3">
                      <span class="text-lg">{{ budgetIcon(tier) }}</span>
                      <h3 class="text-sm font-semibold text-warm-700">{{ budgetLabel(tier) }}</h3>
                    </div>
                    <div class="space-y-2">
                      @for (item of equipmentByTier(tier); track item.name) {
                        <div [class]="budgetBorderClass(tier)"
                             class="bg-white border rounded-xl p-4 flex items-start gap-3">
                          @if (item.essential) {
                            <span class="flex-shrink-0 mt-0.5 text-xs font-bold text-white bg-forest-600 px-1.5 py-0.5 rounded">Must</span>
                          } @else {
                            <span class="flex-shrink-0 mt-0.5 text-xs font-medium text-warm-400 bg-warm-100 px-1.5 py-0.5 rounded">Opt.</span>
                          }
                          <div>
                            <p class="font-semibold text-sm text-warm-900">{{ item.name }}</p>
                            <p class="text-xs text-warm-500 mt-0.5 leading-relaxed">{{ item.description }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              }
            } @else {
              <div class="text-center py-16 text-warm-400">
                <p class="text-4xl mb-3 opacity-20">🔧</p>
                <p class="text-sm">Aucun matériel référencé</p>
              </div>
            }
          </div>
        }

        <!-- COMMUNAUTÉ -->
        @if (activeTab() === 'community') {
          <div class="space-y-5">

            <!-- Record FishDex -->
            @if (species.fishDexRecord) {
              <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p class="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">🏆 Record FishDex communautaire</p>
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-lg font-bold text-amber-900">{{ species.fishDexRecord.weight }} kg · {{ species.fishDexRecord.length }} cm</p>
                    <p class="text-xs text-amber-700 mt-0.5">par <strong>{{ species.fishDexRecord.username }}</strong> · {{ species.fishDexRecord.date | date:'dd/MM/yyyy' }}</p>
                  </div>
                  <span class="text-3xl">🎖️</span>
                </div>
              </div>
            }

            <!-- Community tips -->
            <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-sm font-semibold text-warm-900">Conseils de la communauté</h2>
                <span class="text-xs text-warm-400">{{ species.communityTips.length }} conseil{{ species.communityTips.length > 1 ? 's' : '' }}</span>
              </div>

              @if (species.communityTips.length) {
                <div class="space-y-3 mb-5">
                  @for (tip of species.communityTips; track tip.id) {
                    <div class="flex gap-3 p-3 bg-warm-50 rounded-xl border border-warm-100">
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold text-warm-700 mb-1">{{ tip.authorUsername }}</p>
                        <p class="text-sm text-warm-700 leading-relaxed">{{ tip.content }}</p>
                      </div>
                      <button (click)="upvoteTip(tip)"
                              [class.text-forest-600]="tip.hasUpvoted"
                              [class.text-warm-400]="!tip.hasUpvoted"
                              class="flex flex-col items-center gap-0.5 flex-shrink-0 hover:text-forest-600 transition-colors">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4l8 8H4l8-8z"/>
                        </svg>
                        <span class="text-xs font-semibold">{{ tip.upvotes }}</span>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-sm text-warm-400 text-center py-4">Sois le premier à partager un conseil !</p>
              }

              <!-- Add tip (logged in) -->
              @if (isLoggedIn()) {
                <div class="border-t border-warm-100 pt-4">
                  <textarea [(ngModel)]="newTipContent" rows="2"
                            placeholder="Partage un conseil, une technique, une astuce..."
                            class="w-full px-3.5 py-2.5 text-sm bg-warm-50 border border-warm-200 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all resize-none text-warm-900 placeholder-warm-400 mb-2">
                  </textarea>
                  <button (click)="submitTip()" [disabled]="!newTipContent.trim() || submittingTip"
                          class="w-full py-2 text-sm font-semibold text-white bg-forest-600 rounded-xl hover:bg-forest-700 disabled:opacity-40 transition-all">
                    @if (submittingTip) { Envoi... } @else { Publier le conseil }
                  </button>
                </div>
              } @else {
                <div class="border-t border-warm-100 pt-4 text-center">
                  <a routerLink="/login" class="text-sm text-forest-600 font-semibold hover:underline">
                    Connecte-toi pour partager un conseil →
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
export class SpeciesDetailComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private speciesService = inject(SpeciesService);
  private auth           = inject(AuthService);
  private toast          = inject(ToastService);

  isLoggedIn = toSignal(this.auth.currentUser$, { initialValue: this.auth.currentUser$.getValue() });

  species: Species | null = null;
  loading  = true;
  error    = '';
  activeTab = signal<Tab>('general');
  tabs = TABS;

  newTipContent  = '';
  submittingTip  = false;

  readonly calendarLegend = Object.entries(STATUS_CONFIG)
    .filter(([k]) => k !== 'CLOSED')
    .map(([k, v]) => ({ status: k as SeasonStatus, ...v }));

  readonly budgetTiers: BudgetTier[] = ['BUDGET', 'MID', 'PRO'];

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.speciesService.getSpeciesById(id).subscribe({
      next: res  => { this.species = res.data; this.loading = false; },
      error: err => { this.error = err.error?.message ?? 'Espèce introuvable'; this.loading = false; },
    });
  }

  // ── Calendar helpers ─────────────────────────────────────────────────────
  monthName(n: number): string        { return MONTH_NAMES[n - 1]; }
  monthStatusLabel(m: MonthActivity): string {
    if (m.legalClosure) return 'Fermé';
    return STATUS_CONFIG[m.status]?.label ?? m.status;
  }
  monthBg(m: MonthActivity): string   {
    if (m.legalClosure) return 'bg-gray-200';
    return STATUS_CONFIG[m.status]?.bg ?? 'bg-warm-200';
  }
  monthText(m: MonthActivity): string {
    if (m.legalClosure) return 'text-gray-500 text-xs';
    return (STATUS_CONFIG[m.status]?.text ?? 'text-warm-700') + ' text-xs';
  }

  // ── Activity chart helpers ────────────────────────────────────────────────
  hourBarClass(hour: number): string {
    if (hour < 5 || hour >= 22) return 'bg-indigo-800';
    if (hour < 7 || hour >= 20) return 'bg-amber-400';
    if (hour < 10)              return 'bg-sky-400';
    if (hour >= 18)             return 'bg-orange-400';
    return 'bg-sky-200';
  }

  // ── Classification helpers ────────────────────────────────────────────────
  difficultyLabel(d: string): string { return (DIFFICULTY_CONFIG as any)[d]?.label ?? d; }
  difficultyClass(d: string): string { return (DIFFICULTY_CONFIG as any)[d]?.color ?? 'bg-warm-100 text-warm-600 border-warm-200'; }

  waterTypeLabel(wt: string): string {
    const map: Record<string, string> = { FRESHWATER:'Eau douce', SALTWATER:'Mer', BRACKISH:'Saumâtre' };
    return map[wt] ?? wt;
  }

  // ── Bait helpers ──────────────────────────────────────────────────────────
  baitTypeLabel(t: string): string { return BAIT_TYPE_LABELS[t] ?? t; }

  // ── Equipment helpers ─────────────────────────────────────────────────────
  equipmentByTier(tier: BudgetTier) {
    return this.species?.equipment?.filter(e => e.budget === tier) ?? [];
  }
  budgetLabel(tier: BudgetTier): string  { return BUDGET_CONFIG[tier].label; }
  budgetIcon(tier: BudgetTier): string   { return BUDGET_CONFIG[tier].icon; }
  budgetBorderClass(tier: BudgetTier): string { return BUDGET_CONFIG[tier].color; }

  // ── Community ─────────────────────────────────────────────────────────────
  upvoteTip(tip: { id: number; upvotes: number; hasUpvoted: boolean }): void {
    if (!this.isLoggedIn()) { this.toast.info('Connecte-toi pour voter'); return; }
    tip.hasUpvoted ? tip.upvotes-- : tip.upvotes++;
    tip.hasUpvoted = !tip.hasUpvoted;
    this.speciesService.upvoteTip(tip.id).subscribe({ error: () => {
      tip.hasUpvoted ? tip.upvotes-- : tip.upvotes++;
      tip.hasUpvoted = !tip.hasUpvoted;
    }});
  }

  submitTip(): void {
    if (!this.newTipContent.trim() || !this.species) return;
    this.submittingTip = true;
    this.speciesService.addCommunityTip(this.species.id, this.newTipContent.trim()).subscribe({
      next: () => {
        this.toast.success('Conseil publié !');
        if (this.species!.communityTips == null) this.species!.communityTips = [];
        this.species!.communityTips.unshift({
          id:             Date.now(),
          content:        this.newTipContent.trim(),
          authorUsername: (this.auth.currentUser$.getValue()?.username ?? 'Moi'),
          upvotes:        0,
          hasUpvoted:     false,
          createdAt:      new Date().toISOString(),
        });
        this.newTipContent = '';
        this.submittingTip = false;
      },
      error: () => {
        this.toast.error('Impossible de publier le conseil');
        this.submittingTip = false;
      },
    });
  }
}
