import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { checkPasswordStrength } from '../../../core/utils/password-strength';

function passwordRulesValidator(control: AbstractControl): ValidationErrors | null {
  const v = control.value ?? '';
  const ok = v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
  return ok ? null : { passwordRules: true };
}

function confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.parent?.get('password')?.value ?? '';
  return control.value === password ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-warm-100 flex">

      <!-- Panneau gauche -->
      <div class="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-forest-800 text-white">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🎣</span>
          <span class="font-semibold tracking-tight">FishDex</span>
        </div>
        <div>
          <p class="text-4xl font-semibold leading-tight tracking-tight">
            Rejoins 4 millions<br>de pêcheurs.
          </p>
          <div class="mt-8 space-y-3">
            @for (feat of features; track feat.icon) {
              <div class="flex items-center gap-3">
                <span class="text-xl">{{ feat.icon }}</span>
                <span class="text-sm text-forest-200">{{ feat.text }}</span>
              </div>
            }
          </div>
        </div>
        <p class="text-forest-500 text-xs">© 2026 FishDex · Gratuit jusqu'à 50 captures</p>
      </div>

      <!-- Panneau droit -->
      <div class="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-warm-100">
        <div class="w-full max-w-sm">

          <div class="lg:hidden text-center mb-10">
            <span class="text-3xl">🎣</span>
            <p class="mt-2 font-semibold text-warm-900">FishDex</p>
          </div>

          <h1 class="text-2xl font-semibold text-warm-900 tracking-tight">Créer un compte</h1>
          <p class="mt-1 text-sm text-warm-500">Gratuit, sans carte bancaire.</p>

          <!-- Google OAuth -->
          <button type="button" (click)="registerWithGoogle()"
                  class="mt-6 w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-warm-300 rounded-xl text-sm font-medium text-warm-800 hover:bg-warm-50 transition-all shadow-sm">
            <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          <div class="flex items-center gap-3 my-5">
            <div class="flex-1 h-px bg-warm-200"></div>
            <span class="text-xs text-warm-400 font-medium">ou</span>
            <div class="flex-1 h-px bg-warm-200"></div>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">

            <!-- Pseudo -->
            <div>
              <label class="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-1.5">Pseudo</label>
              <input type="text" formControlName="username"
                     class="w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all placeholder-warm-400 text-warm-900"
                     [class.border-red-300]="touched('username') && invalid('username')"
                     [class.border-warm-300]="!touched('username') || !invalid('username')"
                     placeholder="TonPseudo">
              @if (touched('username') && invalid('username')) {
                <p class="text-xs text-red-500 mt-1">Pseudo requis</p>
              }
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-1.5">Email</label>
              <input type="email" formControlName="email"
                     class="w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all placeholder-warm-400 text-warm-900"
                     [class.border-red-300]="touched('email') && invalid('email')"
                     [class.border-warm-300]="!touched('email') || !invalid('email')"
                     placeholder="prenom@email.fr">
              @if (touched('email') && invalid('email')) {
                <p class="text-xs text-red-500 mt-1">Email invalide</p>
              }
            </div>

            <!-- Mot de passe -->
            <div>
              <label class="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-1.5">Mot de passe</label>
              <div class="relative">
                <input [type]="showPassword() ? 'text' : 'password'" formControlName="password"
                       (input)="onPasswordInput()"
                       class="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all placeholder-warm-400 text-warm-900"
                       placeholder="Minimum 8 caractères">
                <button type="button" (click)="showPassword.update(v => !v)"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-700 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    @if (showPassword()) {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    } @else {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    }
                  </svg>
                </button>
              </div>

              <!-- Barre de force -->
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

              <!-- Règles -->
              @if (touched('password')) {
                <ul class="mt-2 space-y-0.5">
                  @for (rule of pwStrength.rules; track rule.label) {
                    <li class="flex items-center gap-1.5 text-xs transition-colors"
                        [class.text-forest-600]="rule.ok"
                        [class.text-warm-400]="!rule.ok">
                      <span>{{ rule.ok ? '✓' : '○' }}</span>
                      {{ rule.label }}
                    </li>
                  }
                </ul>
              }
            </div>

            <!-- Confirmer le mot de passe -->
            <div>
              <label class="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-1.5">Confirmer le mot de passe</label>
              <input type="password" formControlName="confirmPassword"
                     class="w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all placeholder-warm-400 text-warm-900"
                     [class.border-red-300]="touched('confirmPassword') && form.get('confirmPassword')?.hasError('mismatch')"
                     [class.border-forest-300]="touched('confirmPassword') && !form.get('confirmPassword')?.hasError('mismatch') && form.get('confirmPassword')?.value"
                     [class.border-warm-300]="!touched('confirmPassword')"
                     placeholder="••••••••">
              @if (touched('confirmPassword') && form.get('confirmPassword')?.hasError('mismatch')) {
                <p class="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
              }
              @if (touched('confirmPassword') && !form.get('confirmPassword')?.hasError('mismatch') && form.get('confirmPassword')?.value) {
                <p class="text-xs text-forest-600 mt-1">✓ Mots de passe identiques</p>
              }
            </div>

            <!-- RGPD — Consentement obligatoire -->
            <div class="flex items-start gap-3 p-3 bg-warm-50 border border-warm-200 rounded-xl">
              <input type="checkbox" formControlName="privacyAccepted" id="privacy"
                     class="mt-0.5 w-4 h-4 accent-forest-600 cursor-pointer shrink-0">
              <label for="privacy" class="text-xs text-warm-600 cursor-pointer leading-relaxed">
                J'ai lu et j'accepte les
                <a href="/privacy" target="_blank" class="text-forest-600 font-semibold hover:underline">Conditions d'utilisation</a>
                et la
                <a href="/privacy" target="_blank" class="text-forest-600 font-semibold hover:underline">Politique de confidentialité</a>.
                Mes données sont traitées conformément au RGPD.
              </label>
            </div>
            @if (touched('privacyAccepted') && form.get('privacyAccepted')?.invalid) {
              <p class="text-xs text-red-500 -mt-2">Vous devez accepter les conditions pour continuer</p>
            }

            @if (error) {
              <div class="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl">
                <span class="text-red-500 shrink-0 mt-0.5">⚠</span>
                <p class="text-xs text-red-600">{{ error }}</p>
              </div>
            }

            <button type="submit" [disabled]="loading || form.invalid"
                    class="w-full py-2.5 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2">
              @if (loading) {
                <span class="flex items-center justify-center gap-2">
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Création...
                </span>
              } @else {
                Créer mon compte →
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-warm-500">
            Déjà un compte ?
            <a routerLink="/login" class="font-semibold text-warm-900 hover:underline ml-1">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb    = inject(FormBuilder);
  private auth  = inject(AuthService);
  private router = inject(Router);
  private toast  = inject(ToastService);

  showPassword = signal(false);
  loading = false; error = '';
  pwStrength = checkPasswordStrength('');

  features = [
    { icon: '🎣', text: 'Journal de capture avec photos' },
    { icon: '🐟', text: 'Encyclopédie de 200+ espèces' },
    { icon: '🏆', text: 'Badges et défis gamifiés' },
    { icon: '👥', text: 'Groupes et fil social' },
  ];

  form = this.fb.group({
    username:        ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, passwordRulesValidator]],
    confirmPassword: ['', [Validators.required, confirmPasswordValidator]],
    privacyAccepted: [false, Validators.requiredTrue],
  });

  touched(field: string): boolean { return !!this.form.get(field)?.touched; }
  invalid(field: string): boolean { return !!this.form.get(field)?.invalid; }

  onPasswordInput(): void {
    this.pwStrength = checkPasswordStrength(this.form.value.password ?? '');
    // Re-valider la confirmation si déjà touchée
    this.form.get('confirmPassword')?.updateValueAndValidity();
  }

  registerWithGoogle(): void { this.auth.loginWithGoogle(); }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const { username, email, password } = this.form.value;
    this.auth.register(username!, email!, password!, true).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/verify-email'], { queryParams: { email } });
      },
      error: err => {
        this.error = err.error?.message ?? "Erreur lors de l'inscription.";
        this.toast.error(this.error);
        this.loading = false;
      },
    });
  }
}
