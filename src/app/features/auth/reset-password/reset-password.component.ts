import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { checkPasswordStrength } from '../../../core/utils/password-strength';

function confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.parent?.get('password')?.value ?? '';
  return control.value === password ? null : { mismatch: true };
}

function passwordRulesValidator(control: AbstractControl): ValidationErrors | null {
  const v = control.value ?? '';
  const ok = v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
  return ok ? null : { passwordRules: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-warm-100 flex items-center justify-center px-5">
      <div class="w-full max-w-sm">

        <div class="bg-white border border-warm-200 rounded-2xl p-8 shadow-sm">

          @if (!token) {
            <div class="text-center">
              <span class="text-3xl">⚠️</span>
              <h1 class="mt-4 text-lg font-semibold text-warm-900">Lien invalide</h1>
              <p class="mt-2 text-sm text-warm-500">Ce lien de réinitialisation est introuvable.</p>
              <a routerLink="/forgot-password"
                 class="inline-block mt-5 text-sm font-semibold text-forest-600 hover:underline">
                Nouvelle demande
              </a>
            </div>

          } @else if (success()) {
            <div class="text-center">
              <div class="w-14 h-14 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-5">
                <span class="text-2xl">🔓</span>
              </div>
              <h1 class="text-xl font-semibold text-warm-900 mb-2">Mot de passe modifié !</h1>
              <p class="text-sm text-warm-500 mb-6">
                Tu es maintenant connecté et tous tes autres appareils ont été déconnectés.
              </p>
              <a routerLink="/captures"
                 class="inline-flex items-center gap-2 px-6 py-2.5 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 transition-all">
                Continuer →
              </a>
            </div>

          } @else {
            <div class="mb-6">
              <h1 class="text-xl font-semibold text-warm-900 tracking-tight">Nouveau mot de passe</h1>
              <p class="mt-1 text-sm text-warm-500">Choisis un mot de passe fort.</p>
            </div>

            <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">

              <!-- Nouveau mot de passe -->
              <div>
                <label class="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-1.5">Nouveau mot de passe</label>
                <div class="relative">
                  <input [type]="showPw() ? 'text' : 'password'" formControlName="password"
                         (input)="onPasswordInput()"
                         class="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all placeholder-warm-400 text-warm-900"
                         placeholder="Minimum 8 caractères">
                  <button type="button" (click)="showPw.update(v => !v)"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-700 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </div>

                @if (pwStrength.score > 0) {
                  <div class="mt-2 space-y-1.5">
                    <div class="flex gap-1">
                      @for (i of [1,2,3,4]; track i) {
                        <div class="flex-1 h-1 rounded-full transition-all duration-300"
                             [class]="i <= pwStrength.score ? pwStrength.barColor : 'bg-warm-200'"></div>
                      }
                    </div>
                    <p class="text-xs font-medium"
                       [class.text-red-500]="pwStrength.score === 1"
                       [class.text-amber-500]="pwStrength.score === 2"
                       [class.text-forest-500]="pwStrength.score >= 3">
                      {{ pwStrength.label }}
                    </p>
                  </div>
                }
              </div>

              <!-- Confirmation -->
              <div>
                <label class="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-1.5">Confirmer</label>
                <input type="password" formControlName="confirmPassword"
                       class="w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all placeholder-warm-400 text-warm-900"
                       [class.border-red-300]="form.get('confirmPassword')?.touched && form.get('confirmPassword')?.hasError('mismatch')"
                       [class.border-warm-300]="!form.get('confirmPassword')?.touched"
                       [class.border-forest-300]="form.get('confirmPassword')?.touched && !form.get('confirmPassword')?.hasError('mismatch') && form.get('confirmPassword')?.value"
                       placeholder="••••••••">
                @if (form.get('confirmPassword')?.touched && form.get('confirmPassword')?.hasError('mismatch')) {
                  <p class="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                }
              </div>

              @if (error()) {
                <div class="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                  {{ error() }}
                </div>
              }

              <button type="submit" [disabled]="loading() || form.invalid"
                      class="w-full py-2.5 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 disabled:opacity-40 transition-all">
                @if (loading()) {
                  <span class="flex items-center justify-center gap-2">
                    <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Réinitialisation…
                  </span>
                } @else {
                  Réinitialiser →
                }
              </button>
            </form>
          }
        </div>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private fb    = inject(FormBuilder);
  private auth  = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private toast  = inject(ToastService);

  token   = '';
  showPw  = signal(false);
  loading = signal(false);
  success = signal(false);
  error   = signal('');
  pwStrength = checkPasswordStrength('');

  form = this.fb.group({
    password:        ['', [Validators.required, passwordRulesValidator]],
    confirmPassword: ['', [Validators.required, confirmPasswordValidator]],
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  onPasswordInput(): void {
    this.pwStrength = checkPasswordStrength(this.form.value.password ?? '');
    this.form.get('confirmPassword')?.updateValueAndValidity();
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.token) return;
    this.loading.set(true); this.error.set('');
    this.auth.resetPassword(this.token, this.form.value.password!).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Lien expiré ou invalide.');
        this.toast.error(this.error());
      },
    });
  }
}
