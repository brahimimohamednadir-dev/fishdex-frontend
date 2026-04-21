import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
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
            Ton carnet de pêche<br>numérique.
          </p>
          <p class="mt-4 text-forest-200 text-sm leading-relaxed max-w-sm">
            Enregistre tes captures, découvre les espèces et rejoins une communauté de 4 millions de pêcheurs.
          </p>
        </div>
        <p class="text-forest-500 text-xs">© 2026 FishDex</p>
      </div>

      <!-- Panneau droit -->
      <div class="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-warm-100">
        <div class="w-full max-w-sm">

          <div class="lg:hidden text-center mb-10">
            <span class="text-3xl">🎣</span>
            <p class="mt-2 font-semibold text-warm-900">FishDex</p>
          </div>

          <h1 class="text-2xl font-semibold text-warm-900 tracking-tight">Connexion</h1>
          <p class="mt-1 text-sm text-warm-500">Bon retour parmi nous.</p>

          <!-- Google OAuth -->
          <button type="button" (click)="loginWithGoogle()"
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

            <!-- Email -->
            <div>
              <label class="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-1.5">Email</label>
              <input type="email" formControlName="email"
                     class="w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl outline-none transition-all placeholder-warm-400 text-warm-900"
                     [class.border-red-300]="touched('email') && invalid('email')"
                     [class.border-warm-300]="!touched('email') || !invalid('email')"
                     [class.focus:border-forest-500]="true"
                     placeholder="prenom@email.fr">
              @if (touched('email') && invalid('email')) {
                <p class="text-xs text-red-500 mt-1">Email invalide</p>
              }
            </div>

            <!-- Mot de passe -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-semibold text-warm-600 uppercase tracking-wide">Mot de passe</label>
                <a routerLink="/forgot-password" class="text-xs text-warm-500 hover:text-warm-900 transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
              <div class="relative">
                <input [type]="showPassword() ? 'text' : 'password'" formControlName="password"
                       class="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all placeholder-warm-400 text-warm-900"
                       placeholder="••••••••">
                <button type="button" (click)="showPassword.update(v => !v)"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-700 transition-colors">
                  @if (showPassword()) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- Remember me -->
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" formControlName="rememberMe"
                     class="w-4 h-4 rounded border-warm-300 text-forest-600 focus:ring-forest-500 cursor-pointer">
              <span class="text-sm text-warm-600">Rester connecté 30 jours</span>
            </label>

            @if (error) {
              <div class="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl">
                <span class="text-red-500 shrink-0 mt-0.5">⚠</span>
                <p class="text-xs text-red-600">{{ error }}</p>
              </div>
            }

            @if (locked) {
              <div class="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <span class="text-amber-500 shrink-0 mt-0.5">🔒</span>
                <p class="text-xs text-amber-700">
                  Compte temporairement verrouillé après 5 tentatives. Réessaie dans
                  <span class="font-semibold">{{ lockTimer }}</span>.
                </p>
              </div>
            }

            <button type="submit" [disabled]="loading || form.invalid || locked"
                    class="w-full py-2.5 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2">
              @if (loading) {
                <span class="flex items-center justify-center gap-2">
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Connexion...
                </span>
              } @else {
                Continuer →
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-warm-500">
            Pas de compte ?
            <a routerLink="/register" class="font-semibold text-warm-900 hover:underline ml-1">
              S'inscrire gratuitement
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private fb    = inject(FormBuilder);
  private auth  = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private toast  = inject(ToastService);

  showPassword = signal(false);
  loading = false; error = ''; locked = false; lockTimer = '';
  private attempts = 0;
  private lockInterval: ReturnType<typeof setInterval> | null = null;
  private returnUrl = '/captures';

  form = this.fb.group({
    email:      ['', [Validators.required, Validators.email]],
    password:   ['', Validators.required],
    rememberMe: [false],
  });

  ngOnInit(): void {
    // Rediriger si déjà connecté
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/captures']);
      return;
    }
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/captures';
  }

  touched(field: string): boolean { return !!this.form.get(field)?.touched; }
  invalid(field: string): boolean { return !!this.form.get(field)?.invalid; }

  loginWithGoogle(): void { this.auth.loginWithGoogle(); }

  submit(): void {
    if (this.form.invalid || this.locked) return;
    this.loading = true; this.error = '';
    const { email, password, rememberMe } = this.form.value;

    this.auth.login(email!, password!, rememberMe ?? false).subscribe({
      next: res => {
        this.loading = false;
        this.attempts = 0;
        if (res.data?.requiresTwoFactor) {
          this.router.navigate(['/2fa']);
        } else {
          this.toast.success('Connexion réussie !');
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: err => {
        this.loading = false;
        this.attempts++;
        if (this.attempts >= 5) {
          this.startLockTimer(15 * 60);
        } else {
          this.error = 'Email ou mot de passe incorrect.';
        }
      },
    });
  }

  private startLockTimer(seconds: number): void {
    this.locked = true; this.error = '';
    let remaining = seconds;
    this.updateLockLabel(remaining);
    this.lockInterval = setInterval(() => {
      remaining--;
      this.updateLockLabel(remaining);
      if (remaining <= 0) {
        this.locked = false; this.attempts = 0;
        if (this.lockInterval) clearInterval(this.lockInterval);
      }
    }, 1000);
  }

  private updateLockLabel(s: number): void {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    this.lockTimer = `${m}:${sec.toString().padStart(2, '0')}`;
  }
}
