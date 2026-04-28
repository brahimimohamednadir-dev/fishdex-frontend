import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { checkPasswordStrength } from '../../../core/utils/password-strength';

function passwordRulesValidator(c: AbstractControl): ValidationErrors | null {
  const v = c.value ?? '';
  return v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v)
    ? null : { passwordRules: true };
}
function matchPassword(c: AbstractControl): ValidationErrors | null {
  return c.value === c.parent?.get('password')?.value ? null : { mismatch: true };
}

type Step = 1 | 2 | 3;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  styles: [`
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOut {
      from { opacity: 1; transform: translateX(0); }
      to   { opacity: 0; transform: translateX(-24px); }
    }
    .step-enter { animation: slideIn .28s cubic-bezier(.25,.46,.45,.94) both; }

    .field-input {
      width: 100%; padding: .625rem .875rem; font-size: .875rem;
      background: white; border: 1.5px solid #e5ddd0; border-radius: .75rem;
      outline: none; transition: border-color .15s, box-shadow .15s;
      color: #1c1917; font-family: inherit;
    }
    .field-input::placeholder { color: #a8a29e; }
    .field-input:focus { border-color: #3d6b4f; box-shadow: 0 0 0 3px rgba(61,107,79,.12); }
    .field-input.error { border-color: #f87171; }
    .field-input.valid { border-color: #4ade80; }

    .btn-primary {
      width: 100%; padding: .75rem; background: #2a5c35;
      color: white; font-size: .875rem; font-weight: 600;
      border-radius: .875rem; border: none; cursor: pointer;
      transition: background .15s, transform .1s, box-shadow .15s;
      display: flex; align-items: center; justify-content: center; gap: .5rem;
      font-family: inherit;
    }
    .btn-primary:hover:not(:disabled) { background: #1e4028; box-shadow: 0 4px 16px rgba(42,92,53,.3); }
    .btn-primary:active:not(:disabled) { transform: scale(.98); }
    .btn-primary:disabled { opacity: .45; cursor: not-allowed; }

    .btn-ghost {
      width: 100%; padding: .625rem; background: transparent; color: #78716c;
      font-size: .875rem; font-weight: 500; border: 1.5px solid #e5ddd0;
      border-radius: .875rem; cursor: pointer; transition: all .15s; font-family: inherit;
    }
    .btn-ghost:hover { background: #f5f0e8; color: #1c1917; border-color: #c5bdb4; }

    .spinner { width: 1rem; height: 1rem; border: 2px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .pw-bar { height: 4px; border-radius: 2px; transition: all .3s; }

    .progress-step {
      width: 2rem; height: 2rem; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: .75rem; font-weight: 700; transition: all .25s;
    }
    .progress-line { flex: 1; height: 2px; transition: background .25s; }

    input[type=checkbox] { accent-color: #2a5c35; width: 1.1rem; height: 1.1rem; cursor: pointer; }
  `],
  template: `
    <!-- Skip link for accessibility -->
    <a href="#main-content"
       class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-forest-700 focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold">
      Passer à la zone principale
    </a>

    <div class="min-h-screen flex" role="main">

      <!-- ── Panneau gauche (desktop) ─────────────────────────────── -->
      <aside class="hidden lg:flex lg:w-[44%] flex-col justify-between p-14"
             style="background:linear-gradient(160deg,#0e2214 0%,#1a3a20 100%);"
             aria-hidden="true">
        <a routerLink="/" class="flex items-center gap-2.5 text-white no-underline" aria-label="FishDex — retour à l'accueil">
          <span class="text-2xl">🎣</span>
          <span class="font-bold tracking-tight">FishDex</span>
        </a>

        <div>
          <!-- Témoignage -->
          <figure class="mb-10">
            <blockquote class="text-white/70 text-sm leading-relaxed italic mb-4">
              "Depuis que j'utilise FishDex, chaque sortie devient une donnée. Mes stats de progression
              m'ont aidé à doubler mes prises en 3 mois."
            </blockquote>
            <figcaption class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-forest-600 flex items-center justify-center text-white font-bold text-sm">M</div>
              <div>
                <p class="text-white text-sm font-semibold">Mathieu R.</p>
                <p class="text-white/40 text-xs">Pêcheur de carnassiers · Lyon</p>
              </div>
            </figcaption>
          </figure>

          <!-- Features -->
          <ul class="space-y-4" role="list">
            @for (f of sideFeatures; track f.icon) {
              <li class="flex items-center gap-3.5">
                <span class="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style="background:rgba(255,255,255,.07);">{{ f.icon }}</span>
                <div>
                  <p class="text-white text-sm font-semibold">{{ f.title }}</p>
                  <p class="text-white/40 text-xs">{{ f.sub }}</p>
                </div>
              </li>
            }
          </ul>
        </div>

        <!-- Trust badges -->
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-1.5 text-white/35 text-xs">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
            </svg>
            SSL / TLS
          </div>
          <div class="flex items-center gap-1.5 text-white/35 text-xs">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 000 6H4a3 3 0 000-6zm2.5 7a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm6.5 0h3a3 3 0 110 6h-3a3 3 0 110-6z" clip-rule="evenodd"/>
            </svg>
            RGPD conforme
          </div>
          <div class="flex items-center gap-1.5 text-white/35 text-xs">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            2FA disponible
          </div>
        </div>
      </aside>

      <!-- ── Zone principale ──────────────────────────────────────── -->
      <main id="main-content" class="flex-1 flex flex-col justify-center items-center px-5 py-10 bg-warm-50 overflow-y-auto">
        <div class="w-full max-w-[420px]">

          <!-- Logo mobile -->
          <div class="lg:hidden flex justify-center mb-8">
            <a routerLink="/" class="flex items-center gap-2 text-warm-900 no-underline" aria-label="FishDex accueil">
              <span class="text-2xl">🎣</span>
              <span class="font-bold tracking-tight">FishDex</span>
            </a>
          </div>

          <!-- Indicateur de progression -->
          <nav aria-label="Étapes d'inscription" class="flex items-center gap-2 mb-8">
            @for (s of [1,2,3]; track s) {
              <div class="progress-step"
                   [style.background]="step() >= s ? '#2a5c35' : '#e5ddd0'"
                   [style.color]="step() >= s ? 'white' : '#a8a29e'"
                   [attr.aria-current]="step() === s ? 'step' : null"
                   [attr.aria-label]="'Étape ' + s + (step() > s ? ' — terminée' : step() === s ? ' — en cours' : ' — à venir')">
                @if (step() > s) {
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                } @else {
                  {{ s }}
                }
              </div>
              @if (s < 3) {
                <div class="progress-line" [style.background]="step() > s ? '#2a5c35' : '#e5ddd0'" aria-hidden="true"></div>
              }
            }
          </nav>

          <!-- ════════════════════════
               ÉTAPE 1 — Compte
          ════════════════════════ -->
          @if (step() === 1) {
            <section class="step-enter" aria-labelledby="step1-title">
              <header class="mb-7">
                <h1 id="step1-title" class="text-2xl font-bold text-warm-900 tracking-tight">Crée ton compte</h1>
                <p class="mt-1 text-sm text-warm-500">Gratuit, sans carte bancaire.</p>
              </header>

              <!-- Google SSO -->
              <button type="button" (click)="registerWithGoogle()"
                      class="btn-ghost w-full flex items-center justify-center gap-3 mb-5"
                      aria-label="S'inscrire avec Google">
                <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </button>

              <div class="flex items-center gap-3 mb-5" role="separator" aria-label="ou">
                <div class="flex-1 h-px bg-warm-200" aria-hidden="true"></div>
                <span class="text-xs text-warm-400 font-medium">ou</span>
                <div class="flex-1 h-px bg-warm-200" aria-hidden="true"></div>
              </div>

              <form [formGroup]="step1Form" (ngSubmit)="nextStep()" novalidate class="space-y-4">

                <!-- Pseudo -->
                <div>
                  <label for="username" class="block text-xs font-semibold text-warm-700 mb-1.5">
                    Pseudo <span aria-hidden="true" class="text-red-400">*</span>
                  </label>
                  <input id="username" type="text" formControlName="username"
                         autocomplete="username"
                         class="field-input"
                         [class.error]="s1touched('username') && s1invalid('username')"
                         [class.valid]="s1touched('username') && !s1invalid('username')"
                         [attr.aria-invalid]="s1touched('username') && s1invalid('username') ? 'true' : null"
                         aria-describedby="username-hint username-error"
                         placeholder="TonPseudo"
                         required>
                  <p id="username-hint" class="text-xs text-warm-400 mt-1">3 à 50 caractères</p>
                  @if (s1touched('username') && s1invalid('username')) {
                    <p id="username-error" class="text-xs text-red-500 mt-0.5" role="alert" aria-live="polite">
                      Le pseudo doit faire entre 3 et 50 caractères
                    </p>
                  }
                </div>

                <!-- Email -->
                <div>
                  <label for="email" class="block text-xs font-semibold text-warm-700 mb-1.5">
                    Adresse email <span aria-hidden="true" class="text-red-400">*</span>
                  </label>
                  <input id="email" type="email" formControlName="email"
                         autocomplete="email"
                         class="field-input"
                         [class.error]="s1touched('email') && s1invalid('email')"
                         [class.valid]="s1touched('email') && !s1invalid('email')"
                         [attr.aria-invalid]="s1touched('email') && s1invalid('email') ? 'true' : null"
                         aria-describedby="email-error"
                         placeholder="prenom@email.fr"
                         required autocapitalize="none" autocorrect="off" spellcheck="false">
                  @if (s1touched('email') && s1invalid('email')) {
                    <p id="email-error" class="text-xs text-red-500 mt-0.5" role="alert" aria-live="polite">
                      Adresse email invalide
                    </p>
                  }
                </div>

                <button type="submit" class="btn-primary" [disabled]="step1Form.invalid" style="margin-top:1.5rem;">
                  Continuer
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </button>
              </form>
            </section>
          }

          <!-- ════════════════════════
               ÉTAPE 2 — Mot de passe
          ════════════════════════ -->
          @if (step() === 2) {
            <section class="step-enter" aria-labelledby="step2-title">
              <header class="mb-7">
                <h1 id="step2-title" class="text-2xl font-bold text-warm-900 tracking-tight">Sécurise ton compte</h1>
                <p class="mt-1 text-sm text-warm-500">Crée un mot de passe robuste.</p>
              </header>

              <form [formGroup]="step2Form" (ngSubmit)="nextStep()" novalidate class="space-y-5">

                <!-- Mot de passe -->
                <div>
                  <label for="password" class="block text-xs font-semibold text-warm-700 mb-1.5">
                    Mot de passe <span aria-hidden="true" class="text-red-400">*</span>
                  </label>
                  <div class="relative">
                    <input id="password"
                           [type]="showPw() ? 'text' : 'password'"
                           formControlName="password"
                           autocomplete="new-password"
                           class="field-input"
                           style="padding-right:2.75rem;"
                           [class.error]="s2touched('password') && s2invalid('password')"
                           [attr.aria-invalid]="s2touched('password') && s2invalid('password') ? 'true' : null"
                           aria-describedby="pw-strength pw-rules"
                           placeholder="Minimum 8 caractères"
                           (input)="onPwInput()"
                           required>
                    <button type="button" (click)="showPw.update(v => !v)"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-700 transition-colors p-1"
                            [attr.aria-label]="showPw() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                            [attr.aria-pressed]="showPw()">
                      @if (showPw()) {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        </svg>
                      } @else {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      }
                    </button>
                  </div>

                  <!-- Barre de force -->
                  @if (pwStrength.score > 0) {
                    <div id="pw-strength" class="mt-2.5" role="status" aria-live="polite" [attr.aria-label]="'Force du mot de passe : ' + pwStrength.label">
                      <div class="flex gap-1 mb-1.5" aria-hidden="true">
                        @for (i of [1,2,3,4]; track i) {
                          <div class="pw-bar flex-1"
                               [style.background]="i <= pwStrength.score ? barColor() : '#e5ddd0'"></div>
                        }
                      </div>
                      <p class="text-xs font-semibold"
                         [style.color]="pwStrength.score <= 1 ? '#ef4444' : pwStrength.score === 2 ? '#f59e0b' : '#22c55e'">
                        {{ pwStrength.label }}
                      </p>
                    </div>
                  }

                  <!-- Règles -->
                  <ul id="pw-rules" class="mt-2 space-y-0.5" aria-label="Règles du mot de passe">
                    @for (rule of pwStrength.rules; track rule.label) {
                      <li class="flex items-center gap-1.5 text-xs transition-colors"
                          [style.color]="rule.ok ? '#16a34a' : '#a8a29e'">
                        <span aria-hidden="true">{{ rule.ok ? '✓' : '○' }}</span>
                        <span>{{ rule.label }} <span class="sr-only">{{ rule.ok ? '— OK' : '— requis' }}</span></span>
                      </li>
                    }
                  </ul>
                </div>

                <!-- Confirmation -->
                <div>
                  <label for="confirmPassword" class="block text-xs font-semibold text-warm-700 mb-1.5">
                    Confirmer le mot de passe <span aria-hidden="true" class="text-red-400">*</span>
                  </label>
                  <input id="confirmPassword" type="password" formControlName="confirmPassword"
                         autocomplete="new-password"
                         class="field-input"
                         [class.error]="s2touched('confirmPassword') && step2Form.get('confirmPassword')?.hasError('mismatch')"
                         [class.valid]="s2touched('confirmPassword') && step2Form.get('confirmPassword')?.value && !step2Form.get('confirmPassword')?.hasError('mismatch')"
                         [attr.aria-invalid]="s2touched('confirmPassword') && step2Form.get('confirmPassword')?.hasError('mismatch') ? 'true' : null"
                         aria-describedby="confirm-error"
                         placeholder="••••••••"
                         required>
                  @if (s2touched('confirmPassword') && step2Form.get('confirmPassword')?.hasError('mismatch')) {
                    <p id="confirm-error" class="text-xs text-red-500 mt-0.5" role="alert" aria-live="polite">
                      Les mots de passe ne correspondent pas
                    </p>
                  }
                  @if (s2touched('confirmPassword') && step2Form.get('confirmPassword')?.value && !step2Form.get('confirmPassword')?.hasError('mismatch')) {
                    <p class="text-xs text-green-600 mt-0.5" aria-live="polite">✓ Correspondance confirmée</p>
                  }
                </div>

                <!-- Info sécurité -->
                <div class="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <svg class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                  <p class="text-xs text-blue-700 leading-relaxed">
                    Ton mot de passe est chiffré avec <strong>bcrypt</strong> — nous ne pouvons pas le lire.
                    Active la <strong>double authentification</strong> (2FA) après la connexion pour plus de sécurité.
                  </p>
                </div>

                <div class="flex gap-3 pt-2">
                  <button type="button" (click)="prevStep()" class="btn-ghost flex-1" aria-label="Retour à l'étape précédente">
                    ← Retour
                  </button>
                  <button type="submit" class="btn-primary flex-1" [disabled]="step2Form.invalid">
                    Continuer →
                  </button>
                </div>
              </form>
            </section>
          }

          <!-- ════════════════════════
               ÉTAPE 3 — Consentements RGPD
          ════════════════════════ -->
          @if (step() === 3) {
            <section class="step-enter" aria-labelledby="step3-title">
              <header class="mb-7">
                <h1 id="step3-title" class="text-2xl font-bold text-warm-900 tracking-tight">Tes données, ton contrôle</h1>
                <p class="mt-1 text-sm text-warm-500">Conformité RGPD — Article 7 du Règlement Européen.</p>
              </header>

              <form [formGroup]="step3Form" (ngSubmit)="submit()" novalidate class="space-y-4">

                <!-- Consentement requis -->
                <fieldset class="border-0 p-0 m-0">
                  <legend class="text-xs font-bold text-warm-700 uppercase tracking-wide mb-3">
                    Requis pour créer un compte
                  </legend>

                  <div class="space-y-3">

                    <!-- CGU -->
                    <label class="flex items-start gap-3 p-3.5 bg-white border border-warm-200 rounded-xl cursor-pointer hover:border-forest-300 transition-colors"
                           [class.border-forest-400]="step3Form.get('cgu')?.value"
                           [class.bg-forest-50]="step3Form.get('cgu')?.value">
                      <input type="checkbox" formControlName="cgu" id="cgu"
                             [attr.aria-required]="true"
                             aria-describedby="cgu-detail">
                      <div>
                        <p class="text-sm font-semibold text-warm-900">
                          Conditions Générales d'Utilisation
                          <span class="ml-1 text-xs text-red-500" aria-label="obligatoire">*</span>
                        </p>
                        <p id="cgu-detail" class="text-xs text-warm-500 mt-0.5 leading-relaxed">
                          J'accepte les
                          <a href="/terms" target="_blank" rel="noopener noreferrer"
                             class="text-forest-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-forest-500 rounded"
                             (click)="$event.stopPropagation()">CGU</a>
                          et la
                          <a href="/privacy" target="_blank" rel="noopener noreferrer"
                             class="text-forest-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-forest-500 rounded"
                             (click)="$event.stopPropagation()">Politique de confidentialité</a>.
                          Mes données sont hébergées en France.
                        </p>
                      </div>
                    </label>
                    @if (s3touched('cgu') && !step3Form.get('cgu')?.value) {
                      <p class="text-xs text-red-500 -mt-1 ml-1" role="alert">Obligatoire pour créer un compte</p>
                    }

                    <!-- Âge -->
                    <label class="flex items-start gap-3 p-3.5 bg-white border border-warm-200 rounded-xl cursor-pointer hover:border-forest-300 transition-colors"
                           [class.border-forest-400]="step3Form.get('ageVerified')?.value"
                           [class.bg-forest-50]="step3Form.get('ageVerified')?.value">
                      <input type="checkbox" formControlName="ageVerified" id="ageVerified"
                             [attr.aria-required]="true">
                      <div>
                        <p class="text-sm font-semibold text-warm-900">
                          Je confirme avoir 16 ans ou plus
                          <span class="ml-1 text-xs text-red-500" aria-label="obligatoire">*</span>
                        </p>
                        <p class="text-xs text-warm-500 mt-0.5">
                          Conformément au RGPD, le traitement des données des mineurs de moins de 16 ans
                          requiert l'accord parental.
                        </p>
                      </div>
                    </label>
                  </div>
                </fieldset>

                <!-- Consentements optionnels -->
                <fieldset class="border-0 p-0 m-0 pt-2">
                  <legend class="text-xs font-bold text-warm-700 uppercase tracking-wide mb-3">
                    Optionnel — tu peux changer d'avis à tout moment
                  </legend>

                  <div class="space-y-3">

                    <!-- Marketing -->
                    <label class="flex items-start gap-3 p-3.5 bg-white border border-warm-200 rounded-xl cursor-pointer hover:border-warm-300 transition-colors">
                      <input type="checkbox" formControlName="marketing">
                      <div>
                        <p class="text-sm font-semibold text-warm-900">Emails de nouveautés & conseils</p>
                        <p class="text-xs text-warm-500 mt-0.5">
                          Mises à jour du produit, conseils de pêche, nouvelles espèces.
                          Maximum 2 emails par mois. Désabonnement en 1 clic.
                        </p>
                      </div>
                    </label>

                    <!-- Analytics -->
                    <label class="flex items-start gap-3 p-3.5 bg-white border border-warm-200 rounded-xl cursor-pointer hover:border-warm-300 transition-colors">
                      <input type="checkbox" formControlName="analytics">
                      <div>
                        <p class="text-sm font-semibold text-warm-900">Amélioration du service</p>
                        <p class="text-xs text-warm-500 mt-0.5">
                          Statistiques d'usage anonymisées pour améliorer FishDex.
                          Aucune revente à des tiers.
                        </p>
                      </div>
                    </label>
                  </div>
                </fieldset>

                <!-- Info droits RGPD -->
                <div class="p-3.5 bg-warm-100 border border-warm-200 rounded-xl">
                  <p class="text-xs text-warm-600 leading-relaxed">
                    <strong class="text-warm-800">Tes droits RGPD :</strong>
                    accès, rectification, effacement, portabilité et opposition à tout moment depuis
                    ton profil ou en écrivant à
                    <a href="mailto:privacy@fishdex.fr"
                       class="text-forest-600 font-semibold hover:underline">privacy@fishdex.fr</a>.
                    Responsable de traitement : FishDex SAS.
                  </p>
                </div>

                @if (error()) {
                  <div class="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl"
                       role="alert" aria-live="assertive">
                    <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <p class="text-xs text-red-700">{{ error() }}</p>
                  </div>
                }

                <div class="flex gap-3 pt-2">
                  <button type="button" (click)="prevStep()" class="btn-ghost flex-1">
                    ← Retour
                  </button>
                  <button type="submit" class="btn-primary flex-1"
                          [disabled]="loading() || !step3Form.get('cgu')?.value || !step3Form.get('ageVerified')?.value">
                    @if (loading()) {
                      <span class="spinner" aria-hidden="true"></span>
                      <span>Création...</span>
                    } @else {
                      Créer mon compte
                    }
                  </button>
                </div>
              </form>
            </section>
          }

          <!-- Lien connexion -->
          <p class="mt-8 text-center text-sm text-warm-500">
            Déjà un compte ?
            <a routerLink="/login" class="font-semibold text-warm-900 hover:underline ml-1
                                         focus:outline-none focus:ring-2 focus:ring-forest-500 rounded">
              Se connecter
            </a>
          </p>

        </div>
      </main>
    </div>
  `,
})
export class RegisterComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toast  = inject(ToastService);

  step    = signal<Step>(1);
  loading = signal(false);
  error   = signal('');
  showPw  = signal(false);
  pwStrength = checkPasswordStrength('');

  sideFeatures = [
    { icon: '📸', title: 'Journal photo & GPS',     sub: 'Chaque prise immortalisée en quelques secondes' },
    { icon: '🐟', title: 'Encyclopédie 200+ espèces', sub: 'Identification, saisons, spots' },
    { icon: '📊', title: 'Statistiques & records',  sub: 'Ta progression visible mois par mois' },
    { icon: '👥', title: 'Communauté de pêcheurs',  sub: 'Groupes, amis, classements' },
  ];

  step1Form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email:    ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
  });

  step2Form = this.fb.group({
    password:        ['', [Validators.required, passwordRulesValidator]],
    confirmPassword: ['', [Validators.required, matchPassword]],
  });

  step3Form = this.fb.group({
    cgu:         [false, Validators.requiredTrue],
    ageVerified: [false, Validators.requiredTrue],
    marketing:   [false],
    analytics:   [false],
  });

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) this.router.navigate(['/captures']);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  s1touched(f: string) { return !!this.step1Form.get(f)?.touched; }
  s1invalid(f: string) { return !!this.step1Form.get(f)?.invalid; }
  s2touched(f: string) { return !!this.step2Form.get(f)?.touched; }
  s2invalid(f: string) { return !!this.step2Form.get(f)?.invalid; }
  s3touched(f: string) { return !!this.step3Form.get(f)?.touched; }

  barColor = computed(() => {
    const s = this.pwStrength.score;
    return s <= 1 ? '#ef4444' : s === 2 ? '#f59e0b' : s === 3 ? '#84cc16' : '#22c55e';
  });

  onPwInput(): void {
    this.pwStrength = checkPasswordStrength(this.step2Form.value.password ?? '');
    this.step2Form.get('confirmPassword')?.updateValueAndValidity();
  }

  // ── Navigation ───────────────────────────────────────────────────────────
  nextStep(): void {
    if (this.step() === 1) {
      this.step1Form.markAllAsTouched();
      if (this.step1Form.invalid) return;
      this.step.set(2);
    } else if (this.step() === 2) {
      this.step2Form.markAllAsTouched();
      if (this.step2Form.invalid) return;
      this.step.set(3);
    }
    // Scroll to top on step change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevStep(): void {
    if (this.step() > 1) this.step.update(s => (s - 1) as Step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  registerWithGoogle(): void { this.auth.loginWithGoogle(); }

  // ── Soumission finale ────────────────────────────────────────────────────
  submit(): void {
    this.step3Form.markAllAsTouched();
    if (!this.step3Form.get('cgu')?.value || !this.step3Form.get('ageVerified')?.value) return;

    this.loading.set(true);
    this.error.set('');

    const { username, email }           = this.step1Form.value;
    const { password }                  = this.step2Form.value;
    const { marketing, analytics }      = this.step3Form.value;

    this.auth.register(username!, email!, password!, true, {
      marketing:  !!marketing,
      analytics:  !!analytics,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/verify-email'], { queryParams: { email } });
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? "Une erreur est survenue. Réessaie.");
      },
    });
  }
}
