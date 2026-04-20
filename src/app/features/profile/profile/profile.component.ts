import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, UserStats } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent, DecimalPipe],
  template: `
    <div class="max-w-2xl mx-auto px-5 py-8">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight mb-8">Mon profil</h1>

      @if (loading) { <app-loading-spinner /> }
      @else if (user) {

        <!-- Identité -->
        <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
              {{ user.username.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-bold text-gray-900">{{ user.username }}</p>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
              @if (user.isPremium) {
                <span class="inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  ⭐ Premium
                </span>
              } @else {
                <span class="inline-block mt-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  Freemium · {{ 50 - user.captureCount }} restantes
                </span>
              }
            </div>
          </div>
        </div>

        <!-- Stats -->
        @if (stats) {
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Captures</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.totalCaptures }}</p>
            </div>
            <div class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Poids total</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">
                {{ stats.totalWeight | number:'1.0-1' }}<span class="text-sm font-medium text-gray-500 ml-1">kg</span>
              </p>
            </div>
            @if (stats.biggestCatch) {
              <div class="col-span-2 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">🏆 Meilleure prise</p>
                <div class="flex items-center justify-between">
                  <p class="font-semibold text-gray-900">{{ stats.biggestCatch.speciesName }}</p>
                  <p class="text-sm font-bold text-gray-900">{{ stats.biggestCatch.weight }} kg · {{ stats.biggestCatch.length }} cm</p>
                </div>
              </div>
            }
            @if (stats.mostActiveMonth) {
              <div class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mois actif</p>
                <p class="text-sm font-bold text-gray-900 mt-1">{{ stats.mostActiveMonth }}</p>
              </div>
            }
            <div class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
                 [class.col-span-2]="!stats.mostActiveMonth">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Groupes</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ stats.joinedGroupsCount }}</p>
            </div>
          </div>
        }

        <!-- Modifier pseudo -->
        <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-4">
          <h2 class="text-sm font-semibold text-gray-900 mb-4">Modifier le pseudo</h2>
          <form [formGroup]="form" (ngSubmit)="save()">
            <input type="text" formControlName="username"
                   class="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all mb-3">
            @if (saveSuccess) {
              <p class="text-xs text-green-600 font-medium mb-3">✓ Pseudo mis à jour</p>
            }
            @if (saveError) {
              <p class="text-xs text-red-500 mb-3">{{ saveError }}</p>
            }
            <button type="submit" [disabled]="saving || form.invalid"
                    class="w-full py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-all">
              @if (saving) { Sauvegarde... } @else { Enregistrer }
            </button>
          </form>
        </div>

        <!-- Liens rapides -->
        <div class="grid grid-cols-2 gap-3">
          <a routerLink="/badges"
             class="flex items-center justify-center gap-2 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all">
            🏆 Mes badges
          </a>
          <a routerLink="/captures"
             class="flex items-center justify-center gap-2 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all">
            🎣 Mes captures
          </a>
        </div>
      }
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toast       = inject(ToastService);
  private fb = inject(FormBuilder);
  user: User | null = null; stats: UserStats | null = null;
  loading = true; saving = false; saveSuccess = false; saveError = '';
  form = this.fb.group({ username: ['', Validators.required] });

  ngOnInit(): void {
    this.userService.getMe().subscribe({
      next: res => { this.user = res.data; this.form.patchValue({ username: res.data.username }); this.loading = false; },
      error: () => (this.loading = false),
    });
    this.userService.getMyStats().subscribe({ next: res => (this.stats = res.data), error: () => {} });
  }

  save(): void {
    if (this.form.invalid || !this.user) return;
    this.saving = true; this.saveError = ''; this.saveSuccess = false;
    this.userService.updateMe(this.form.value.username!).subscribe({
      next: res => { this.user = res.data; this.authService.currentUser$.next(res.data); this.saveSuccess = true; this.saving = false; this.toast.success('Pseudo mis à jour !'); setTimeout(() => (this.saveSuccess = false), 3000); },
      error: err => { this.saveError = err.error?.message ?? 'Erreur'; this.toast.error(this.saveError); this.saving = false; },
    });
  }
}
