import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  styles: [`
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp .35s cubic-bezier(.22,.68,0,1.2) both; }

    /* Remove tap highlight on mobile */
    button, a { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }

    /* Focus-visible ring */
    :focus-visible { outline: 2px solid #2d6a4f; outline-offset: 2px; border-radius: 4px; }

    /* Smooth shake for error */
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-6px); }
      40%     { transform: translateX(6px); }
      60%     { transform: translateX(-4px); }
      80%     { transform: translateX(4px); }
    }
    .shake { animation: shake .4s ease; }
  `],
  template: `
    <!-- Skip link accessibilité -->
    <a href="#main-content"
       class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-forest-700 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
      Passer au contenu principal
    </a>

    <div class="min-h-screen flex bg-warm-50">

      <!-- ── Panneau gauche (desktop only) ─────────────────────────────── -->
      <aside class="hidden lg:flex lg:w-[45%] xl:w-2/5 flex-col justify-between p-12
                    bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700
                    text-white relative overflow-hidden"
             aria-hidden="true">

        <!-- Cercles décoratifs -->
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none"></div>
        <div class="absolute bottom-0 -left-12 w-72 h-72 rounded-full bg-white/5 pointer-events-none"></div>

        <!-- Logo -->
        <div class="relative flex items-center gap-2.5">
          <span class="text-2xl" aria-hidden="true">🎣</span>
          <span class="text-lg font-bold tracking-tight">FishDex</span>
        </div>

        <!-- Corps -->
        <div class="relative space-y-8">
          <blockquote class="space-y-4">
            <p class="text-3xl font-semibold leading-snug tracking-tight">
              Ton carnet de pêche<br>numérique.
            </p>
            <p class="text-forest-200 text-sm leading-relaxed max-w-xs">
              Enregistre tes captures, identifie les espèces et rejoins une communauté passionnée.
            </p>
          </blockquote>

          <!-- Stats mini -->
          <div class="grid grid-cols-2 gap-3">
            @for (stat of stats; track stat.label) {
              <div class="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p class="text-2xl font-bold">{{ stat.value }}</p>
                <p class="text-forest-300 text-xs mt-0.5">{{ stat.label }}</p>
              </div>
            }
          </div>

          <!-- Témoignage -->
          <figure class="border-l-2 border-forest-400 pl-4">
            <blockquote class="text-sm text-forest-100 italic leading-relaxed">
              "FishDex m'a transformé en pêcheur organisé. Je retrouve chaque spot en un clic."
            </blockquote>
            <figcaption class="mt-2 text-xs text-forest-400">— Julien R., pêcheur depuis 12 ans</figcaption>
          </figure>
        </div>

        <p class="relative text-forest-500 text-xs">© 2026 FishDex. Tous droits réservés.</p>
      </aside>

      <!-- ── Panneau droit ───────────────────────────────────────────────── -->
      <main id="main-content" class="flex-1 flex flex-col justify-center items-center
                                     px-6 py-12 bg-warm-50 min-h-screen"
            role="main">
        <div class="w-full max-w-sm fade-up">

          <!-- Logo mobile -->
          <div class="lg:hidden text-center mb-10" aria-hidden="true">
            <span class="text-4xl">🎣</span>
            <p class="mt-2 font-bold text-warm-900 tracking-tight">FishDex</p>
          </div>

          <!-- Titre -->
          <header class="mb-8">
            <h1 class="text-2xl font-bold text-warm-900 tracking-tight">Bon retour !</h1>
            <p class="mt-1 text-sm text-warm-500">Connecte-toi pour accéder à ton carnet.</p>
          </header>

          <!-- ── Google OAuth ─────────────────────────────────────────── -->
          <button type="button" (click)="loginWithGoogle()"
                  class="w-full flex items-center justify-center gap-3 px-4 py-3
                         bg-white border border-warm-200 rounded-2xl text-sm font-medium
                         text-warm-800 hover:bg-warm-50 hover:border-warm-300
                         active:scale-[.98] transition-all shadow-sm"
                  aria-label="Continuer avec Google">
            <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          <div class="flex items-center gap-3 my-6" role="separator" aria-label="ou par email">
            <div class="flex-1 h-px bg-warm-200" aria-hidden="true"></div>
            <span class="text-xs text-warm-400 font-medium">ou</span>
            <div class="flex-1 h-px bg-warm-200" aria-hidden="true"></div>
          </div>

          <!-- ── Formulaire ───────────────────────────────────────────── -->
          <form [formGroup]="form" (ngSubmit)="submit()" novalidate
                [class.shake]="shake()"
                (animationend)="shake.set(false)"
                aria-label="Formulaire de connexion"
                class="space-y-5">

            <!-- Email -->
            <div>
              <label for="login-email"
                     class="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-1.5">
                Adresse e-mail
              </label>
              <input id="login-email"
                     type="email"
                     formControlName="email"
                     autocomplete="email"
                     inputmode="email"
                     [attr.aria-invalid]="touched('email') && invalid('email') ? 'true' : null"
                     aria-describedby="email-error"
                     class="w-full px-4 py-3 text-sm bg-white border rounded-2xl
                            outline-none transition-all placeholder-warm-400 text-warm-900
                            focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500"
                     [class.border-red-300]="touched('email') && invalid('email')"
                     [class.border-warm-200]="!(touched('email') && invalid('email'))"
                     placeholder="prenom@exemple.fr">
              @if (touched('email') && invalid('email')) {
                <p id="email-error" role="alert" class="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <svg class="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                  </svg>
                  Adresse e-mail invalide
                </p>
              }
            </div>

            <!-- Mot de passe -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="login-password"
                       class="text-xs font-semibold text-warm-600 uppercase tracking-wide">
                  Mot de passe
                </label>
                <a routerLink="/forgot-password"
                   class="text-xs text-forest-600 hover:text-forest-800 font-medium transition-colors"
                   aria-label="Réinitialiser votre mot de passe oublié">
                  Mot de passe oublié ?
                </a>
              </div>
              <div class="relative">
                <input id="login-password"
                       [type]="showPw() ? 'text' : 'password'"
                       formControlName="password"
                       autocomplete="current-password"
                       [attr.aria-invalid]="touched('password') && invalid('password') ? 'true' : null"
                       class="w-full px-4 py-3 pr-12 text-sm bg-white border border-warm-200 rounded-2xl
                              outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500
                              transition-all placeholder-warm-400 text-warm-900"
                       placeholder="••••••••">
                <!-- Bouton show/hide password -->
                <button type="button"
                        (click)="showPw.update(v => !v)"
                        [attr.aria-label]="showPw() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                        [attr.aria-pressed]="showPw()"
                        class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1
                               text-warm-400 hover:text-warm-700 transition-colors rounded-lg">
                  @if (showPw()) {
                    <!-- Eye-off -->
                    <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                               a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243
                               M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29
                               M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7
                               a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  } @else {
                    <!-- Eye -->
                    <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
                               9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- Remember me -->
            <label class="flex items-center gap-3 cursor-pointer select-none group w-fit">
              <input type="checkbox"
                     formControlName="rememberMe"
                     class="w-4 h-4 rounded border-warm-300 text-forest-600
                            focus:ring-forest-500 cursor-pointer"
                     aria-describedby="remember-hint">
              <span class="text-sm text-warm-600 group-hover:text-warm-800 transition-colors">
                Rester connecté
              </span>
            </label>
            <p id="remember-hint" class="sr-only">Votre session restera active pendant 30 jours sur cet appareil.</p>

            <!-- Erreur générale -->
            @if (error()) {
              <div role="alert" aria-live="assertive"
                   class="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-2xl">
                <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                </svg>
                <p class="text-xs text-red-700 leading-relaxed">{{ error() }}</p>
              </div>
            }

            <!-- Verrouillage temporaire -->
            @if (locked()) {
              <div role="alert" aria-live="polite"
                   class="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                <svg class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd"/>
                </svg>
                <div class="text-xs text-amber-800 leading-relaxed">
                  <p class="font-semibold">Trop de tentatives</p>
                  <p class="mt-0.5">Réessaie dans <strong>{{ lockTimer() }}</strong>.</p>
                </div>
              </div>
            }

            <!-- Bouton submit -->
            <button type="submit"
                    [disabled]="loading() || form.invalid || locked()"
                    class="w-full py-3 bg-forest-600 text-white text-sm font-semibold rounded-2xl
                           hover:bg-forest-700 active:scale-[.98]
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all shadow-sm shadow-forest-900/20 mt-1"
                    [attr.aria-busy]="loading()">
              @if (loading()) {
                <span class="flex items-center justify-center gap-2" aria-label="Connexion en cours…">
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                        aria-hidden="true"></span>
                  Connexion…
                </span>
              } @else {
                Se connecter
              }
            </button>
          </form>

          <!-- ── Pied de formulaire ───────────────────────────────────── -->
          <footer class="mt-8 space-y-4 text-center">
            <p class="text-sm text-warm-500">
              Pas encore de compte ?
              <a routerLink="/register"
                 class="font-semibold text-forest-700 hover:text-forest-900 hover:underline ml-1 transition-colors">
                S'inscrire gratuitement
              </a>
            </p>

            <!-- Sécurité micro-badge -->
            <div class="flex items-center justify-center gap-1.5 text-xs text-warm-400"
                 aria-label="Connexion sécurisée HTTPS">
              <svg class="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd"/>
              </svg>
              Connexion chiffrée HTTPS
            </div>
          </footer>
        </div>
      </main>
    </div>
  `,
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb    = inject(FormBuilder);
  private auth  = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private toast  = inject(ToastService);
  private cdr    = inject(ChangeDetectorRef);

  // ── Signals ────────────────────────────────────────────────────────────────
  showPw   = signal(false);
  loading  = signal(false);
  error    = signal('');
  locked   = signal(false);
  lockTimer = signal('');
  shake    = signal(false);

  private attempts  = 0;
  private lockSub: Subscription | null = null;
  private returnUrl = '/captures';

  readonly stats = [
    { value: '4 M+',  label: 'Pêcheurs actifs' },
    { value: '320+',  label: 'Espèces référencées' },
    { value: '12 M+', label: 'Captures enregistrées' },
    { value: '98%',   label: 'Satisfaction' },
  ];

  form = this.fb.group({
    email:      ['', [Validators.required, Validators.email]],
    password:   ['', Validators.required],
    rememberMe: [false],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/captures']);
      return;
    }
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/captures';
  }

  ngOnDestroy(): void { this.lockSub?.unsubscribe(); }

  // ── Helpers ────────────────────────────────────────────────────────────────

  touched(field: string): boolean { return !!this.form.get(field)?.touched; }
  invalid(field: string): boolean { return !!this.form.get(field)?.invalid; }

  loginWithGoogle(): void { this.auth.loginWithGoogle(); }

  // ── Submit ─────────────────────────────────────────────────────────────────

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.locked()) return;

    this.loading.set(true);
    this.error.set('');
    const { email, password, rememberMe } = this.form.value;

    this.auth.login(email!, password!, rememberMe ?? false).subscribe({
      next: res => {
        this.loading.set(false);
        this.attempts = 0;
        if (!res.success) {
          this.triggerError(res.message ?? 'Erreur lors de la connexion.');
          return;
        }
        if (res.data?.requiresTwoFactor) {
          this.router.navigate(['/2fa']);
        } else {
          this.toast.success('Connexion réussie !');
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: err => {
        this.loading.set(false);
        this.attempts++;
        if (this.attempts >= 5) {
          this.startLockTimer(15 * 60);
        } else {
          const remaining = 5 - this.attempts;
          const msg = remaining === 1
            ? 'Email ou mot de passe incorrect. Dernier essai avant verrouillage.'
            : `Email ou mot de passe incorrect. ${remaining} tentatives restantes.`;
          this.triggerError(msg);
        }
      },
    });
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private triggerError(msg: string): void {
    this.error.set(msg);
    this.shake.set(false);
    // Use setTimeout to re-trigger animation if it was already running
    setTimeout(() => { this.shake.set(true); this.cdr.markForCheck(); }, 10);
  }

  private startLockTimer(seconds: number): void {
    this.locked.set(true);
    this.error.set('');
    let remaining = seconds;
    this.updateLockLabel(remaining);
    this.lockSub?.unsubscribe();
    this.lockSub = interval(1000).subscribe(() => {
      remaining--;
      this.updateLockLabel(remaining);
      if (remaining <= 0) {
        this.locked.set(false);
        this.attempts = 0;
        this.lockSub?.unsubscribe();
        this.cdr.markForCheck();
      }
    });
  }

  private updateLockLabel(s: number): void {
    const m   = Math.floor(s / 60);
    const sec = s % 60;
    this.lockTimer.set(`${m}:${sec.toString().padStart(2, '0')}`);
    this.cdr.markForCheck();
  }
}
